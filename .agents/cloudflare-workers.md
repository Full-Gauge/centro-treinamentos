# Cloudflare Workers — padrões do projeto

- Handler fino: cada `worker/*.js` exporta `handleXRequest(request, env, ctx)`; o roteamento fica só em `src/index.js`.
- Proxies do Power Automate usam `requirePowerAutomateHeaders(env)` (de `worker/power-automate.js`): ele injeta `Content-Type` e `x-api-key` e devolve 500 se `API_KEY` faltar. Não monte esses headers na mão.
- iPag (`worker/worker-ipag.js`) é a exceção: autentica com `Authorization: Basic base64(IPAG_API_ID:IPAG_API_KEY)` em `{IPAG_BASE_URL}/service/v2/payment_links` (não usa `x-api-key`).
- Cache de borda: `caches.default` + `ctx.waitUntil(cache.put(key, res.clone()))` e `Cache-Control: public, s-maxage=...` (turmas 3600; módulos e parceiros 1800).
- Arquivos estáticos: fallback `env.ASSETS.fetch(request)` (dir `public`, SPA). Não sirva estáticos por outra via.
- KV: `env.URL_SHORTENER_KV` com `put(code, url, { expirationTtl: 86400 })`; trate binding ausente com 500.
- Sempre valide método (405) e variável de ambiente ausente (500) antes de chamar o upstream.
- `compatibility_date` = `2026-05-27`. Deploy por ambiente: `wrangler.dev.jsonc` (dev) e `wrangler.prod.jsonc` (prod) — não use `wrangler.jsonc` para deploy de ambiente.
- Métodos: `turmas`, `modulos`, `parceiros` e `validate-name` aceitam GET e POST; `register`, `attendance`, `confirmation`, `cancellation` e `shorten-url` são POST.
