# Codex do Projeto

Este arquivo resume a arquitetura real da Plataforma de Treinamentos - Full Gauge e guarda prompts reutilizaveis para usar no proprio Codex ao gerar documentos, revisar fluxos e orientar mudancas.

## 1. Visao geral

O projeto centraliza o ciclo de treinamentos da Full Gauge em uma stack leve:

- frontend estatico em `public/`
- logica de interface em JavaScript puro
- roteamento serverless em Cloudflare Workers
- integracoes externas via Power Automate
- emissao de links seguros com JWT
- encurtamento e redirecionamento de URLs com KV

A aplicacao atende os fluxos de:

- inscricao
- confirmacao de inscricao
- cancelamento de inscricao
- registro de presenca
- validacao de nome
- validacao de CPF e modulos
- geracao de JWT
- shortener de URL

## 1.1 Hospedagem

- Ambiente de teste: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Ambiente de produção: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Dashboard da hospedagem: `https://dash.cloudflare.com/`

## 2. Estrutura do repositorio

### Frontend

- `public/index.html`: tela principal do wizard de inscricao
- `public/attendance-register.html`: tela de registro de presenca
- `public/confirmation-enrollment.html`: tela de confirmacao de inscricao
- `public/cancellation-enrollment.html`: tela de cancelamento de inscricao
- `public/css/style.css`: estilos da interface
- `public/js/app.js`: fluxo principal do wizard
- `public/js/attendance-register.js`: fluxo de presenca
- `public/js/confirmation-enrollment.js`: fluxo de confirmacao
- `public/js/cancellation-enrollment.js`: fluxo de cancelamento
- `public/docs/termo-de-uso.pdf`: termo de uso exibido no fluxo principal

### Worker e rotas

- `src/index.js`: roteamento principal das rotas de API
- `worker/workers-turmas.js`: consulta de turmas
- `worker/worker-modulos.js`: consulta de modulos
- `worker/worker-register.js`: cadastro principal
- `worker/worker-token.js`: validacao de token
- `worker/worker-attendance.js`: registro de presenca
- `worker/worker-confirmation.js`: confirmacao de inscricao
- `worker/worker-cancellation.js`: cancelamento de inscricao
- `worker/worker-jwt-generator.js`: geracao de JWT
- `worker/worker-url-shortener.js`: encurtamento e redirecionamento
- `worker/worker-name-validator.js`: validacao local de nome
- `worker/worker-name-validation-flow.js`: proxy para Power Automate de nome
- `worker/worker-cpf-modulos-validation-flow.js`: proxy para Power Automate de CPF + modulos

## 3. Contratos importantes

### JWT

O endpoint `/api/generate-jwt-register-attendance` gera tokens com:

- `classId`
- `email`
- `modules` quando existir

Ponto importante: `modules` precisa ser um array real. Array serializado em string nao deve ser tratado como contrato valido.

### Cancelamento

O fluxo de cancelamento trabalha com:

- `modules: string[]`
- `all_modules: boolean`

O frontend em `public/js/cancellation-enrollment.js` monta esse payload a partir do JWT, e o worker repassa esses campos para o webhook de destino.

### Power Automate

O padrao do projeto para validacoes e proxy de fluxo e:

- ler uma `URL_*` do ambiente
- receber JSON do frontend
- reenviar o payload ao webhook externo
- copiar de volta status e corpo da resposta
- enviar `x-api-key` quando `API_KEY` estiver configurada

## 4. Rotas de API

- `GET/POST /api/turmas`
- `GET/POST /api/modulos`
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

## 5. Variaveis de ambiente

- `url_registro`
- `ATTENDANCE_WEBHOOK_URL`
- `CONFIRMATION_WEBHOOK_URL`
- `CANCELLATION_WEBHOOK_URL`
- `JWT_SECRET`
- `API_KEY`
- `URL_SHORTENER_KV`
- `NAME_VALIDATION_WEBHOOK_URL`

Observacao:

