export async function handleParceirosRequest(request, env, ctx) {
  const cache = caches.default;
  const cacheKey = request;

  let response = await cache.match(cacheKey);

  if (!response) {
    const targetUrl = env.url_parceiros;

    if (!targetUrl || targetUrl.includes("URL_DEFINIDA")) {
      return new Response(JSON.stringify({ error: "Configuração pendente: url_parceiros não definida no painel da Cloudflare." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const res = await fetch(targetUrl);
      if (!res.ok) throw new Error(`Erro na API: ${res.status}`);

      const data = await res.json();
      const payload = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const parceiros = payload
        .map((item) => ({
          id: item.id ?? item.ID ?? item.value ?? "",
          name: item.name ?? item.NAME ?? item.label ?? ""
        }))
        .filter((item) => item.id && item.name);

      response = new Response(JSON.stringify(parceiros), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, s-maxage=1800",
          "X-Source": "Worker-Parceiros-Logic"
        }
      });

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return response;
}
