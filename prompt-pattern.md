# Prompt Pattern — Centro de Treinamento

Use este modelo como ponto de partida para solicitar alterações no projeto
Plataforma de Treinamentos - Full Gauge.

Antes de iniciar, leia obrigatoriamente:

- [`README.md`](README.md)
- [`docs/escopo-projeto.md`](docs/escopo-projeto.md)
- [` .agents/projeto-convencoes.md`](.agents/projeto-convencoes.md)
- [` .agents/seguranca-secrets.md`](.agents/seguranca-secrets.md)
- [` .agents/cloudflare-workers.md`](.agents/cloudflare-workers.md)
- [` .agents/ponytail.md`](.agents/ponytail.md)

## Solicitação

**Objetivo:**

[Descreva o resultado esperado.] 

**Escopo:**

- [Arquivos, telas, rotas ou workers envolvidos.]
- [O que não deve ser alterado.] 

**Critérios de aceite:**

- [Descreva como confirmar que a alteração está correta.]

## Instruções para o agente

Analise primeiro o código e o fluxo existente. Implemente somente o necessário,
reutilizando helpers, rotas, componentes e contratos já existentes. Não invente
recursos nem crie uma segunda implementação para um fluxo que já existe.

Preserve especialmente:

- `modules` como array real de strings (`string[]`);
- `all_modules` como booleano nos fluxos de cancelamento;
- os contratos JWT e os payloads enviados ao Power Automate;
- os fallbacks de webhook já definidos;
- a separação entre frontend estático, roteamento em `src/index.js` e handlers
  em `worker/`;
- secrets e chaves somente no Worker/configuração do ambiente.

Cuide do encoding: mantenha arquivos de texto em UTF-8 sem BOM, finais de linha
LF e acentos preservados. Não normalize arquivos fora do escopo.

Se a alteração modificar arquitetura, rota, contrato de payload, variável de
ambiente ou fluxo principal, atualize `docs/escopo-projeto.md` e a documentação
correspondente.

## Validação e entrega

Ao finalizar:

1. Liste os arquivos alterados.
2. Execute as validações adequadas, incluindo `node --check` nos JavaScript
   afetados e `npm test` quando houver mudança de fluxo da interface.
3. Execute `git diff --check`.
4. Informe testes realizados, impactos e pendências.
5. Não declare deploy, integração externa ou comportamento de produção sem
   validação real no ambiente correspondente.

## Pedido pronto para copiar

```text
Trabalhe no projeto Plataforma de Treinamentos - Full Gauge.

Leia README.md, AGENTS.md, docs/escopo-projeto.md, as convenções em .agents/ e
o prompt-pattern.md antes de alterar qualquer arquivo.

Objetivo:
[DESCREVA O OBJETIVO]

Escopo:
[INFORME ARQUIVOS, TELAS, ROTAS OU WORKERS ENVOLVIDOS]

Critérios de aceite:
[DESCREVA COMO VALIDAR]

Analise o fluxo existente e implemente somente o necessário. Preserve os
contratos de payload, os secrets no Worker, o encoding UTF-8 sem BOM e os
finais de linha LF. Ao concluir, liste os arquivos alterados, rode as
validações adequadas e informe testes, impactos e pendências.
```
