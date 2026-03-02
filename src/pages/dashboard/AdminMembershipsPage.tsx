import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { api, type MembershipPayload, type UnitPayload, type UserListItemPayload } from "@/services/api";
import { notify } from "@/lib/notify";

export default function AdminMembershipsPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [profile, setProfile] = useState("MORADOR");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: api.users.list });
  const unitsQuery = useQuery({ queryKey: ["admin-units"], queryFn: api.units.list });
  const membershipsQuery = useQuery({ queryKey: ["admin-memberships"], queryFn: api.memberships.list });

  const users = usersQuery.data || [];
  const units = (unitsQuery.data || []).filter((unit) => unit.active);
  const memberships = useMemo(() => membershipsQuery.data || [], [membershipsQuery.data]);

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
  };

  const createMembership = useMutation({
    mutationFn: () => api.memberships.create({
      userId,
      unitId,
      profile,
      startDate,
      endDate: endDate || null,
      active: true,
    }),
    onSuccess: async () => {
      notify.success("Vinculo criado.");
      setEndDate("");
      await reload();
    },
    onError: (error) => notify.error("Falha ao criar vinculo.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const toggleMembership = useMutation({
    mutationFn: (membership: MembershipPayload) => api.memberships.update(membership.id, { active: !membership.active }),
    onSuccess: async () => {
      notify.success("Vinculo atualizado.");
      await reload();
    },
    onError: (error) => notify.error("Falha ao atualizar vinculo.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const userNameById = (id: string) => users.find((user: UserListItemPayload) => user.id === id)?.name || id;

  return (
    <PageContainer>
      <PageHeader
        title="Administracao de Vinculos"
        description="Vincule usuarios a unidades com periodo de vigencia."
      />

      <Card>
        <CardHeader>
          <CardTitle>Novo Vinculo</CardTitle>
          <CardDescription>Crie vinculos entre usuario e unidade.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecione um usuario" /></SelectTrigger>
              <SelectContent>
                {users.map((user: UserListItemPayload) => (
                  <SelectItem key={user.id} value={user.id}>{user.name} ({user.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Unidade</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger><SelectValue placeholder="Selecione uma unidade" /></SelectTrigger>
              <SelectContent>
                {units.map((unit: UnitPayload) => (
                  <SelectItem key={unit.id} value={unit.id}>{unit.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Perfil</Label>
            <Input value={profile} onChange={(e) => setProfile(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Data de inicio</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Data final (opcional)</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={() => createMembership.mutate()} disabled={createMembership.isPending}>Criar Vinculo</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Vinculos Cadastrados</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {memberships.map((membership) => (
            <div key={membership.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="typo-label text-primary">{membership.unitCode} - {membership.profile}</p>
                  <p className="typo-caption text-muted-foreground">
                    Usuario: {userNameById(membership.userId)} | Vigencia: {membership.startDate} ate {membership.endDate || "indeterminado"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={membership.active ? "destructive" : "outline"}
                  onClick={() => toggleMembership.mutate(membership)}
                >
                  {membership.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>
          ))}
          {memberships.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhum vinculo cadastrado.</p> : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
