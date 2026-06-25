export async function handleCpfModulosValidationFlowRequest(request, env) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido. Use POST." }), {
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "POST" }
    });
  }

  const targetUrl = env.URL_VALIDATE_CPF_MODULOS;
  if (!targetUrl) {
    return new Response(
      JSON.stringify({
        error: "Configuração pendente: URL_VALIDATE_CPF_MODULOS não definida no painel da Cloudflare."
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const body = await request.json();
    const headers = {
      "Content-Type": "application/json"
    };

    if (env.API_KEY) {
      headers["x-api-key"] = env.API_KEY;
    }

    const upstreamResponse = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    const responseText = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get("content-type") || "application/json";

    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: `Erro ao validar CPF e módulos: ${error.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
