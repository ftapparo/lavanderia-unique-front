import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { api, type MembershipPayload, type UnitPayload, type UserListItemPayload } from "@/services/api";
import { notify } from "@/lib/notify";
import MembershipCreateCard from "@/components/dashboard/memberships/MembershipCreateCard";
import MembershipListCard from "@/components/dashboard/memberships/MembershipListCard";

export default function AdminMembershipsPage() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [profile, setProfile] = useState("PROPRIETARIO");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: api.users.list });
  const unitsQuery = useQuery({ queryKey: ["admin-units"], queryFn: api.units.list });
  const profilesQuery = useQuery({ queryKey: ["membership-profiles"], queryFn: api.memberships.listProfiles });
  const membershipsQuery = useQuery({ queryKey: ["admin-memberships"], queryFn: api.memberships.list });

  const users = usersQuery.data || [];
  const units = (unitsQuery.data || []).filter((unit) => unit.active);
  const profiles = profilesQuery.data || [];
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

      <MembershipCreateCard
        userId={userId}
        unitId={unitId}
        profile={profile}
        startDate={startDate}
        endDate={endDate}
        users={users}
        units={units}
        profiles={profiles}
        isSubmitting={createMembership.isPending}
        onUserIdChange={setUserId}
        onUnitIdChange={setUnitId}
        onProfileChange={setProfile}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onSubmit={() => createMembership.mutate()}
      />

      <MembershipListCard
        memberships={memberships}
        userNameById={userNameById}
        onToggleActive={(membership) => toggleMembership.mutate(membership)}
      />
    </PageContainer>
  );
}
