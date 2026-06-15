export async function handleRegisterRequest(request, env, ctx) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "POST" }
    });
  }

  const targetUrl = env.url_registro;

  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        error: "Configuração pendente: url_registro não definida no painel da Cloudflare."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const formData = await request.json();

    const upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: upstreamResponse.headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Erro ao processar o registro: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
