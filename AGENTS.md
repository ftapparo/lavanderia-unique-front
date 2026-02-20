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
## Windows UTF-8 (obrigatorio)

Para evitar mojibake ao editar/gerar arquivos via shell no Windows:

```powershell
chcp 65001
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
```

Regras:
- Preferir PowerShell 7 (`pwsh`).
- Sempre gravar arquivos em UTF-8.
- Em caso de texto corrompido (`Ã`, `?`, `�`), interromper e corrigir encoding antes de continuar.
