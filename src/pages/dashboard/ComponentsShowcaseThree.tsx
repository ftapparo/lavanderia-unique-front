import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { TableCardSection, TablePagePanel } from "@/components/ui/composites";

const dataset = {
  columns: [
    { key: "item", label: "Item" },
    { key: "status", label: "Status" },
    { key: "owner", label: "Responsavel" },
    { key: "updated", label: "Atualizado", align: "right" as const },
  ],
  rows: [
    { item: "Configuracao inicial", status: "Concluido", owner: "Equipe UI", updated: "Hoje" },
    { item: "Ajuste de contrastes", status: "Em andamento", owner: "Design System", updated: "Ontem" },
    { item: "Revisao de componentes", status: "Pendente", owner: "Frontend", updated: "2 dias" },
  ],
};

export default function ComponentsShowcaseThree() {
  return (
    <PageContainer>
      <PageHeader
        title="Showcase de Componentes 3"
        description="Dois modelos de tabela: data-first na pagina e tabela dentro de card."
      />

      <TablePagePanel
        title="Modelo 1: DataTablePage (tabela principal da pagina)"
        description="Titulo e contexto ficam no header da pagina; a tabela vira o painel principal de dados."
        updatedAt="Atualizado em: 18/02/2026, 23:01:08"
        actionLabel="Atualizar"
        dataset={{ ...dataset, caption: "Listagem principal no modelo data-first." }}
      />

      <TableCardSection
        title="Modelo 2: DataTableCardSection (tabela dentro de Card)"
        description="Use quando a tabela for uma secao de uma tela maior com varios blocos de informacao."
        dataset={{ ...dataset, caption: "Ultimas entradas do ambiente de template." }}
      />
    </PageContainer>
  );
}

