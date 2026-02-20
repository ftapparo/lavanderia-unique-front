import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Server } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Card, CardContent } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { api } from "@/services/api";

const formatTimestamp = (value: number): string => new Date(value).toLocaleString("pt-BR");

export default function HealthDashboard() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const isHealthy = healthQuery.isSuccess && healthQuery.data?.status;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Monitoramento basico da conectividade com a API."
        actions={(
          <Button
            type="button"
            size="sm"
            onClick={() => { void healthQuery.refetch(); }}
            disabled={healthQuery.isFetching}
            className="h-9"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${healthQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        )}
      />

      <Card className="shadow-sm">
        <SectionCardHeader
          title="Status da API"
          description="Endpoint monitorado: /v1/api/health"
          action={(
            <Badge className={isHealthy ? "state-success-soft border" : "state-danger-soft border"}>
              {healthQuery.isLoading || healthQuery.isFetching ? "Verificando" : isHealthy ? "Online" : "Offline"}
            </Badge>
          )}
        />
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
            <Server className="h-5 w-5 text-primary" />
            <div className="min-w-0">
              <p className="typo-body font-semibold text-foreground">
                {healthQuery.data?.status || "Sem dados de status"}
              </p>
              <p className="typo-caption text-muted-foreground">
                Ambiente: {healthQuery.data?.environment || "--"}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4">
            {healthQuery.isLoading ? (
              <p className="typo-body text-muted-foreground">Carregando status da API...</p>
            ) : healthQuery.isError ? (
              <p className="typo-body text-status-danger-soft-foreground">
                {healthQuery.error instanceof Error ? healthQuery.error.message : "Falha ao consultar API."}
              </p>
            ) : (
              <p className="typo-body text-muted-foreground">
                Ultima atualizacao: {formatTimestamp(healthQuery.dataUpdatedAt || Date.now())}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

