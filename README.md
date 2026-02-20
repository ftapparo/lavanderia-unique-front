# Laundry Control Frontend

## Visão Geral

Aplicação web responsável pela interface do sistema.

O frontend:

- Não acessa banco de dados
- Não acessa Tuya
- Consome apenas a API principal

---

## Funcionalidades

Usuário comum:
- Login / Registro
- Visualizar unidades vinculadas
- Criar reserva
- Cancelar reserva
- Fazer check-in
- Visualizar faturas

Proprietário/Admin Airbnb:
- Visualizar faturas de múltiplas unidades

Zelador/Administrador:
- Gerenciar vínculos
- Visualizar ocorrências
- Exportar cobrança

---

## Tecnologias

- Vite
- React
- TypeScript
- TailwindCSS
- Axios
- React Query
- React Router

---

## Estrutura

src/
- pages/
- components/
- services/api.ts
- hooks/
- contexts/
- utils/

---

## Autenticação

- JWT armazenado em memory ou storage seguro
- Interceptor Axios para incluir token
- Redirecionamento automático se não autenticado

---

## UI

- Design simples, funcional e responsivo
- Foco em usabilidade
- Calendário para reservas
- Indicadores visuais de status:
  - Reserva ativa
  - Check-in liberado
  - Overtime
  - Fatura pendente

---

## Regras Importantes

- Nunca chamar Tuya diretamente
- Nunca acessar banco
- Não implementar regra de negócio complexa no front
- Toda validação crítica deve estar na API

---

## Objetivo

Ser uma interface clara e eficiente
para uso real em ambiente de condomínio,
com mínimo de complexidade e máxima confiabilidade.
---

## Windows (PowerShell) e UTF-8

Para evitar problemas de encoding (mojibake) ao rodar scripts/comandos no Windows, configure o terminal para UTF-8 antes de trabalhar:

```powershell
chcp 65001
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::InputEncoding  = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
```

Recomendado usar PowerShell 7 (`pwsh`) e manter os arquivos em UTF-8.
