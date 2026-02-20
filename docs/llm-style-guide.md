# Guia LLM de Estilo e Reuso (FRONT)

## 1. Objetivo
Este frontend é um template com identidade visual, tema e design system internos já definidos.

Regra obrigatória:
- Não reinventar componentes ou estilos que já existam no projeto.
- Não criar uma segunda linguagem visual paralela.

## 2. Stack e limites
Stack oficial de UI deste projeto:
- React + TypeScript
- Tailwind CSS v4
- Radix UI primitives
- cva (class-variance-authority)

Limites obrigatórios:
- Não introduzir Chakra UI, Material UI ou qualquer nova biblioteca de UI sem solicitação explícita do usuário.
- Não trocar a arquitetura de estilo atual.

## 3. Tokens e tema (fonte oficial)
Fonte única de verdade para tema:
- `src/theme/theme.css`

Regra obrigatória para cores, radius e tipografia:
- Usar tokens/classes semânticas do projeto (`bg-card`, `text-foreground`, `border-border`, `text-muted-foreground`, etc.).
- Evitar valores inline de cor (`#hex`, `rgb()`, `oklch()`) em páginas/componentes, exceto quando o usuário pedir explicitamente.

## 4. Tipografia
Fonte padrão:
- Geist / Geist Mono

Regras obrigatórias:
- Usar classes tipográficas existentes (`typo-page-title`, `typo-page-subtitle`, `typo-card-title`, `typo-card-subtitle`, etc.).
- Preservar hierarquia visual do template:
  - título de página
  - subtítulo de página
  - título de seção/card
  - subtítulo/corpo

## 5. Reuso de componentes (núcleo)
Ordem obrigatória de decisão:
1. Procurar em `src/components/ui/composites`
2. Se não existir, usar `src/components/ui/primitives`
3. Só então criar novo composite reutilizável

Regras obrigatórias:
- Não montar UI crítica diretamente na página se já existir componente pronto equivalente.
- Novas abstrações devem ser criadas como componente reutilizável, não como bloco local duplicado.

## 6. Padrões de composição
Padrão de página:
- `PageContainer` + `PageHeader`

Padrão de seção:
- `Card` com espaços consistentes

Padrão de feedback:
- Utilizar componentes existentes para status e alerta (`Badge`, `Alert`, `Sonner`, `StatusBadgeGroup`, etc.).

## 7. Padrões de implementação
Regras obrigatórias:
- Não duplicar lógica visual/estilo em múltiplos arquivos.
- Não quebrar APIs públicas de componentes existentes sem necessidade real.
- Preservar compatibilidade visual em light/dark mode.
- Preferir ajustes em tokens/componente base em vez de sobrescrever estilos em páginas.

## 8. Checklist de PR para LLM
Antes de concluir alterações, validar:
- Usei tokens semânticos do tema?
- Reaproveitei componentes de `composites`/`primitives`?
- Evitei cor/estilo inline fora do sistema?
- Mantive tipografia e hierarquia do layout?
- Adicionei ou ajustei testes quando houve mudança de comportamento?

## 9. Exemplos práticos (curtos)

### Exemplo 1: Botão e campo (certo x errado)
Certo:
- Importar `Button` e `Input` de `@/components/ui/primitives`
- Usar classes semânticas (`bg-card`, `text-foreground`, `border-border`)

Errado:
- Criar `<button>` custom com estilos soltos e cor hardcoded (`#3b82f6`)
- Duplicar estilo de input em cada página

### Exemplo 2: Novo componente
Certo:
- Se for recorrente, criar em `src/components/ui/composites/*`
- Expor API clara e reutilizável

Errado:
- Implementar a mesma estrutura em 2+ páginas sem extrair componente

### Exemplo 3: Uso em página
Certo:
- Estruturar com `PageContainer`, `PageHeader`, `Card`
- Consumir composites já prontos

Errado:
- Construir seção inteira fora do padrão do template
- Ignorar classes tipográficas e espaçamentos globais
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
