# Convenções do projeto (Plataforma de Treinamentos - Full Gauge)

Siga estas regras em toda alteração neste repositório.

## Estrutura
- Frontend estático em `public/` (HTML + JS puro em `public/js/*`), sem framework.
- Backend em Cloudflare Workers: roteamento só em `src/index.js`, handlers em `worker/*.js`.
- Escopo oficial: `docs/escopo-projeto.md`. Guia interno: `codex.md`.

## Contratos que não podem quebrar
- `modules` é array real de strings (`string[]`). Array serializado como string NÃO é contrato válido.
- `all_modules` é boolean nos fluxos de cancelamento.
- JWT: `HS256`, validade `7d`, payload `{ classId, email, modules }`.
- Nos workers de confirmação/cancelamento o payload do JWT é lido em base64 (atob), sem verificar assinatura: trate como dado não confiável.
- Auth: rotas que falam com Power Automate enviam `x-api-key` = `env.API_KEY`. `/api/generate-jwt-register-attendance` exige `x-api-key` válido (401 caso contrário).
- Fallbacks de webhook: `CANCELLATION_WEBHOOK_URL || CONFIRMATION_WEBHOOK_URL` e `ATTENDANCE_WEBHOOK_URL || url_registro_presenca`.
- Normalização de módulo aceita: string direta ou `modulo | value | label | name | NAME`.

## Rotas de API (`src/index.js`)
- `GET/POST /api/turmas`
- `GET/POST /api/modulos?classId=`
- `GET/POST /api/parceiros`
- `POST /api/register`
- `POST /api/validate-token`
- `POST /api/confirmation`
- `POST /api/cancellation`
- `POST /api/attendance`
- `POST /api/generate-jwt-register-attendance`
- `POST /api/shorten-url`
- `GET /s/:code`
- `GET/POST /api/validate-name`
- `POST /api/validate-name-flow`
- `POST /api/validate-cpf-modulos-flow`
- `POST /api/payment-link`
- fallback: `env.ASSETS.fetch` (arquivos estáticos)

## Payloads enviados ao Power Automate
- `/api/cancellation` → `{ email, codigo_turma, confirmacao_cancelamento, modules, all_modules }`
- `/api/confirmation` → `{ email, codigo_turma, confirmacao_presencao }`
- `/api/attendance` → `{ email, confirmacao_presencao: "Sim" }`
- `/api/generate-jwt-register-attendance` → resposta `{ token }`
- `/api/payment-link` → link iPag (`{ link, uuid, amount, paymentMethod }`); usa Basic Auth, não `x-api-key`

## Variáveis de ambiente
- URLs: `url_registro`, `url_turmas`, `url_modulos`, `url_parceiros`, `url_token`, `url_registro_presenca`
- Webhooks: `ATTENDANCE_WEBHOOK_URL`, `CONFIRMATION_WEBHOOK_URL`, `CANCELLATION_WEBHOOK_URL`, `NAME_VALIDATION_WEBHOOK_URL`, `URL_VALIDATE_CPF_MODULOS`
- iPag: `IPAG_BASE_URL` (opcional), `IPAG_DEFAULT_DESCRIPTION`, `IPAG_LINK_EXPIRES_DAYS`; o valor atual do link é fixo em R$ 1.000,00 no Worker
- Webhook iPag: `POST /api/webhooks/ipag/payment-confirmed` usa `POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL`
- Secrets: `JWT_SECRET`, `API_KEY`, `IPAG_API_ID`, `IPAG_API_KEY`, `POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL`
- Binding KV: `URL_SHORTENER_KV`

## Regras
- Reutilize o que já existe (ex.: `worker/power-automate.js`). Não crie uma segunda implementação.
- Não duplique lógica entre frontend e worker nem entre workers (hoje `normalizeModules` está repetido em `worker-cancellation.js` e `worker-jwt-generator.js`: se tocar, compartilhe a função).
- Preserve o fluxo real das telas; não invente rotas nem recursos.
- Pessoa Física e Pessoa Jurídica usam a etapa de pagamento e podem gerar link iPag.
- Ao mudar arquitetura, rota, contrato de payload ou variável, atualize `docs/escopo-projeto.md`.
