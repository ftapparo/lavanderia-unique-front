import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { api } from "@/services/api";

const MetricCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-3xl font-semibold text-primary">{value}</p>
    </CardContent>
  </Card>
);

export default function AdminOpsDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: api.admin.dashboard,
    refetchInterval: 30000,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Administrativo"
        description="Visao operacional consolidada da lavanderia."
      />

      {dashboardQuery.isLoading ? <p className="typo-caption text-muted-foreground">Carregando indicadores...</p> : null}
      {dashboardQuery.isError ? (
        <p className="typo-caption text-destructive">
          {dashboardQuery.error instanceof Error ? dashboardQuery.error.message : "Falha ao carregar dashboard."}
        </p>
      ) : null}

      {dashboardQuery.data ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Reservas" value={dashboardQuery.data.reservationsTotal} />
          <MetricCard title="Sessoes" value={dashboardQuery.data.sessionsTotal} />
          <MetricCard title="Ocorrencias" value={dashboardQuery.data.incidentsTotal} />
          <MetricCard title="Faturas" value={dashboardQuery.data.invoicesTotal} />
        </div>
      ) : null}
    </PageContainer>
  );
}
