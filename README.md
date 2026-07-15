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

## Hospedagem

- Ambiente de teste: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Ambiente de produção: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Dashboard da hospedagem: `https://dash.cloudflare.com/`

## Guia rápido

- `docs/escopo-projeto.md`: escopo técnico e arquitetura
- `codex.md`: guia interno, regras e prompts para o próprio Codex
- `.github/workflows/generate-project-scope-docx.yml`: geração automática do DOCX na `main`

## Configuração local

```bash
npm install
npx wrangler dev
```

## Deploy

```bash
npx wrangler deploy
```
