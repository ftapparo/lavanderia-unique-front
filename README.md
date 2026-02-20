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