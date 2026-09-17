# Especificação de Desenvolvimento

## 1. Identificação

- Projeto: Plataforma de Treinamentos - Full Gauge
- Código-fonte: [Full-Gauge/centro-treinamentos](https://github.com/Full-Gauge/centro-treinamentos)
- Versão: 1.0
- Responsável: Equipe de desenvolvimento
- Data: Atualização conforme a entrega

## 2. Objetivo

Este documento registra a estrutura, a arquitetura e o escopo técnico do projeto para servir como referência de desenvolvimento, manutenção e documentação. A plataforma centraliza o ciclo de treinamentos da empresa em uma stack leve e modular, cobrindo inscrição, confirmação, cancelamento, presença, validações auxiliares e automações com Power Automate.

## 3. Visão geral da arquitetura

A arquitetura combina:

- frontend estático em `public/`
- lógica de interface em JavaScript puro
- roteamento serverless em Cloudflare Workers
- integrações externas via webhooks do Power Automate
- emissão de links seguros com JWT
- encurtamento e redirecionamento de URLs com KV

## 4. Estrutura do projeto

### Frontend

- `public/index.html`: tela principal do wizard de inscrição
- `public/attendance-register.html`: tela de registro de presença
- `public/confirmation-enrollment.html`: tela de confirmação de inscrição
- `public/cancellation-enrollment.html`: tela de cancelamento de inscrição
- `public/css/style.css`: estilos da interface
- `public/js/app.js`: fluxo principal da inscrição
- `public/js/attendance-register.js`: fluxo de presença
- `public/js/confirmation-enrollment.js`: fluxo de confirmação
- `public/js/cancellation-enrollment.js`: fluxo de cancelamento
- `public/docs/termo-de-uso.pdf`: termo de uso exibido no fluxo principal

### Backend / Workers

- `src/index.js`: roteamento principal das rotas de API
- `worker/workers-turmas.js`: consulta de turmas
- `worker/worker-modulos.js`: consulta de módulos
- `worker/worker-parceiros.js`: consulta de parceiros
- `worker/worker-register.js`: cadastro principal
- `worker/worker-token.js`: validação de token
- `worker/worker-attendance.js`: registro de presença
- `worker/worker-confirmation.js`: confirmação de inscrição
- `worker/worker-cancellation.js`: cancelamento de inscrição
- `worker/worker-jwt-generator.js`: geração de JWT
- `worker/worker-url-shortener.js`: encurtamento e redirecionamento
- `worker/worker-name-validator.js`: validação local de nome
- `worker/worker-name-validation-flow.js`: proxy para Power Automate de nome
- `worker/worker-cpf-modulos-validation-flow.js`: proxy para Power Automate de CPF + módulos
- `worker/power-automate.js`: helper compartilhado que valida `API_KEY` e monta o header `x-api-key` dos webhooks
- `worker/worker-ipag.js`: geração de links de pagamento no iPag (Pix e cartão) via Basic Auth

## 5. Fluxos funcionais

### 5.1 Inscrição de treinamentos

O fluxo principal roda em `public/index.html` com lógica em `public/js/app.js`. Ele funciona como um wizard com etapas, validação de campos e três entradas na primeira etapa: Pessoa Física, Pessoa Jurídica e Parceiro.

Pontos principais:

- validação de token de parceiro via `/api/validate-token` quando a opção Parceiro é escolhida
- preenchimento automático de dados quando o token é válido
- na etapa 2, Pessoa Jurídica informa razão social, responsável e CNPJ para o iPag; Pessoa Física informa CPF
- após a escolha da turma, Pessoa Jurídica pode selecionar as vagas desejadas em um combobox; a consulta de disponibilidade será adicionada depois
- máscara e validação de CPF/CNPJ, telefone e e-mail
- aceite do termo de uso antes do envio
- validação adicional antes do envio final quando aplicável

### 5.2 Confirmação de inscrição

O fluxo de confirmação usa `public/confirmation-enrollment.html` e `public/js/confirmation-enrollment.js`.

Pontos principais:

- acesso por link com token JWT
- leitura de e-mail e turma a partir do token
- resposta enviada para `/api/confirmation`
- suporte a PT, EN e ES
- tema claro e escuro

### 5.3 Cancelamento de inscrição

O cancelamento usa `public/cancellation-enrollment.html` e `public/js/cancellation-enrollment.js`.

Pontos principais:

- acesso por token JWT
- suporte a PT, EN e ES
- tema claro e escuro
- seleção de módulos quando o JWT traz `modules`
- envio da resposta para `/api/cancellation`

Esse fluxo trabalha com:

- `modules: string[]`
- `all_modules: boolean`

### 5.4 Registro de presença

O fluxo de presença usa `public/attendance-register.html` e `public/js/attendance-register.js`.

Pontos principais:

- tela direta e rápida
- envio da presença para `/api/attendance`
- feedback visual de carregamento e validação

### 5.5 Geração de JWT

O endpoint `/api/generate-jwt-register-attendance` emite tokens com:

- `classId`
- `email`
- `modules` quando aplicável

Importante: `modules` precisa ser um array real. Array serializado como string não deve ser tratado como contrato válido.

### 5.6 Encurtamento de URL

O sistema possui:

- `POST /api/shorten-url`
- `GET /s/:code`

Esse fluxo cria links curtos com armazenamento em KV e redirecionamento automático.

### 5.7 Validações auxiliares

O projeto também expõe validações de apoio:

- `/api/validate-name`
- `/api/validate-name-flow`
- `/api/validate-cpf-modulos-flow`

Essas rotas mantêm a camada do Worker fina e funcionam como ponte para validações locais e fluxos externos.

### 5.8 Consulta de parceiros

A busca de parceiros usa `worker/worker-parceiros.js` e a rota `/api/parceiros`.

Pontos principais:

- consulta `url_parceiros` e normaliza a lista para `{ id, name }`
- cache de borda por 30 minutos via `caches.default`
- alimenta a lista de parceiros exibida no fluxo de inscrição

### 5.9 Pagamento (iPag)

O fluxo de pagamento gera um link de checkout no iPag para Pix e cartão.

Pontos principais:

- etapa de pagamento do wizard (`public/js/app.js`) escolhe a forma de pagamento (Pix ou cartão) para Pessoa Física, Pessoa Jurídica e Parceiro
- ao finalizar a etapa 5, o front chama `POST /api/payment-link`
- o cadastro é enviado após o cliente clicar no link de pagamento
- `worker/worker-ipag.js` monta o payload e chama `POST /service/v2/payment_links` do iPag com Basic Auth
- retorna `{ link }`, exibido como botão "Pagar agora" na tela de sucesso

## 6. Rotas de API

- `GET/POST /api/turmas`
- `GET/POST /api/modulos`
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

## 7. Integração com Power Automate

O padrão de integração do projeto é simples:

- o Worker lê uma `URL_*` configurada no ambiente
- recebe o payload do frontend
- reenvia o JSON ao webhook externo
- devolve status e corpo da resposta para a interface ou para o sistema chamador
- exige `API_KEY` e envia `x-api-key` para webhooks do Power Automate

Esse modelo aparece nos fluxos de:

- validação de nome
- validação de CPF e módulos
- confirmação
- cancelamento
- inscrição

O fluxo de pagamento usa o mesmo padrão de proxy, mas com Basic Auth (`IPAG_API_ID`/`IPAG_API_KEY`) em vez de `x-api-key`.

## 8. Variáveis de ambiente

- As secrets devem ser alteradas via CLI do Wrangler, sempre indicando o arquivo do ambiente:

```bash
npx wrangler secret put JWT_SECRET --config wrangler.dev.jsonc
npx wrangler secret put API_KEY --config wrangler.dev.jsonc
npx wrangler secret put POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL --config wrangler.dev.jsonc
```

Para produção, use `--config wrangler.prod.jsonc`. Nunca use `wrangler.jsonc` para publicar um ambiente.

### 8.1 Secrets do Worker

- `JWT_SECRET`
- `API_KEY` obrigatória para os proxies enviados ao Power Automate
- `IPAG_API_ID` e `IPAG_API_KEY` para autenticar (Basic Auth) na API do iPag; `IPAG_API_KEY` também é usada para validar o HMAC-SHA256 do webhook
- `POWER_AUTOMATE_PAYMENT_CONFIRMATION_URL` para encaminhar confirmações `TransactionCaptured` ao Power Automate

### 8.2 Variáveis do Worker

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
- `IPAG_BASE_URL` (opcional; padrão `https://sandbox.ipag.com.br`)
- `IPAG_DEFAULT_DESCRIPTION`, `IPAG_LINK_EXPIRES_DAYS` (opcionais do link iPag)
- o valor do link iPag está temporariamente fixado em `R$ 1.000,00` no Worker

O endpoint `POST /api/webhooks/ipag/payment-confirmed` valida o HMAC-SHA256 usando o body bruto, exige `X-Ipag-Event: TransactionCaptured` e `attributes.status.code = 8`, preserva o body e encaminha o payload ao Power Automate com `x-api-key`. Retorna `200` somente para respostas `2xx` do Power Automate; falhas de encaminhamento retornam `502` para permitir retry do iPag.

### 8.3 Bindings do Worker

- `URL_SHORTENER_KV`

### 8.4 Segredos do deploy

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Observações:

- `CANCELLATION_WEBHOOK_URL` pode cair para `CONFIRMATION_WEBHOOK_URL` como fallback.
- `ATTENDANCE_WEBHOOK_URL` pode cair para `url_registro_presenca` como fallback.
- `URL_SHORTENER_KV` é um binding de KV, não uma secret.
- `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` só são necessários para CI; o deploy padrão é manual pelo Wrangler.

## 9. Hospedagem

O site e o Worker ficam hospedados no ecossistema Cloudflare. Os acessos informados para os ambientes são:

- Ambiente de teste: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Ambiente de produção: `https://fg-centro-treinamentos-dev.svc-powerplatform-dev.workers.dev/`
- Dashboard da hospedagem: `https://dash.cloudflare.com/`

## 10. Interface e experiência do usuário

As telas do projeto foram desenhadas para cobrir contextos diferentes com a mesma base visual:

- wizard principal para inscrição
- tela simples para presença
- tela de confirmação por link
- tela de cancelamento por link
- suporte a PT, EN e ES
- feedback visual de sucesso, erro e carregamento
- tema claro e escuro

## 11. Configuração local

### Pré-requisitos

- Node.js 18+ (o workflow de deploy usa Node 22)
- Wrangler CLI
- acesso à Cloudflare para deploy

### Instalação

```bash
npm install
```

### Execução local

```bash
npx wrangler dev --config wrangler.dev.jsonc
```

### Teste rápido de API

```bash
curl -X POST http://127.0.0.1:8787/api/cancellation \
  -H "Content-Type: application/json" \
  -d '{"token":"SEU_JWT","cancellation":"Sim"}'
```

### Deploy manual

Não há deploy automático por push. O desenvolvedor deve publicar explicitamente o ambiente desejado:

```bash
# Desenvolvimento
npx wrangler deploy --config wrangler.dev.jsonc

# Produção
npx wrangler deploy --config wrangler.prod.jsonc
```

## 12. Regras técnicas do projeto

- manter os contratos de payload consistentes
- tratar `modules` como array real quando o fluxo exigir
- evitar duplicar lógica entre frontend e worker
- preservar o fluxo real das telas
- manter os proxys de Power Automate simples e previsíveis
- não criar uma segunda implementação para o que já existe

## 13. Critérios de aceite

- todas as páginas principais carregam corretamente
- os fluxos de inscrição, confirmação, cancelamento e presença funcionam com os contratos esperados
- os tokens JWT são processados sem perda de dados relevantes
- os webhooks de Power Automate recebem payloads no formato previsto
- o encurtador redireciona corretamente para a URL de destino
- o sistema se mantém responsivo e utilizável em desktop e mobile

## 14. Riscos e mitigação

- Mudança de requisitos: mitigar com validação recorrente do escopo e revisão antes de novas entregas
- Quebra de contrato de payload: mitigar com verificação de shape no frontend e no worker
- Falhas de integração externa: mitigar com fallback de webhook, tratamento de erro e logs claros
- Problemas de compatibilidade de interface: mitigar com testes das telas principais e revisão do suporte a temas e idiomas

## 15. Conclusão

A Plataforma de Treinamentos - Full Gauge é uma aplicação modular, baseada em Cloudflare Workers, com foco em inscrição, confirmação, cancelamento, presença, validações e automações externas. A separação entre frontend e Worker deixa o sistema fácil de manter e simples de evoluir.
