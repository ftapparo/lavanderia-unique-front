import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";

const groups = [
  {
    name: "Fundacao de Tema",
    description: "Tokens globais, tipografia Geist, escalas de radius/sombra e estados semanticos.",
    examples: "theme.css, ThemeProvider, ThemeSwitcher",
  },
  {
    name: "Primitives",
    description: "Blocos base reutilizaveis para formularios, overlays, navegacao e estrutura.",
    examples: "Button, Input, Select, Card, Tabs, Dialog, Tooltip, Sidebar",
  },
  {
    name: "Composites",
    description: "Componentes prontos para uso com regra de negocio de UI encapsulada.",
    examples: "DatePicker, TimePicker, DateTimePicker, TablePagePanel, TableCardSection, StatusBadgeGroup",
  },
  {
    name: "Showcases",
    description: "Catalogo de referencia visual e comportamental dos componentes do design system.",
    examples: "/dashboard/componentes-1 ate /dashboard/componentes-5",
  },
];

const availablePages = [
  { route: "/dashboard", purpose: "Guia geral do template e arquitetura do design system." },
  { route: "/dashboard/componentes-1", purpose: "Inputs e controles base (buttons, fields, checks, radios, toggles)." },
  { route: "/dashboard/componentes-2", purpose: "Feedback, navegacao contextual e overlays leves." },
  { route: "/dashboard/componentes-3", purpose: "Modelos oficiais de tabela (Page Panel e Card Section)." },
  { route: "/dashboard/componentes-4", purpose: "Overlays avancados, interacoes e toasts (Sonner)." },
  { route: "/dashboard/componentes-5", purpose: "DatePicker, TimePicker e DateTimePicker com popover." },
  { route: "/dashboard/tipografia", purpose: "Catalogo de fontes, pesos, espacamento e estilos tipograficos do projeto." },
  { route: "/dashboard/configuracoes", purpose: "Configuracao visual do tema e preferencia de experiencia." },
];

export default function DashboardHome() {
  return (
    <PageContainer>
      <PageHeader
        title="Visao Geral do Template"
        description="Documento vivo do modelo base: arquitetura, componentes disponiveis e como reutilizar no projeto."
      />

      <Card>
        <CardHeader>
          <CardTitle>Objetivo do Modelo</CardTitle>
          <CardDescription>
            Este frontend foi templateado para acelerar novos projetos com base consistente de autenticacao, layout,
            navegacao, componentes de UI e tema configuravel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="typo-body text-muted-foreground">
            Estrutura recomendada: manter logica visual em <code>src/components/ui</code>, compor telas em <code>src/pages</code> e reutilizar
            composites nas funcionalidades de negocio.
          </p>
          <p className="typo-body text-muted-foreground">
            Principios: consistencia visual, baixo acoplamento de dominio, contratos de props estaveis e evolucao
            incremental via showcases.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Card key={group.name}>
            <CardHeader>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="typo-caption text-muted-foreground">
                <span className="font-semibold text-foreground">Exemplos:</span> {group.examples}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paginas Disponiveis no Template</CardTitle>
          <CardDescription>Referencias prontas para desenvolvimento e validacao visual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {availablePages.map((item) => (
            <div key={item.route} className="rounded-md border bg-card px-3 py-2">
              <p className="typo-label text-primary">{item.route}</p>
              <p className="typo-caption text-muted-foreground">{item.purpose}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
