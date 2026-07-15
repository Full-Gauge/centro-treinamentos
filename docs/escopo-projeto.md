# Especificação de Desenvolvimento

## 1. Identificação

- **Projeto:** Plataforma de Treinamentos - Full Gauge
- **Versão:** 1.0
- **Responsável:** Equipe de desenvolvimento
- **Data:** Atualização conforme a entrega

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

## 5. Fluxos funcionais

### 5.1 Inscrição de treinamentos

O fluxo principal roda em `public/index.html` com lógica em `public/js/app.js`. Ele funciona como um wizard com etapas, validação de campos e separação entre público geral e parceiros.

Pontos principais:

- validação de token de parceiro via `/api/validate-token`
- preenchimento automático de dados quando o token é válido
- máscara e validação de CPF, telefone e e-mail
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

## 6. Rotas de API

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

## 7. Integração com Power Automate

O padrão de integração do projeto é simples:

- o Worker lê uma `URL_*` configurada no ambiente
- recebe o payload do frontend
- reenvia o JSON ao webhook externo
- devolve status e corpo da resposta para a interface ou para o sistema chamador
- envia `x-api-key` quando `API_KEY` está configurada

Esse modelo aparece nos fluxos de:

- validação de nome
- validação de CPF e módulos
- confirmação
- cancelamento
- inscrição

## 8. Variáveis de ambiente

- `url_registro`
- `ATTENDANCE_WEBHOOK_URL`
- `CONFIRMATION_WEBHOOK_URL`
- `CANCELLATION_WEBHOOK_URL`
- `JWT_SECRET`
- `API_KEY`
- `URL_SHORTENER_KV`
- `NAME_VALIDATION_WEBHOOK_URL`

Observação:

- o worker de cancelamento usa `CANCELLATION_WEBHOOK_URL` e pode cair para `CONFIRMATION_WEBHOOK_URL` como fallback

## 9. Interface e experiência do usuário

As telas do projeto foram desenhadas para cobrir contextos diferentes com a mesma base visual:

- wizard principal para inscrição
- tela simples para presença
- tela de confirmação por link
- tela de cancelamento por link
- suporte a PT, EN e ES
- feedback visual de sucesso, erro e carregamento
- tema claro e escuro

## 10. Configuração local

### Pré-requisitos

- Node.js 18+
- Wrangler CLI
- acesso à Cloudflare para deploy

### Instalação

```bash
npm install
```

### Execução local

```bash
npx wrangler dev
```

### Teste rápido de API

```bash
curl -X POST http://127.0.0.1:8787/api/cancellation \
  -H "Content-Type: application/json" \
  -d '{"token":"SEU_JWT","cancellation":"Sim"}'
```

### Deploy

```bash
npx wrangler deploy
```

## 11. Regras técnicas do projeto

- manter os contratos de payload consistentes
- tratar `modules` como array real quando o fluxo exigir
- evitar duplicar lógica entre frontend e worker
- preservar o fluxo real das telas
- manter os proxys de Power Automate simples e previsíveis
- não criar uma segunda implementação para o que já existe

## 12. Critérios de aceite

- todas as páginas principais carregam corretamente
- os fluxos de inscrição, confirmação, cancelamento e presença funcionam com os contratos esperados
- os tokens JWT são processados sem perda de dados relevantes
- os webhooks de Power Automate recebem payloads no formato previsto
- o encurtador redireciona corretamente para a URL de destino
- o sistema se mantém responsivo e utilizável em desktop e mobile

## 13. Riscos e mitigação

- **Mudança de requisitos:** mitigar com validação recorrente do escopo e revisão antes de novas entregas
- **Quebra de contrato de payload:** mitigar com verificação de shape no frontend e no worker
- **Falhas de integração externa:** mitigar com fallback de webhook, tratamento de erro e logs claros
- **Problemas de compatibilidade de interface:** mitigar com testes das telas principais e revisão do suporte a temas e idiomas

## 14. Conclusão

A Plataforma de Treinamentos - Full Gauge é uma aplicação modular, baseada em Cloudflare Workers, com foco em inscrição, confirmação, cancelamento, presença, validações e automações externas. A separação entre frontend e Worker deixa o sistema fácil de manter e simples de evoluir.
