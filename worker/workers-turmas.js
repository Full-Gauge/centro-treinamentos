const POWER_AUTOMATE_WAIT_SECONDS = 60;

function isTurmasPayload(data) {
  return Boolean(data && Array.isArray(data.data));
}

function unwrapTurmasPayload(value, depth = 0) {
  if (isTurmasPayload(value)) return value;
  if (depth > 3 || value === null || value === undefined) return null;

  if (typeof value === "string") {
    try {
      return unwrapTurmasPayload(JSON.parse(value), depth + 1);
    } catch {
      return null;
    }
  }

  if (typeof value !== "object") return null;
  for (const key of ["body", "response", "properties"]) {
    const payload = unwrapTurmasPayload(value[key], depth + 1);
    if (payload) return payload;
  }
  return null;
}

function isPendingPowerAutomateResponse(data, status) {
  return status === 202 || data?.properties?.response?.status === "Waiting";
}

async function fetchTurmasFromPowerAutomate(targetUrl) {
  const upstream = await fetch(targetUrl, {
    headers: { Prefer: `wait=${POWER_AUTOMATE_WAIT_SECONDS}` }
  });
  const data = await upstream.json().catch(() => ({}));
  const payload = unwrapTurmasPayload(data);

  if (payload) return payload;

  if (isPendingPowerAutomateResponse(data, upstream.status)) {
    const location = upstream.headers.get("Location");
    if (location) {
      const completed = await fetch(location, {
        headers: { Prefer: `wait=${POWER_AUTOMATE_WAIT_SECONDS}` }
      });
      const completedData = await completed.json().catch(() => ({}));
      const completedPayload = unwrapTurmasPayload(completedData);
      if (completed.ok && completedPayload) return completedPayload;
    }

    throw new Error(
      `Power Automate não concluiu a consulta de turmas em ${POWER_AUTOMATE_WAIT_SECONDS}s.`
    );
  }

  throw new Error("A resposta da consulta de turmas não possui o formato esperado.");
}

export async function handleTurmasRequest(request, env, ctx) {
  const cache = caches.default;
  const cacheKey = request;
  
  // Tenta recuperar do cache
  let response = await cache.match(cacheKey);

  if (!response) {
    console.log("[Worker] Cache miss - Buscando turmas na origem.");
    const targetUrl = env.url_turmas;
    
    if (!targetUrl || targetUrl.includes("URL_DEFINIDA")) {
      return new Response(JSON.stringify({ error: "Configuração pendente: URL_TURMAS não definida no painel da Cloudflare." }), { 
        status: 500, headers: { "Content-Type": "application/json" } 
      });
    }

    try {
      const data = await fetchTurmasFromPowerAutomate(targetUrl);

      response = new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=3600", // Cache de 1 hora na borda
          "X-Source": "Workers-Turmas-Logic"
        },
      });

      // Armazena no cache para futuras requisições
      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } else {
    console.log("[Worker] Cache hit - Retornando dados otimizados.");
  }
  return response;
}

export { fetchTurmasFromPowerAutomate, isPendingPowerAutomateResponse, isTurmasPayload, unwrapTurmasPayload };
