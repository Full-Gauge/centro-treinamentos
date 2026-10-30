export async function handleImpostosRequest(request, env) {
  const json = (body, status = 200) => Response.json(body, {
    status, headers: { "Cache-Control": "no-store" }
  });
  if (request.method !== "GET") {
    return new Response(null, { status: 405, headers: { Allow: "GET" } });
  }
  const cursoId = new URL(request.url).searchParams.get("cursoId")?.trim();
  if (!cursoId || cursoId.length > 20) return json({ error: "cursoId deve conter de 1 a 20 caracteres." }, 400);
  return getImpostosResponse(cursoId, env);
}

export async function getImpostosResponse(cursoId, env) {
  const json = (body, status = 200) => Response.json(body, {
    status, headers: { "Cache-Control": "no-store" }
  });
  if (!env.url_impostos || !env.POWER_AUTOMATE_WEBHOOK_TOKEN) {
    return json({ error: "Consulta de impostos não configurada." }, 500);
  }
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    const dataCalculo = `${date.year}-${date.month}-${date.day}`;
    const target = new URL(env.url_impostos);
    const response = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-ct-webhook-token": env.POWER_AUTOMATE_WEBHOOK_TOKEN },
      body: JSON.stringify({ cursoId, dataCalculo }),
      signal: AbortSignal.timeout(15000),
      redirect: "manual"
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => null);
      const upstreamCode = failure?.error?.code;
      return json({
        error: "A consulta de impostos foi recusada pelo serviço externo.",
        code: "tax_upstream_http", upstreamStatus: response.status,
        ...(typeof upstreamCode === "string" && /^[A-Za-z][A-Za-z0-9]{0,79}$/.test(upstreamCode) ? { upstreamCode } : {})
      }, 502);
    }
    let data;
    try {
      data = await response.json();
    } catch {
      return json({ error: "O serviço de impostos não retornou JSON válido.", code: "tax_invalid_json" }, 502);
    }
    if (data.cursoId !== cursoId || data.dataCalculo !== dataCalculo
      || !/^[A-Z]{3}$/.test(data.moeda) || !Number.isFinite(data.quantidade) || data.quantidade <= 0
      || !Array.isArray(data.cenarios) || !data.cenarios.length
      || data.cenarios.some((scenario) => !scenario || typeof scenario.tipo !== "string"
        || typeof scenario.descricao !== "string"
        || ![scenario.valorCurso, scenario.retencoes, scenario.liquidoAPagar].every((value) => Number.isFinite(value) && value >= 0)
        || !Array.isArray(scenario.impostos)
        || scenario.impostos.some((tax) => !tax || typeof tax.codigo !== "string" || typeof tax.descricao !== "string"
          || !Number.isFinite(tax.valor) || !Number.isFinite(tax.aliquotaOuValor) || typeof tax.retido !== "boolean"))) {
      return json({ error: "Resposta de impostos inválida.", code: "tax_invalid_response" }, 502);
    }
    return json(data);
  } catch (error) {
    return json({
      error: "Não foi possível conectar ao serviço de impostos.",
      code: error?.name === "TimeoutError" ? "tax_timeout" : "tax_fetch_failed"
    }, 502);
  }
}
