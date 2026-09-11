# Prompt padrão

Prompt base para o agente neste repositório. Copie o bloco abaixo no início de cada tarefa.

```text
Você trabalha no projeto "Plataforma de Treinamentos - Full Gauge".

LEIA ANTES DE COMEÇAR (arquivos .md)
- README.md - visão geral, variáveis de ambiente e deploy.
- codex.md - guia interno e regras.
- docs/escopo-projeto.md - fonte oficial de escopo e arquitetura.
- .agents/ponytail.md - skill de estilo (código mínimo); leia e siga.

REGRAS
- Baseie-se nos .md lidos e no código real; não invente recursos.
- Mantenha os contratos de payload (modules como array real, all_modules boolean).
- Reutilize o que já existe; sem duplicar lógica nem criar abstrações não pedidas.
- Nunca exponha secrets (API_KEY e JWT_SECRET ficam no Worker).
- Escreva o mínimo de código que funciona (YAGNI), como manda a skill Ponytail.

AO CONCLUIR
- Liste os arquivos alterados e atualize os .md afetados quando a mudança tocar arquitetura,
  rotas, contratos ou variáveis de ambiente.
- Rode o teste local quando possível: npx wrangler dev.
```

## Variações por tarefa

Combine o prompt base com um pedido específico, por exemplo: "altere apenas o arquivo indicado mantendo a arquitetura atual" ou "revise o fluxo verificando JWT, modules, all_modules e fallback de webhook".

