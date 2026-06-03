# Plataforma de Treinamentos - Full Gauge

Este projeto compreende o ecossistema de inscrição, confirmação e registro de presença para os treinamentos da Full Gauge. A solução foi desenhada para rodar em *Edge Computing*, utilizando Cloudflare Workers para garantir baixa latência e alta disponibilidade.

## 🚀 Funcionalidades Principais

### 1. Inscrição de Treinamentos (Wizard)
Localizado em `app.js`, este é um formulário multi-etapas (wizard) que gerencia o cadastro de novos alunos.
- **Relação com a Marca:** Diferencia entre público geral e parceiros.
- **Validação de Token:** Parceiros devem inserir um token válido que é verificado via API (`/api/validate-token`). Se válido, o sistema pré-preenche e trava campos como "Empresa" e "Turma".
- **Máscaras e Validação:** Implementação nativa de máscaras para CPF e Telefone, além de verificação de e-mails descartáveis.
- **Termos de Uso:** Exigência de leitura e aceitação de termos de imagem e custos antes do envio.

### 2. Registro de Presença
Localizado em `attendance-register.js`, focado na simplicidade para o aluno durante o evento.
- **Fluxo Simplificado:** O usuário insere apenas seu e-mail.
- **Envio Automático:** O sistema envia silenciosamente o valor `Sim` para o campo de presença, removendo fricção da interface.
- **Feedback Visual:** Micro-interações para validar o e-mail em tempo real e estados de carregamento (spinners).

### 3. Confirmação de Inscrição
Endpoint especializado (`worker-confirmation.js`) para processar links de confirmação enviados por e-mail.
- **Processamento de Tokens:** Capaz de extrair e-mail e ID da turma diretamente de tokens JWT ou parâmetros de URL.

## 🛠️ Tecnologias Envolvidas

### Frontend
- **Vanilla JavaScript (ES6+):** Lógica de interface sem dependências externas (Zero Frameworks).
- **CSS Moderno:** Uso extensivo de *CSS Variables* para suporte nativo a **Tema Claro/Escuro** e layouts responsivos com *Grid* e *Flexbox*.
- **I18n (Internacionalização):** Sistema customizado de tradução suportando Português (PT), Inglês (EN) e Espanhol (ES).

### Backend (Serverless)
- **Cloudflare Workers:** Execução de lógica no Edge.
- **Router Pattern:** O arquivo `index.js` atua como um roteador central para as diversas APIs do sistema.
- **Integrações:** Os dados são enviados para fluxos de automação via **Power Automate (Webhooks)**.

## 📂 Estrutura de Arquivos Relevantes

- `/public/js/app.js`: Lógica do wizard de inscrição.
- `/public/js/attendance-register.js`: Lógica da tela de presença.
- `/public/css/style.css`: Estilização global e temas.
- `/src/index.js`: Ponto de entrada (Router) do Worker.
- `/worker/`: Contém os handlers específicos para cada rota de API (tokens, turmas, módulos, etc).

### Documentos Importantes

*   **`public/docs/termo-de-uso.pdf`**: Este documento contém os Termos de Uso da plataforma de inscrição de treinamentos. Ele é referenciado na última etapa do formulário de inscrição, onde os usuários devem lê-lo e aceitar as condições antes de finalizar o cadastro.


## ⚙️ Configuração (Variáveis de Ambiente)

Para o funcionamento correto, as seguintes variáveis devem ser configuradas no painel da Cloudflare:
- `url_registro`: URL do webhook para novos cadastros.
- `ATTENDANCE_WEBHOOK_URL`: URL para registro de presença.
- `CONFIRMATION_WEBHOOK_URL`: URL para confirmação de inscrição.

---
*Full Gauge Controls - Departamento de Engenharia de Software*