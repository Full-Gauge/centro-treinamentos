export async function verifyTurnstileToken(request, token, env, expectedAction) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: false, status: 500, error: "TURNSTILE_SECRET_KEY não configurada." };
  }

  if (typeof token !== "string" || !token.trim()) {
    return { ok: false, status: 403, error: "Validação humana obrigatória." };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") || undefined
      })
    });
    const result = await response.json();

    const requestHostname = new URL(request.url).hostname;
    if (
      !response.ok ||
      !result.success ||
      (expectedAction && result.action !== expectedAction) ||
      result.hostname !== requestHostname
    ) {
      return { ok: false, status: 403, error: "Validação humana inválida." };
    }

    return { ok: true, hostname: result.hostname || "" };
  } catch (error) {
    console.error(`[TURNSTILE] verification failed error=${error?.message || "network error"}`);
    return { ok: false, status: 502, error: "Não foi possível validar a verificação humana." };
  }
}

export function publicTurnstileConfig(env) {
  return new Response(JSON.stringify({
    turnstileSiteKey: env.TURNSTILE_SITE_KEY || ""
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
