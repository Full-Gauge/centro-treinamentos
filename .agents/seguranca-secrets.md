# Segurança e secrets

- Nunca coloque `API_KEY` ou `JWT_SECRET` no frontend (`public/`). Eles vivem só no Worker (secrets do Wrangler).
- Nunca logue token, CPF, e-mail ou payload completo em claro.
- Rotas sensíveis devem validar `x-api-key` contra `env.API_KEY`. Atenção: `/api/validate-name` só valida se `env.API_KEY` existir — não use como autorização.
- JWT: os workers de confirmação/cancelamento decodificam o payload sem verificar assinatura (base64 puro). Não deposite confiança de segurança nisso; a autorização real passa pelos fluxos/Power Automate.
- Encurtador: código de 8 chars gerado com `Math.random` e redirecionamento para a URL gravada — valide a entrada e evite open redirect; para uso sensível prefira `crypto`.
- Valide as entradas nas fronteiras (e-mail, CPF, módulos) antes de enviar ao Power Automate.
- CORS: hoje várias rotas usam `Access-Control-Allow-Origin: *`. Mantenha consciente; não amplie sem necessidade.
- Não retorne mensagens internas cruas (stack, URL de upstream) ao usuário final.
