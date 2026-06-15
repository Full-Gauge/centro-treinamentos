# Plataforma de Treinamentos - Full Gauge

Este projeto centraliza o fluxo de treinamentos da Full Gauge, incluindo:
- inscrição;
- confirmação de inscrição;
- cancelamento de inscrição;
- registro de presença;
- geração de links com token JWT;
- encurtamento e redirecionamento de URLs.

A aplicação roda em **Cloudflare Workers** (Edge Computing), com frontend estático em `/public` e APIs serverless roteadas por `/src/index.js`.

## 🚀 Funcionalidades

### 1) Inscrição de Treinamentos (Wizard)
Tela principal em `public/index.html` com lógica em `public/js/app.js`.

Principais recursos:
- Fluxo multi-etapas (wizard);
- Diferenciação entre público geral e parceiros;
- Validação de token de parceiro via `/api/validate-token`;
- Pré-preenchimento de dados quando o token é válido;
- Máscaras e validações de campos (ex.: CPF, telefone, e-mail);
- Aceite de termos de uso antes do envio.

### 2) Registro de Presença
Tela em `public/attendance-register.html` com lógica em `public/js/attendance-register.js`.

Principais recursos:
- Fluxo simples focado em agilidade;
- Envio da presença para backend via `/api/attendance`;
- Feedback visual de carregamento e validação.

### 3) Confirmação de Inscrição
Tela em `public/confirmation-enrollment.html` com lógica em `public/js/confirmation-enrollment.js`.

Principais recursos:
- Acesso por link com token JWT (`?t=...`);
- Extração de e-mail e turma pelo token;
- Resposta de confirmação via `/api/confirmation`;
- Interface com i18n (PT/EN/ES) e tema claro/escuro.

### 4) Cancelamento de Inscrição (Novo)
Tela em `public/cancellation-enrollment.html` com lógica em `public/js/cancellation-enrollment.js`.

Principais recursos:
- Mesmo padrão visual e de usabilidade da tela de confirmação;
- Acesso por token JWT (`?t=...`);
- Envio da resposta de cancelamento via `/api/cancellation`;
- Suporte a PT/EN/ES e tema claro/escuro.

### 5) Geração de JWT para Links
Endpoint: `/api/generate-jwt-register-attendance`

Principais recursos:
- Gera token com `classId` + `email`;
- Expiração configurada no worker;
- Proteção por `x-api-key`.

### 6) Encurtador de URL
Endpoints:
- `POST /api/shorten-url`
- `GET /s/:code`

Principais recursos:
- Geração de link curto com armazenamento em KV;
- Redirecionamento automático com expiração (TTL).

## 🔌 Rotas de API

- `GET/POST /api/turmas`
- `GET/POST /api/modulos`
- `POST /api/register`
- `POST /api/validate-token`
- `POST /api/confirmation`
- `POST /api/cancellation`
- `POST /api/attendance`
- `POST /api/generate-jwt-register-attendance`
- `POST /api/shorten-url`
- `GET/POST /api/validate-name`
- `GET /s/:code`

## 🛠️ Tecnologias

### Frontend
- Vanilla JavaScript (ES6+)
- HTML + CSS com design responsivo
- CSS Variables para temas claro/escuro
- I18n customizado (PT, EN, ES)

### Backend
- Cloudflare Workers
- Cloudflare KV (URL shortener)
- Integração com webhooks (Power Automate)

## 📂 Estrutura de Arquivos Relevantes

- `public/index.html`
- `public/attendance-register.html`
- `public/confirmation-enrollment.html`
- `public/cancellation-enrollment.html`
- `public/js/app.js`
- `public/js/attendance-register.js`
- `public/js/confirmation-enrollment.js`
- `public/js/cancellation-enrollment.js`
- `public/css/style.css`
- `public/docs/termo-de-uso.pdf`
- `src/index.js`
- `worker/worker-register.js`
- `worker/worker-attendance.js`
- `worker/worker-confirmation.js`
- `worker/worker-cancellation.js`
- `worker/worker-jwt-generator.js`
- `worker/worker-url-shortener.js`

## 🧪 Teste Local

### Pré-requisitos
- Node.js 18+
- Conta Cloudflare (para deploy)
- Wrangler CLI (via `npx` ou instalação global)

### 1) Instalar dependências
```bash
npm install
```

### 2) Rodar localmente
```bash
npx wrangler dev
```

Por padrão, o Wrangler sobe o Worker local com os assets de `/public` e as rotas de API de `/src/index.js`.

### 3) Testar páginas no navegador
- `http://127.0.0.1:8787/` (inscrição)
- `http://127.0.0.1:8787/attendance-register.html`
- `http://127.0.0.1:8787/confirmation-enrollment.html?t=SEU_JWT`
- `http://127.0.0.1:8787/cancellation-enrollment.html?t=SEU_JWT`

### 4) Testar APIs rapidamente (exemplo)
```bash
curl -X POST http://127.0.0.1:8787/api/cancellation \
  -H "Content-Type: application/json" \
  -d '{"token":"SEU_JWT","cancellation":"Sim"}'
```

### 5) Deploy
```bash
npx wrangler deploy
```

## ⚙️ Variáveis de Ambiente


Configure no Cloudflare (Worker Settings / Secrets / Vars):

- `url_registro`: webhook para novos cadastros.
- `ATTENDANCE_WEBHOOK_URL`: webhook para presença.
- `CONFIRMATION_WEBHOOK_URL`: webhook para confirmação de inscrição.
- `CANCELLATION_WEBHOOK_URL`: webhook para cancelamento de inscrição.
- `JWT_SECRET`: segredo para assinatura dos tokens JWT.
- `API_KEY`: chave esperada no header `x-api-key` para geração de JWT.
- `URL_SHORTENER_KV`: binding do namespace KV do encurtador.

> Observação: no worker de cancelamento existe fallback para `CONFIRMATION_WEBHOOK_URL` caso `CANCELLATION_WEBHOOK_URL` não esteja configurada.

### 7) Validação de Nome
Endpoint: `/api/validate-name`

Principais recursos:
- Normaliza acentuação, letras maiúsculas/minúsculas e partículas como `de`, `da`, `do`, `das`, `dos`;
- Calcula similaridade com base em Levenshtein;
- Retorna `valid`, `score`, `threshold` e os nomes normalizados;
- Aceita `GET` com query string ou `POST` com JSON.
- Quando `API_KEY` estiver configurada, exige o header `x-api-key`.

Exemplo de uso:
```bash
curl -X POST http://127.0.0.1:8787/api/validate-name \
  -H "Content-Type: application/json" \
  -H "x-api-key: SUA_CHAVE" \
  -d '{"name":"João da Silva","referenceName":"Joao Silva","threshold":80}'
```

---
*Full Gauge Controls - Departamento de Engenharia de Software*

Para guardar a URL do Power Automate como secret no Cloudflare, rode:
```bash
```


### Secret da validação de nome
Para guardar o webhook da validação de nome no Power Automate como secret, rode:
```bash
npx wrangler secret put NAME_VALIDATION_WEBHOOK_URL
```

O wizard chama `/api/validate-name-flow` ao sair da etapa **Inscrição**.
Se `API_KEY` estiver configurada no Worker, ela é enviada no header `x-api-key` para o webhook de validação.

