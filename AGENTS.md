# Instruções para Agentes

Este projeto usa instruções obrigatórias em `docs/llm-style-guide.md`.

## Ordem de precedência
1. Instruções do usuário
2. `docs/llm-style-guide.md`
3. Padrões locais do código

## Regras obrigatórias
- Reutilização obrigatória: procurar primeiro em `src/components/ui/composites`, depois em `src/components/ui/primitives`.
- Não usar estilo inline/hex/rgb fora de casos explicitamente solicitados.
- Manter tipografia e layout padrão do modelo (`PageContainer`, `PageHeader`, classes `typo-*`).
- Não introduzir nova biblioteca de UI sem solicitação explícita.
- Preservar comportamento visual em light/dark mode.
- Preferir ajuste em token/componente base ao invés de sobrescrever página por página.