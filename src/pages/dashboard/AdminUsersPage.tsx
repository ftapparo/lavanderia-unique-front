import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, KeyRound, Plus, Trash2 } from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button, Badge } from "@/components/ui/primitives";
import { DataTable, type DataTableColumn, type DataTableAction, type DataTableBulkAction } from "@/components/ui/DataTable";
import { api, type UserListItemPayload, type MembershipPayload } from "@/services/api";
import { notify } from "@/lib/notify";
import ResetPasswordDialog from "@/components/dashboard/users/ResetPasswordDialog";
import { getUserRoleLabel } from "@/lib/user-role-labels";

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  USER: "secondary",
  ADMIN: "default",
  SUPER: "destructive",
};

const formatDocument = (value: string): string => {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 11) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<{ id: string; name: string } | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: api.users.list });
  const membershipsQuery = useQuery({ queryKey: ["admin-memberships"], queryFn: api.memberships.list });
  const users = useMemo(() => usersQuery.data || [], [usersQuery.data]);
  const selectedUsers = useMemo(
    () => users.filter((user) => selectedKeys.has(user.id)),
    [users, selectedKeys],
  );

  const unitsByUser = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const m of (membershipsQuery.data ?? []) as MembershipPayload[]) {
      if (!m.active) continue;
      const codes = map.get(m.userId) ?? [];
      codes.push(m.unitCode);
      map.set(m.userId, codes);
    }
    return map;
  }, [membershipsQuery.data]);

  const reload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  }, [queryClient]);

  const resetPassword = useMutation({
    mutationFn: (input: { password?: string; mustChangePassword?: boolean }) =>
      api.users.resetPassword(String(resetUser?.id), input),
    onSuccess: async (result) => {
      setResetUser(null);
      await reload();
      if (result.generatedPin) {
        setGeneratedPin(result.generatedPin);
      } else {
        notify.success("Senha redefinida com sucesso.");
      }
    },
    onError: (error) =>
      notify.error("Falha ao redefinir senha.", {
        description: error instanceof Error ? error.message : "Erro.",
      }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.users.remove(id),
    onSuccess: async () => {
      notify.success("Usuario excluido.");
      setDeleteId(null);
      await reload();
    },
    onError: (error) => {
      notify.error("Falha ao excluir usuario.", {
        description: error instanceof Error ? error.message : "Erro.",
      });
      setDeleteId(null);
    },
  });

  const handleEdit = (user: UserListItemPayload) => {
    navigate(`/dashboard/admin/usuarios/${user.id}/editar`);
  };

  const handleOpenReset = (user: UserListItemPayload) => {
    setGeneratedPin(null);
    setResetUser({ id: user.id, name: user.name });
  };

  const handleDelete = (user: UserListItemPayload) => {
    if (!window.confirm(`Excluir o usuario "${user.name}"? Esta acao nao pode ser desfeita.`)) return;
    setDeleteId(user.id);
    deleteUser.mutate(user.id);
  };

  const bulkActions = useMemo((): DataTableBulkAction<UserListItemPayload>[] => {
    if (selectedUsers.length <= 0) return [];

    const deleteAction: DataTableBulkAction<UserListItemPayload> = {
      label: selectedUsers.length > 1 ? "Excluir selecionados" : "Excluir",
      icon: Trash2,
      destructive: true,
      onClick: async (rows) => {
        if (!window.confirm(`Excluir ${rows.length} usuario(s)? Esta acao nao pode ser desfeita.`)) return;
        await Promise.all(rows.map((u) => deleteUser.mutateAsync(u.id)));
        setSelectedKeys(new Set());
        await reload();
        notify.success(`${rows.length} usuario(s) excluido(s).`);
      },
    };

    if (selectedUsers.length === 1) {
      const [selectedUser] = selectedUsers;
      return [
        {
          label: "Editar",
          icon: Pencil,
          onClick: () => handleEdit(selectedUser),
        },
        {
          label: "Redefinir senha",
          icon: KeyRound,
          onClick: () => handleOpenReset(selectedUser),
        },
        deleteAction,
      ];
    }

    return [deleteAction];
  }, [selectedUsers, deleteUser, reload]);

  return (
    <PageContainer>
      <PageHeader
        title="Administracao de Usuarios"
        description="Crie, edite e exclua usuarios do sistema. Vinculos com unidades sao gerenciados na tela de Unidades."
        actions={(
          <Button onClick={() => navigate("/dashboard/admin/usuarios/novo")}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Usuario
          </Button>
        )}
      />

      <section className="space-y-4">
        <div>
          <h2 className="typo-section-title">Usuarios cadastrados</h2>
          <p className="typo-caption text-muted-foreground">
            {users.length} usuario{users.length !== 1 ? "s" : ""} no sistema.
          </p>
        </div>
        <DataTable
          data={users}
          keyExtractor={(u) => u.id}
          isLoading={usersQuery.isLoading}
          emptyMessage="Nenhum usuario cadastrado."
          defaultSortKey="name"
          defaultSortDirection="asc"
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          bulkActions={bulkActions}
          columns={[
            {
              header: "Nome",
              sortKey: "name",
              cell: (u) => (
                <>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{formatDocument(u.cpf)}</div>
                  {u.mustChangePassword && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">Troca de senha pendente</span>
                  )}
                </>
              ),
            },
            {
              header: "CPF/CNPJ",
              sortKey: "cpf",
              className: "hidden md:table-cell text-muted-foreground font-mono text-xs",
              cell: (u) => formatDocument(u.cpf),
            },
            {
              header: "E-mail",
              sortKey: "email",
              className: "hidden lg:table-cell text-muted-foreground",
              cell: (u) => u.email,
            },
            {
              header: "Papel",
              sortKey: "role",
              cell: (u) => (
                <Badge variant={ROLE_VARIANTS[u.role] ?? "secondary"}>
                  {getUserRoleLabel(u.role)}
                </Badge>
              ),
            },
            {
              header: "Unidades",
              className: "hidden lg:table-cell",
              cell: (u) => {
                const codes = unitsByUser.get(u.id) ?? [];
                if (!codes.length) return <span className="text-muted-foreground text-xs italic">—</span>;
                const visible = codes.slice(0, 5);
                const extra = codes.length - visible.length;
                return (
                  <span className="text-xs font-mono">
                    {visible.join(", ")}
                    {extra > 0 && <span className="text-muted-foreground"> ...+{extra}</span>}
                  </span>
                );
              },
            },
            {
              header: "Cargo",
              sortKey: "cargo",
              className: "hidden md:table-cell text-muted-foreground",
              cell: (u) => u.cargo || <span className="italic">—</span>,
            },
          ] satisfies DataTableColumn<typeof users[0]>[]}
          actions={[
            { label: "Editar", icon: Pencil, onClick: handleEdit },
            { label: "Redefinir senha", icon: KeyRound, onClick: handleOpenReset },
            {
              label: "Excluir",
              icon: Trash2,
              onClick: handleDelete,
              destructive: true,
              separator: true,
              disabled: (u) => deleteId === u.id,
              isLoading: (u) => deleteId === u.id,
              loadingLabel: "Excluindo...",
            },
          ] satisfies DataTableAction<typeof users[0]>[]}
        />
      </section>

      {generatedPin && (
        <div className="state-warning-soft fixed bottom-4 right-4 z-50 max-w-sm rounded-lg border p-4 shadow-lg">
          <p className="text-sm font-semibold">PIN gerado</p>
          <p className="mt-1 font-mono text-2xl font-bold">{generatedPin}</p>
          <p className="mt-1 text-xs">Anote este PIN. Ele nao sera exibido novamente.</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => setGeneratedPin(null)}>
            OK, anotei
          </Button>
        </div>
      )}

      <ResetPasswordDialog
        open={Boolean(resetUser)}
        onOpenChange={(open) => { if (!open) setResetUser(null); }}
        userName={resetUser?.name ?? ""}
        isResetting={resetPassword.isPending}
        onConfirm={(password, mustChangePassword) => resetPassword.mutate({ password, mustChangePassword })}
      />
    </PageContainer>
  );
}
