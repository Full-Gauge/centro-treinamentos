# Plataforma de Treinamentos - Full Gauge

O código-fonte está em [Full-Gauge/centro-treinamentos](https://github.com/Full-Gauge/centro-treinamentos).

## Visão geral

Plataforma de treinamentos da Full Gauge com:

- inscrição
- confirmação de inscrição
- cancelamento de inscrição
- registro de presença
- geração de links com JWT
- encurtamento e redirecionamento de URLs
- consulta de turmas, módulos e parceiros
- geração de link de pagamento (Pix e cartão) via iPag

O sistema roda em Cloudflare Workers, com frontend estático em `public/` e rotas serverless em `src/index.js`.

## Documentação do escopo

O arquivo [`docs/escopo-projeto.md`](docs/escopo-projeto.md) é a referência oficial de escopo e arquitetura do projeto.

Atualize esse documento sempre que uma entrega mudar:

- arquitetura
- rotas
- contratos de payload
- variáveis de ambiente
- integrações
- fluxos principais
- critérios de aceite

Não é necessário atualizar o escopo para refatorações internas, ajustes de estilo ou correções sem impacto documentado no comportamento do projeto.

Secrets do Worker devem ser alteradas via CLI do Wrangler, usando a configuração do ambiente correto:

```powershell
npx wrangler secret put JWT_SECRET --config wrangler.dev.jsonc
npx wrangler secret put API_KEY --config wrangler.dev.jsonc
npx wrangler secret put IPAG_API_ID --config wrangler.dev.jsonc
npx wrangler secret put IPAG_API_KEY --config wrangler.dev.jsonc
npx wrangler secret put POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL --config wrangler.dev.jsonc
```

Para produção, repita o comando trocando `wrangler.dev.jsonc` por `wrangler.prod.jsonc`.

Depois de gerar o documento Word, copie o arquivo final para:

`U:\TI\Desenvolvimentos\Em Andamento\Marketing - Plataforma Gestão CT\Documentação`

### Como gerar o documento

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-project-scope-docx.ps1
```

O arquivo é salvo em:

```text
.artifacts\escopo-projeto.docx
```

Depois, copie esse arquivo para a pasta da documentação da empresa.

## Ambientes e hospedagem

### Worker

- `url_registro`
- `url_turmas`
- `url_modulos`
- `url_parceiros`
- `url_token`
- `url_registro_presenca`
- `ATTENDANCE_WEBHOOK_URL`
- `CONFIRMATION_WEBHOOK_URL`
- `CANCELLATION_WEBHOOK_URL`
- `NAME_VALIDATION_WEBHOOK_URL`
- `URL_VALIDATE_CPF_MODULOS`
- `IPAG_BASE_URL` (opcional)
- valor do link iPag temporariamente fixado em `R$ 1.000,00` no Worker
- `IPAG_DEFAULT_DESCRIPTION` (opcional)
- `IPAG_LINK_EXPIRES_DAYS` (opcional; padrão 7)
- `JWT_SECRET`
- `API_KEY` obrigatória para os proxies enviados ao Power Automate
- `IPAG_API_ID` e `IPAG_API_KEY` (secrets) para o iPag; `IPAG_API_KEY` também valida o HMAC-SHA256 do webhook
- `POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL` (secret) para confirmações `TransactionCaptured` do iPag
- `URL_SHORTENER_KV`

### Deploy

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Observações

- `CANCELLATION_WEBHOOK_URL` pode cair para `CONFIRMATION_WEBHOOK_URL` como fallback.
- `ATTENDANCE_WEBHOOK_URL` pode cair para `url_registro_presenca` como fallback.
- `URL_SHORTENER_KV` é um binding de KV, não uma secret.
- `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` são usados apenas se o deploy for executado por CI; o fluxo padrão deste projeto é o deploy manual pelo Wrangler.

O endpoint público do webhook iPag é `POST /api/webhooks/ipag/payment-confirmed`. Cadastre a URL completa do Worker no iPag. O Worker valida a assinatura HMAC-SHA256 sobre o corpo bruto, exige `X-Ipag-Event: TransactionCaptured` e `attributes.status.code = 8`, e então encaminha o payload ao Power Automate com `x-api-key`.

## Hospedagem

- Ambiente de teste: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Ambiente de produção: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Dashboard da hospedagem: `https://dash.cloudflare.com/`

## Guia rápido

- `docs/escopo-projeto.md`: escopo técnico e arquitetura
- `docs/prompt-padrao.md`: prompt padrão para o agente neste projeto
- `codex.md`: guia interno, regras e prompts para o próprio Codex
- `scripts/generate-project-scope-docx.ps1`: geração do DOCX em `.artifacts\escopo-projeto.docx`
- `wrangler.dev.jsonc` / `wrangler.prod.jsonc`: configs de deploy por ambiente
- `.agents/*.md`: skills do projeto (Ponytail, convenções, segurança e Cloudflare Workers)

## Configuração local

```bash
npm install
npx wrangler dev --config wrangler.dev.jsonc
```

## Deploy manual

Não há deploy automático por push. Publique somente executando explicitamente o comando correspondente ao ambiente:

```bash
# Desenvolvimento
npx wrangler deploy --config wrangler.dev.jsonc

# Produção
npx wrangler deploy --config wrangler.prod.jsonc
```

`wrangler.dev.jsonc` publica no Worker `fg-centro-treinamentos-dev`. `wrangler.prod.jsonc` publica no Worker `fg-centro-treinamentos`.
