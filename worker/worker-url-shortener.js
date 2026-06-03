export async function handleShortenRequest(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { url } = await request.json();

    if (!url) {
      return new Response(JSON.stringify({ error: 'A URL original é obrigatória.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.URL_SHORTENER_KV) {
      return new Response(JSON.stringify({ error: 'Configuração URL_SHORTENER_KV (KV Namespace) ausente no Cloudflare.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Gera um código curto aleatório de 8 caracteres (alfanumérico)
    const shortCode = Math.random().toString(36).substring(2, 10);

    // Salva o mapeamento no KV com um tempo de expiração (ex: 24 horas = 86400 segundos)
    // Isso evita que o seu KV fique cheio de links antigos e irrelevantes
    await env.URL_SHORTENER_KV.put(shortCode, url, {
      expirationTtl: 86400 
    });

    // Se quiser que o link seja gerado dinamicamente para testes:
    const baseUrl = new URL(request.url).origin; 
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    return new Response(JSON.stringify({ shortUrl, code: shortCode }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: `Erro interno ao encurtar URL: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function handleRedirectRequest(request, env) {
  const url = new URL(request.url);
  // Extrai o código de /s/[codigo]. O filter remove strings vazias de "//"
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const shortCode = pathSegments[1]; 

  if (!shortCode || !env.URL_SHORTENER_KV) {
    return new Response('Link encurtado inválido.', { status: 400 });
  }

  try {
    const originalUrl = await env.URL_SHORTENER_KV.get(shortCode);

    if (originalUrl) {
      // Garante que se for um caminho relativo, ele seja tratado a partir da raiz (/)
      // Ex: se originalUrl for "page.html", vira "https://dominio.com/page.html"
      // e não "https://dominio.com/s/page.html"
      const targetPath = originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`;
      
      const destination = originalUrl.startsWith('http')
        ? originalUrl
        : new URL(targetPath, url.origin).href;

      return Response.redirect(destination, 302);
    }

    return new Response('Link encurtado não encontrado ou expirado.', { status: 404 });
  } catch (error) {
    return new Response(`Erro ao processar redirecionamento: ${error.message}`, { status: 500 });
  }
}