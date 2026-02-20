# Instruções do Copilot (FRONT)

Estas instruções são obrigatórias para sugestões de código neste repositório.

Fonte única de estilo e reuso:
- `docs/llm-style-guide.md`

## Regras de alta prioridade
- Sempre priorizar componentes de `@/components/ui/composites` e `@/components/ui/primitives`.
- Usar tokens/classes semânticas do tema (`bg-card`, `text-foreground`, `border-border`, etc.).
- Evitar classes arbitrárias de cor/tipografia e evitar valores hardcoded (`#hex`, `rgb`, `oklch`) fora de exceções pedidas.
- Preservar estrutura de página do projeto (`PageContainer`, `PageHeader`, seções em `Card`).
- Não introduzir nova biblioteca de UI sem solicitação explícita do usuário.