import { requirePowerAutomateHeaders } from "./power-automate.js";

export function handleTokenValidation(request, env) {
  return validateToken(request, env, "url_token");
}

export function handlePjTokenValidation(request, env) {
  return validateToken(request, env, "url_token_pj");
}

async function validateToken(request, env, secretName) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido.' }), { status: 405 });
  }

  const targetUrl = env[secretName];
  if (!targetUrl || targetUrl.includes("URL_DEFINIDA")) {
    return new Response(JSON.stringify({ error: `Configuração ${secretName} ausente.` }), { status: 500 });
  }

  try {
    const { token } = await request.json();

    if (secretName === "url_token_pj" && (typeof token !== "string" || !token.trim())) {
      return Response.json({ error: "Token é obrigatório." }, { status: 400 });
    }
    let headers = { 'Content-Type': 'application/json' };
    if (secretName === "url_token_pj") {
      const auth = requirePowerAutomateHeaders(env);
      if (auth.error) return auth.error;
      headers = auth.headers;
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 
        'Content-Type': 'application/json',
        'X-Source': 'Worker-Token-Validation'
      }
    });
  } catch {
    return new Response(JSON.stringify({ error: "Erro ao validar token." }), { status: 500 });
  }
}
