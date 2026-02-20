import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";
import { api, type MembershipPayload, type UnitPayload } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardHome() {
  const { profile } = useAuth();
  const [units, setUnits] = useState<UnitPayload[]>([]);
  const [memberships, setMemberships] = useState<MembershipPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [unitsResult, membershipsResult] = await Promise.all([
          api.units.list(),
          api.memberships.list(),
        ]);

        setUnits(unitsResult);
        setMemberships(membershipsResult);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Falha ao carregar dados iniciais.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Painel Inicial"
        description="Visao geral de unidades e vinculos ativos do usuario autenticado."
      />

      <Card>
        <CardHeader>
          <CardTitle>Perfil Atual</CardTitle>
          <CardDescription>Informacoes carregadas a partir do endpoint /v1/api/auth/me.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="typo-caption text-muted-foreground">Nome</p>
            <p className="typo-body font-medium">{profile?.name || "-"}</p>
          </div>
          <div>
            <p className="typo-caption text-muted-foreground">Role</p>
            <p className="typo-body font-medium">{profile?.role || "-"}</p>
          </div>
          <div>
            <p className="typo-caption text-muted-foreground">E-mail</p>
            <p className="typo-body font-medium">{profile?.email || "-"}</p>
          </div>
          <div>
            <p className="typo-caption text-muted-foreground">CPF</p>
            <p className="typo-body font-medium">{profile?.cpf || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Unidades</CardTitle>
            <CardDescription>Lista retornada por /v1/api/units.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? <p className="typo-caption text-muted-foreground">Carregando...</p> : null}
            {!loading && units.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhuma unidade encontrada.</p> : null}
            {!loading && units.map((unit) => (
              <div key={unit.id} className="rounded-md border bg-card px-3 py-2">
                <p className="typo-label text-primary">{unit.code}</p>
                <p className="typo-caption text-muted-foreground">{unit.name}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vinculos</CardTitle>
            <CardDescription>Leitura inicial de /v1/api/unit-memberships.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? <p className="typo-caption text-muted-foreground">Carregando...</p> : null}
            {!loading && memberships.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhum vinculo encontrado.</p> : null}
            {!loading && memberships.map((membership) => (
              <div key={membership.id} className="rounded-md border bg-card px-3 py-2">
                <p className="typo-label text-primary">{membership.unitCode} - {membership.profile}</p>
                <p className="typo-caption text-muted-foreground">
                  Vigencia: {membership.startDate} ate {membership.endDate || "indeterminado"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Card>
          <CardHeader>
            <CardTitle>Falha de carregamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="typo-body text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
