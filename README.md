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

Secrets do Worker devem ser alteradas via CLI do Wrangler:

```powershell
npx wrangler secret put JWT_SECRET --config wrangler.jsonc
npx wrangler secret put API_KEY --config wrangler.jsonc
```

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
- `url_token`
- `url_registro_presenca`
- `ATTENDANCE_WEBHOOK_URL`
- `CONFIRMATION_WEBHOOK_URL`
- `CANCELLATION_WEBHOOK_URL`
- `NAME_VALIDATION_WEBHOOK_URL`
- `URL_VALIDATE_CPF_MODULOS`
- `JWT_SECRET`
- `API_KEY`
- `URL_SHORTENER_KV`

### Deploy

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Observações

- `CANCELLATION_WEBHOOK_URL` pode cair para `CONFIRMATION_WEBHOOK_URL` como fallback.
- `ATTENDANCE_WEBHOOK_URL` pode cair para `url_registro_presenca` como fallback.
- `URL_SHORTENER_KV` é um binding de KV, não uma secret.
- `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` são secrets do GitHub Actions.

## Hospedagem

- Ambiente de teste: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Ambiente de produção: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Dashboard da hospedagem: `https://dash.cloudflare.com/`

## Guia rápido

- `docs/escopo-projeto.md`: escopo técnico e arquitetura
- `codex.md`: guia interno, regras e prompts para o próprio Codex
- `scripts/generate-project-scope-docx.ps1`: geração do DOCX em `.artifacts\escopo-projeto.docx`

## Configuração local

```bash
npm install
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```
