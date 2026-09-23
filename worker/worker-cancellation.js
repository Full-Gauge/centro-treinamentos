import { requirePowerAutomateHeaders } from "./power-automate.js";
import { jsonError, verifyRegistrationToken } from "./jwt.js";

export async function handleCancellationRequest(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const cancellation = body.cancellation;
    let modules = Array.isArray(body.modules) ? body.modules : [];
    const allModules = body.all_modules === true;

    const normalizeModules = (items) =>
      Array.isArray(items)
        ? items
            .map((item) => {
              if (typeof item === "string") return item.trim();
              return (
                item?.modulo ||
                item?.value ||
                item?.label ||
                item?.name ||
                item?.NAME ||
                ""
              ).toString().trim();
            })
            .filter(Boolean)
        : [];

    modules = normalizeModules(modules);

    const tokenPayload = await verifyRegistrationToken(body.token, env);
    if (!tokenPayload?.email || !tokenPayload?.classId) {
      return jsonError("Token de inscrição inválido ou expirado.", 401);
    }

    const email = String(tokenPayload.email).trim();
    const codigo_turma = String(tokenPayload.classId).trim();
    const tokenModules = normalizeModules(tokenPayload.modules);
    modules = allModules
      ? tokenModules
      : modules.filter((module) => tokenModules.includes(module));

    if (!cancellation || !["Sim", "Não"].includes(String(cancellation))) {
      return jsonError("Cancelamento válido é obrigatório.", 400);
    }

        const webhookUrl = env.CANCELLATION_WEBHOOK_URL || env.CONFIRMATION_WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'Configuração CANCELLATION_WEBHOOK_URL (ou CONFIRMATION_WEBHOOK_URL) ausente no Cloudflare.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { headers, error } = requirePowerAutomateHeaders(env);
    if (error) return error;

    const flowResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: email,
        codigo_turma: codigo_turma,
        confirmacao_cancelamento: cancellation,
        modules: modules,
        all_modules: allModules
      })
    });

    const responseText = await flowResponse.text();

    return new Response(JSON.stringify({
      success: flowResponse.ok,
      upstreamStatus: flowResponse.status,
      upstreamBody: responseText
    }), {
      status: flowResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
