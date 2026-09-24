# Contrato para agentes de desenvolvimento

Este arquivo define o ciclo mínimo para qualquer agente que altere este repositório.

Fontes de referência:

- `README.md`: uso, configuração e deploy.
- `docs/escopo-projeto.md`: escopo e arquitetura oficiais.
- `prompt-pattern.md`: modelo oficial de solicitação.
- `.agents/`: regras especializadas de convenções, segurança e Cloudflare.

## Antes de alterar

- Leia `README.md`, este `AGENTS.md` e o código do fluxo afetado.
- Preserve alterações existentes no worktree.
- Reutilize rotas, helpers e contratos atuais antes de criar novos.
- Nunca exponha secrets, tokens ou valores de configuração sensíveis no código.
- Preserve `modules` como array real de strings e `all_modules` como booleano.
- Mantenha frontend estático, roteamento em `src/index.js` e handlers em `worker/`.

## Durante a alteração

- Faça a menor mudança que resolve a tarefa.
- Mantenha frontend, Worker e contratos de payload coerentes.
- Para mudanças de fluxo, atualize ou crie teste Playwright.
- Para mudanças de API, valide também o comportamento da interface afetada.

## Verificação obrigatória

Antes de concluir qualquer alteração executável, rode:

```powershell
npm run verify
```

O comando executa os testes unitários, os testes Playwright e verifica problemas de whitespace no diff.

Não considere a tarefa concluída se houver teste falhando, erro de diff ou contrato não verificado.

## Documentação de escopo

Atualize `docs/escopo-projeto.md` quando a mudança alterar arquitetura, rotas, contratos de payload, variáveis de ambiente, integrações ou fluxos principais.

Para gerar o documento Word do escopo:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\generate-project-scope-docx.ps1
```

O arquivo será gerado em `.artifacts\escopo-projeto.docx`.

## Publicação

Use somente os comandos oficiais:

```powershell
npm run deploy:dev
npm run deploy:prod
```

Cada comando executa `npm run verify` antes do deploy. A publicação em produção exige solicitação explícita.

## Entrega

Informe sempre arquivos alterados, testes executados, limitações externas e o comando de deploy apropriado.
