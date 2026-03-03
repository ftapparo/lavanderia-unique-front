import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { api } from "@/services/api";

const variantByType = (type: string): "default" | "secondary" | "destructive" | "outline" => {
  if (type === "TUYA_ERROR") return "destructive";
  if (type === "OVERTIME") return "secondary";
  if (type === "FORCED_SHUTDOWN") return "outline";
  return "default";
};

export default function AdminIncidentsPage() {
  const incidentsQuery = useQuery({
    queryKey: ["incidents"],
    queryFn: api.incidents.list,
    refetchInterval: 30000,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Ocorrencias"
        description="Eventos operacionais como no-show, overtime e falhas Tuya."
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocorrencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {incidentsQuery.isLoading ? <p className="typo-caption text-muted-foreground">Carregando ocorrencias...</p> : null}
          {incidentsQuery.isError ? (
            <p className="typo-caption text-destructive">
              {incidentsQuery.error instanceof Error ? incidentsQuery.error.message : "Falha ao carregar ocorrencias."}
            </p>
          ) : null}

          {(incidentsQuery.data || []).map((incident) => (
            <div key={incident.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={variantByType(incident.type)}>{incident.type}</Badge>
                <span className="typo-caption text-muted-foreground">
                  {new Date(incident.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 typo-body">{incident.description}</p>
              <p className="typo-caption text-muted-foreground">
                Unidade: {incident.unitName || "-"} | Usuario: {incident.userName || "-"}
              </p>
            </div>
          ))}

          {(incidentsQuery.data || []).length === 0 && !incidentsQuery.isLoading ? (
            <p className="typo-caption text-muted-foreground">Nenhuma ocorrencia registrada.</p>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
