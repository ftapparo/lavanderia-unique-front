import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Button, Card, CardContent } from "@/components/ui/primitives";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";

const MetricCard = ({ title, value }: { title: string; value: number }) => (
  <Card>
    <SectionCardHeader title={title} />
    <CardContent>
      <p className="text-3xl font-semibold text-primary">{value}</p>
    </CardContent>
  </Card>
);

export default function AdminOpsDashboardPage() {
  const queryClient = useQueryClient();
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: api.admin.dashboard,
    refetchInterval: 30000,
  });
  const opsHealthQuery = useQuery({
    queryKey: ["admin-ops-health"],
    queryFn: api.admin.opsHealth,
    refetchInterval: 30000,
  });
  const activeSessionsQuery = useQuery({
    queryKey: ["admin-active-sessions"],
    queryFn: api.admin.activeSessions,
    refetchInterval: 15000,
  });

  const reconcileSession = useMutation({
    mutationFn: (sessionId: string) => api.admin.reconcileSession(sessionId),
    onSuccess: async () => {
      notify.success("Sessao reconciliada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["admin-active-sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (error) => notify.error("Falha ao reconciliar sessao.", {
      description: error instanceof Error ? error.message : "Erro.",
    }),
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
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard title="Sessoes ativas" value={dashboardQuery.data.activeSessionsTotal} />
            <MetricCard title="Erros Tuya (24h)" value={dashboardQuery.data.tuyaErrorsLast24h} />
            <MetricCard title="Reservas" value={dashboardQuery.data.reservationsTotal} />
            <MetricCard title="Sessoes" value={dashboardQuery.data.sessionsTotal} />
            <MetricCard title="Ocorrencias" value={dashboardQuery.data.incidentsTotal} />
            <MetricCard title="Faturas" value={dashboardQuery.data.invoicesTotal} />
          </div>
          <Card>
            <SectionCardHeader title="Jobs Operacionais" />
            <CardContent className="space-y-2">
              <p className="typo-caption text-muted-foreground">
                Scheduler: {dashboardQuery.data.jobs.started ? "ativo" : "inativo"} | Retry: {dashboardQuery.data.jobs.retry.attempts} tentativa(s)
              </p>
              <div className="space-y-2">
                {Object.entries(dashboardQuery.data.jobs.jobs).map(([jobName, job]) => (
                  <div key={jobName} className="rounded border p-2">
                    <p className="typo-caption font-medium">{jobName}</p>
                    <p className="typo-caption text-muted-foreground">
                      Status: {job.lastStatus} | Execucoes: {job.runCount} | Sucesso: {job.successCount} | Erro: {job.errorCount}
                    </p>
                    {job.lastError ? <p className="typo-caption text-destructive">Ultimo erro: {job.lastError}</p> : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <SectionCardHeader title="Saude Operacional" />
            <CardContent className="space-y-1">
              <p className="typo-caption">Banco: <strong>{opsHealthQuery.data?.db || "-"}</strong></p>
              <p className="typo-caption">Tuya: <strong>{opsHealthQuery.data?.tuya || "-"}</strong></p>
              {opsHealthQuery.data?.tuya === "error" ? (
                <p className="typo-caption text-destructive">
                  Detalhe Tuya: {String(opsHealthQuery.data.tuyaDetails)}
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <SectionCardHeader title="Reconciliacao de Sessoes Ativas" />
            <CardContent className="space-y-2">
              {(activeSessionsQuery.data || []).length === 0 ? (
                <p className="typo-caption text-muted-foreground">Nenhuma sessao ativa no momento.</p>
              ) : (
                (activeSessionsQuery.data || []).map((session) => (
                  <div key={session.id} className="rounded border p-2">
                    <p className="typo-caption font-medium">{session.machinePairName} - Unidade {session.unitName}</p>
                    <p className="typo-caption text-muted-foreground">Morador: {session.userName}</p>
                    <p className="typo-caption text-muted-foreground">
                      Inicio: {new Date(session.startedAt).toLocaleString("pt-BR")}
                    </p>
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reconcileSession.mutate(session.id)}
                        disabled={reconcileSession.isPending}
                      >
                        Reconciliar sessao
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PageContainer>
  );
}
