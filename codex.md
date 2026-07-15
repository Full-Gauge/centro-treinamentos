# Guia interno do projeto

Este arquivo serve como referencia rapida para o proprio Codex ao trabalhar no repositorio da Plataforma de Treinamentos - Full Gauge.

Use o `README.md` para visao geral e `docs/escopo-projeto.md` como fonte oficial do escopo tecnico e da documentacao gerada em Word.

## 1. Regras principais

- manter os contratos de payload consistentes
- evitar criar uma segunda implementacao para o que ja existe
- preservar o fluxo real das telas em vez de inventar novos caminhos
- tratar `modules` como array real quando o fluxo envolver JWT ou cancelamento
- manter os proxys de Power Automate simples
- nao duplicar logica entre frontend e worker sem necessidade

## 2. Quando atualizar o escopo

Atualize `docs/escopo-projeto.md` quando a mudanca alterar algum ponto que explique como o projeto funciona:

- arquitetura
- rotas de API
- fluxo das telas
- contratos de payload
- variaveis de ambiente
- integracoes com Power Automate
- criterios de aceite

Nao e necessario atualizar o escopo para refatoracoes internas, ajustes de estilo ou correcoes que nao mudem o comportamento documentado.

Depois de gerar o documento Word, copie o arquivo final para:

`U:\TI\Desenvolvimentos\Em Andamento\Marketing - Plataforma Gestão CT\Documentação`

## 3. Como gerar o documento Word

Gerar o `.docx` a partir do escopo:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-project-scope-docx.ps1
```

O arquivo gerado fica em:

```text
.artifacts\escopo-projeto.docx
```

Depois, copie esse arquivo para a pasta da documentacao da empresa.

## 4. Prompts reutilizaveis para o proprio Codex

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

## 5. Base para futuras mudancas

Quando a arquitetura mudar, atualize primeiro:

- `README.md`
- `codex.md`
- rotas em `src/index.js`
- workers afetados
- contratos no frontend correspondente

Assim o documento continua sendo um mapa fiel do projeto.
