import { useMemo, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Plus, Settings2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { ConfirmActionDialog, SectionHeader } from "@/components/ui/composites";
import { DataTable, type DataTableAction, type DataTableBulkAction, type DataTableColumn } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/primitives";
import { api, type MembershipPayload, type UnitPayload } from "@/services/api";
import { notify } from "@/lib/notify";
import { PROFILE_LABELS, isMembershipActiveNow } from "@/lib/membership-rules";

type DeleteUnitsDialogState = {
  ids: string[];
  description: string;
};

export default function AdminUnitsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [deleteUnitsDialog, setDeleteUnitsDialog] = useState<DeleteUnitsDialogState | null>(null);

  const unitsQuery = useQuery({ queryKey: ["admin-units"], queryFn: api.units.list });
  const membershipsQuery = useQuery({ queryKey: ["admin-memberships"], queryFn: api.memberships.list });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: api.users.list });

  const units = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);
  const selectedUnits = useMemo(
    () => units.filter((unit) => selectedKeys.has(unit.id)),
    [units, selectedKeys],
  );

  const activeMembersByUnit = useMemo(() => {
    const map = new Map<string, MembershipPayload[]>();
    for (const m of membershipsQuery.data ?? []) {
      if (!isMembershipActiveNow(m)) continue;
      const list = map.get(m.unitId) ?? [];
      list.push(m);
      map.set(m.unitId, list.sort((a, b) => a.slotPosition - b.slotPosition));
    }
    return map;
  }, [membershipsQuery.data]);

  const userNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of usersQuery.data ?? []) {
      map.set(u.id, u.name);
    }
    return map;
  }, [usersQuery.data]);

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-units"] });
  }, [queryClient]);

  const updateUnit = useMutation({
    mutationFn: (params: { id: string; active: boolean }) => api.units.update(params.id, { active: params.active }),
    onSuccess: async () => { await reload(); },
    onError: (error) => notify.error("Falha ao atualizar unidade.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const removeUnit = useMutation({
    mutationFn: (id: string) => api.units.remove(id),
    onError: (error) => notify.error("Falha ao excluir unidade.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const confirmDeleteUnits = async () => {
    if (!deleteUnitsDialog) return;

    await Promise.all(deleteUnitsDialog.ids.map((id) => removeUnit.mutateAsync(id)));
    if (deleteUnitsDialog.ids.length > 1) {
      notify.success(`${deleteUnitsDialog.ids.length} unidade(s) excluida(s).`);
      setSelectedKeys(new Set());
    } else {
      notify.success("Unidade excluida.");
    }
    setDeleteUnitsDialog(null);
    await reload();
  };

  const columns: DataTableColumn<UnitPayload>[] = [
    {
      header: "Unidade",
      sortKey: "name",
      cell: (u) => <span className="font-medium text-primary">{u.name}</span>,
    },
    {
      header: "Titular / Proprietário",
      cell: (u) => {
        const owner = (activeMembersByUnit.get(u.id) ?? []).find((member) => member.slotPosition === 1);
        if (!owner) return <span className="text-muted-foreground text-xs italic">—</span>;
        const name = userNameById.get(owner.userId) ?? "Usuário";
        return <span className="text-xs">{name}</span>;
      },
    },
    {
      header: "Vínculo 2",
      className: "hidden md:table-cell",
      cell: (u) => {
        const slot2 = (activeMembersByUnit.get(u.id) ?? []).find((member) => member.slotPosition === 2);
        if (!slot2) return <span className="text-muted-foreground text-xs italic">—</span>;
        const name = userNameById.get(slot2.userId) ?? "Usuário";
        return <span className="text-xs">{name} ({PROFILE_LABELS[slot2.profile] ?? slot2.profile})</span>;
      },
    },
    {
      header: "Vínculo 3",
      className: "hidden lg:table-cell",
      cell: (u) => {
        const slot3 = (activeMembersByUnit.get(u.id) ?? []).find((member) => member.slotPosition === 3);
        if (!slot3) return <span className="text-muted-foreground text-xs italic">—</span>;
        const name = userNameById.get(slot3.userId) ?? "Usuário";
        return <span className="text-xs">{name} ({PROFILE_LABELS[slot3.profile] ?? slot3.profile})</span>;
      },
    },
    {
      header: "Status",
      sortKey: "active",
      cell: (u) => (
        <span className={u.active ? "text-green-600 dark:text-green-400 text-xs font-medium" : "text-muted-foreground text-xs"}>
          {u.active ? "Ativa" : "Desativada"}
        </span>
      ),
    },
  ];

  const actions: DataTableAction<UnitPayload>[] = [
    {
      label: "Gerenciar",
      icon: Settings2,
      onClick: (u) => navigate(`/dashboard/admin/unidades/${u.id}/gerenciar`),
    },
    {
      label: "Desativar",
      icon: EyeOff,
      onClick: (u) => updateUnit.mutate({ id: u.id, active: false }),
      disabled: (u) => !u.active || updateUnit.isPending,
      separator: true,
    },
    {
      label: "Ativar",
      icon: Eye,
      onClick: (u) => updateUnit.mutate({ id: u.id, active: true }),
      disabled: (u) => u.active || updateUnit.isPending,
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: (u) => setDeleteUnitsDialog({
        ids: [u.id],
        description: `Excluir a unidade "${u.code}"? Esta acao nao pode ser desfeita.`,
      }),
      destructive: true,
      separator: true,
      disabled: () => removeUnit.isPending,
    },
  ];

  const bulkActions = useMemo((): DataTableBulkAction<UnitPayload>[] => {
    if (selectedUnits.length <= 0) return [];

    const deactivateAction: DataTableBulkAction<UnitPayload> = {
      label: "Desativar",
      icon: EyeOff,
      onClick: async (rows) => {
        const toHide = rows.filter((r) => r.active);
        if (!toHide.length) return;
        await Promise.all(toHide.map((r) => updateUnit.mutateAsync({ id: r.id, active: false })));
        setSelectedKeys(new Set());
        await reload();
        notify.success(`${toHide.length} unidade(s) desativada(s).`);
      },
      disabled: (rows) => rows.length === 0 || rows.every((row) => !row.active),
    };

    const activateAction: DataTableBulkAction<UnitPayload> = {
      label: "Ativar",
      icon: Eye,
      onClick: async (rows) => {
        const toShow = rows.filter((r) => !r.active);
        if (!toShow.length) return;
        await Promise.all(toShow.map((r) => updateUnit.mutateAsync({ id: r.id, active: true })));
        setSelectedKeys(new Set());
        await reload();
        notify.success(`${toShow.length} unidade(s) exibida(s).`);
      },
      disabled: (rows) => rows.length === 0 || rows.every((row) => row.active),
    };

    const deleteAction: DataTableBulkAction<UnitPayload> = {
      label: selectedUnits.length > 1 ? "Excluir selecionadas" : "Excluir",
      icon: Trash2,
      destructive: true,
      onClick: (rows) => setDeleteUnitsDialog({
        ids: rows.map((row) => row.id),
        description: `Excluir ${rows.length} unidade(s)? Esta acao nao pode ser desfeita.`,
      }),
    };

    if (selectedUnits.length === 1) {
      const [selectedUnit] = selectedUnits;
      return [
        {
          label: "Gerenciar",
          icon: Settings2,
          onClick: () => navigate(`/dashboard/admin/unidades/${selectedUnit.id}/gerenciar`),
        },
        deactivateAction,
        activateAction,
        deleteAction,
      ];
    }

    return [deactivateAction, activateAction, deleteAction];
  }, [selectedUnits, navigate, updateUnit, removeUnit, reload]);

  return (
    <PageContainer>
      <PageHeader
        title="Administracao de Unidades"
        description={`Visualize e gerencie unidades do sistema. Aqui voce pode ativar, desativar e abrir o gerenciamento dos 3 vinculos por unidade. ${units.length} unidade${units.length !== 1 ? "s" : ""} cadastrada${units.length !== 1 ? "s" : ""}.`}
        actions={
          <Button onClick={() => navigate("/dashboard/admin/unidades/adicionar")}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Unidade
          </Button>
        }
      />

      <section className="space-y-4">
        <SectionHeader
          title="Unidades cadastradas"
          description={`${units.length} unidade${units.length !== 1 ? "s" : ""} no sistema.`}
        />
        <DataTable
          data={units}
          keyExtractor={(u) => u.id}
          columns={columns}
          actions={actions}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          bulkActions={bulkActions}
          isLoading={unitsQuery.isLoading}
          emptyMessage="Nenhuma unidade cadastrada."
          defaultSortKey="code"
          defaultSortDirection="asc"
        />
      </section>

      <ConfirmActionDialog
        open={deleteUnitsDialog !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteUnitsDialog(null);
        }}
        title="Confirmar exclusao"
        description={deleteUnitsDialog?.description ?? ""}
        confirmLabel="Excluir"
        onConfirm={() => {
          void confirmDeleteUnits();
        }}
        isConfirming={removeUnit.isPending}
      />
    </PageContainer>
  );
}

