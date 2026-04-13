import { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Card, CardContent } from "@/components/ui/primitives";
import { api, type MembershipPayload, type UnitPayload } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRoleLabel } from "@/lib/user-role-labels";

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
        <SectionCardHeader title="Perfil Atual" description="Informacoes carregadas a partir do endpoint /v1/api/auth/me." />
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="typo-caption text-muted-foreground">Nome</p>
            <p className="typo-body font-medium">{profile?.name || "-"}</p>
          </div>
          <div>
            <p className="typo-caption text-muted-foreground">Role</p>
            <p className="typo-body font-medium">{profile?.role ? getUserRoleLabel(profile.role) : "-"}</p>
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
          <SectionCardHeader title="Unidades" description="Lista retornada por /v1/api/units." />
          <CardContent className="space-y-2">
            {loading ? <p className="typo-caption text-muted-foreground">Carregando...</p> : null}
            {!loading && units.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhuma unidade encontrada.</p> : null}
            {!loading && units.map((unit) => (
              <div key={unit.id} className="rounded-md border bg-card px-3 py-2">
                <p className="typo-label text-primary">{unit.code}</p>
                <p className="typo-caption text-muted-foreground">{unit.active ? "Ativa" : "Oculta"}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <SectionCardHeader title="Vinculos" description="Leitura inicial de /v1/api/unit-memberships." />
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
          <SectionCardHeader title="Falha de carregamento" />
          <CardContent>
            <p className="typo-body text-destructive">{error}</p>
          </CardContent>
        </Card>
      ) : null}
    </PageContainer>
  );
}