- o worker de cancelamento usa `CANCELLATION_WEBHOOK_URL` e pode cair para `CONFIRMATION_WEBHOOK_URL` como fallback

## 6. Regras do projeto

- manter os contratos de payload consistentes
- evitar criar uma segunda implementacao para o que ja existe
- preservar o fluxo real das telas em vez de inventar novos caminhos
- tratar `modules` como array real quando for JWT ou cancelamento
- manter os proxys de Power Automate simples
- nao duplicar logica entre frontend e worker sem necessidade

## 6.1 Quando atualizar o escopo

Atualize `docs/escopo-projeto.md` sempre que a mudança alterar algum ponto que explique como o projeto funciona:

- arquitetura
- rotas de API
- fluxo das telas
- contratos de payload
- variáveis de ambiente
- integrações com Power Automate
- critérios de aceite

Não é necessário atualizar o escopo para refatorações internas, ajustes de estilo ou correções que não mudem o comportamento documentado.

Depois de gerar o documento Word, copie o arquivo final para:

`U:\TI\Desenvolvimentos\Em Andamento\Marketing - Plataforma Gestão CT\Documentação`

## 6.2 Como gerar o documento Word

Para gerar o `.docx` a partir do escopo, rode:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-project-scope-docx.ps1
```

O arquivo é salvo em:

```text
.artifacts\escopo-projeto.docx
```

Depois de gerar, copie o arquivo final para a pasta da documentação da empresa.

## 7. Prompts reutilizaveis

Use estes prompts no proprio Codex quando precisar gerar docs, revisar fluxo ou explicar uma parte especifica do projeto.

### Prompt 1: resumo tecnico do projeto

```text
Escreva um resumo tecnico da Plataforma de Treinamentos - Full Gauge com base na arquitetura real do repositorio. Explique frontend, worker, rotas de API, fluxos de inscricao, confirmacao, cancelamento, presenca, JWT, shortener e validacoes. Nao invente recursos que nao existem no codigo.
```

### Prompt 2: documento de arquitetura

```text
Crie um documento de arquitetura do projeto explicando a estrutura de pastas, o papel de cada arquivo principal, as rotas do worker, as variaveis de ambiente e as integracoes com Power Automate. Mantenha a descricao fiel ao codigo atual e destaque contratos importantes como modules: string[] e all_modules.
```

### Prompt 3: documento para stakeholder

```text
Transforme a Plataforma de Treinamentos - Full Gauge em um documento executivo de entendimento de produto. Descreva o objetivo do sistema, os fluxos principais, o que entra e nao entra no escopo, e como as telas se conectam aos workers e webhooks.
```

### Prompt 4: revisao de contrato

```text
Revise este fluxo do projeto verificando se o contrato de payload esta coerente com o worker e com o frontend. Verifique especialmente JWT, modules como array real, all_modules, x-api-key e fallback de webhook.
```

### Prompt 5: pedido de mudanca

```text
Altere apenas o arquivo indicado mantendo a arquitetura atual do projeto. Reutilize os fluxos e helpers existentes, evite duplicar logica e respeite os contratos ja consolidados de frontend, worker e Power Automate.
```

### Prompt 6: geracao de documento Word

```text
Gere um documento Word profissional sobre este projeto seguindo a estrutura real do repositorio. Inclua visao geral, arquitetura, paginas, workers, rotas, variaveis de ambiente, criterios de aceite e conclusao. Use linguagem tecnica e organizada, com titulos numerados.
```

## 8. Guia rapido para novos prompts

Se quiser criar prompts melhores para o proprio Codex, peça sempre:

- o arquivo ou fluxo exato
- o contrato de entrada e saida
- o comportamento esperado
- o que nao deve mudar
- se a mudanca e apenas documentacao ou tambem codigo

## 9. Base para futuras atualizacoes

Quando a arquitetura mudar, atualize primeiro:

- `README.md`
- `codex.md`
- rotas em `src/index.js`
- workers afetados
- contratos no frontend correspondente

Assim o documento continua sendo um mapa fiel do projeto.
