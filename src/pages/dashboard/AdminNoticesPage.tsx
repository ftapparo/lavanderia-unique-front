import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Wrench, CheckCircle, XCircle } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { ConfirmActionDialog, SectionHeader } from "@/components/ui/composites";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
  Textarea,
} from "@/components/ui/primitives";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/DataTable";
import { api, type MaintenancePayload } from "@/services/api";
import { notify } from "@/lib/notify";
import { MAINTENANCE_LABEL_MAP } from "@/components/dashboard/machines/MaintenanceFormDialog";

type CloseDialogState = { id: string; machineName: string; problem: string };
type CancelDialogState = { id: string; machineName: string; problem: string };

function CloseMaintenanceDialog({
  state,
  onClose,
  onConfirm,
  isConfirming,
}: {
  state: CloseDialogState | null;
  onClose: () => void;
  onConfirm: (solution: string) => void;
  isConfirming: boolean;
}) {
  const [solution, setSolution] = useState("");

  const handleOpen = (open: boolean) => {
    if (!open) { onClose(); setSolution(""); }
  };

  return (
    <Dialog open={state !== null} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Encerrar Manutenção
          </DialogTitle>
          <DialogDescription>
            {state?.machineName} — {state?.problem}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Solução aplicada (opcional)</Label>
          <Textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Descreva o que foi feito para resolver o problema..."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(solution)} disabled={isConfirming}>
            {isConfirming ? "Encerrando..." : "Encerrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getProblemLabel(problem: string): string {
  return MAINTENANCE_LABEL_MAP[problem] ?? problem;
}

export default function AdminNoticesPage() {
  const queryClient = useQueryClient();
  const [closeDialog, setCloseDialog] = useState<CloseDialogState | null>(null);
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState | null>(null);

  const maintenancesQuery = useQuery({
    queryKey: ["admin-maintenances"],
    queryFn: api.maintenances.list,
  });

  const maintenances = useMemo(() => maintenancesQuery.data ?? [], [maintenancesQuery.data]);

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-maintenances"] });
  };

  const closeMaintenance = useMutation({
    mutationFn: ({ id, solution }: { id: string; solution: string }) =>
      api.maintenances.close(id, { solution: solution.trim() || null }),
    onSuccess: async () => {
      notify.success("Manutenção encerrada.");
      setCloseDialog(null);
      await reload();
    },
    onError: (error) =>
      notify.error("Falha ao encerrar manutenção.", {
        description: error instanceof Error ? error.message : "Erro.",
      }),
  });

  const cancelMaintenance = useMutation({
    mutationFn: (id: string) => api.maintenances.cancel(id),
    onSuccess: async () => {
      notify.success("Manutenção cancelada.");
      setCancelDialog(null);
      await reload();
    },
    onError: (error) =>
      notify.error("Falha ao cancelar manutenção.", {
        description: error instanceof Error ? error.message : "Erro.",
      }),
  });

  const open = maintenances.filter((m) => m.endedAt === null && m.deletedAt === null).length;
  const closed = maintenances.filter((m) => m.endedAt !== null).length;
  const cancelled = maintenances.filter((m) => m.deletedAt !== null).length;

  const columns: DataTableColumn<MaintenancePayload>[] = [
    {
      header: "Máquina",
      sortKey: "machineNumber",
      cell: (m) => (
        <>
          <div className="font-medium">
            #{m.machineNumber} — {m.machineBrand} {m.machineModel}
          </div>
          <div className="text-xs text-muted-foreground">
            {m.machineType === "WASHER" ? "Lavadora" : "Secadora"}
          </div>
        </>
      ),
    },
    {
      header: "Problema / Tipo",
      cell: (m) => (
        <span className="text-sm">{getProblemLabel(m.problem)}</span>
      ),
    },
    {
      header: "Solução",
      className: "hidden lg:table-cell text-muted-foreground",
      cell: (m) =>
        m.solution ? (
          <span className="text-xs line-clamp-2">{m.solution}</span>
        ) : (
          <span className="italic text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Início",
      sortKey: "startedAt",
      cell: (m) => (
        <span className="text-sm tabular-nums">
          {new Date(m.startedAt).toLocaleDateString("pt-BR")}
        </span>
      ),
    },
    {
      header: "Status",
      sortKey: "endedAt",
      cell: (m) =>
        m.deletedAt !== null ? (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <XCircle className="h-3 w-3" />
            Cancelada
          </Badge>
        ) : m.endedAt === null ? (
          <Badge variant="default" className="gap-1">
            <Wrench className="h-3 w-3" />
            Aberta
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Encerrada
          </Badge>
        ),
    },
    {
      header: "Encerramento",
      sortKey: "endedAt",
      className: "hidden md:table-cell",
      cell: (m) =>
        m.endedAt ? (
          <span className="text-sm tabular-nums text-muted-foreground">
            {new Date(m.endedAt).toLocaleDateString("pt-BR")}
          </span>
        ) : (
          <span className="italic text-muted-foreground text-xs">—</span>
        ),
    },
    {
      header: "Registrado por",
      className: "hidden md:table-cell text-muted-foreground",
      cell: (m) => m.createdByUserName ?? <span className="italic text-muted-foreground">—</span>,
    },
  ];

  const actions: DataTableAction<MaintenancePayload>[] = [
    {
      label: "Encerrar manutenção",
      icon: CheckCircle,
      onClick: (m) =>
        setCloseDialog({
          id: m.id,
          machineName: `#${m.machineNumber} ${m.machineBrand} ${m.machineModel}`,
          problem: getProblemLabel(m.problem),
        }),
      disabled: (m) => m.endedAt !== null || m.deletedAt !== null,
    },
    {
      label: "Cancelar manutenção",
      icon: XCircle,
      onClick: (m) =>
        setCancelDialog({
          id: m.id,
          machineName: `#${m.machineNumber} ${m.machineBrand} ${m.machineModel}`,
          problem: getProblemLabel(m.problem),
        }),
      disabled: (m) => m.endedAt !== null || m.deletedAt !== null,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Informativos e Manutenções"
        description="Acompanhe manutenções registradas e em andamento nas máquinas."
      />

      <section className="space-y-4">
        <SectionHeader
          title="Manutenções registradas"
          description={
            maintenances.length === 0
              ? "Nenhuma manutenção registrada."
              : `${maintenances.length} registro${maintenances.length !== 1 ? "s" : ""} · ${open} aberta${open !== 1 ? "s" : ""} · ${closed} encerrada${closed !== 1 ? "s" : ""} · ${cancelled} cancelada${cancelled !== 1 ? "s" : ""}`
          }
        />

        <DataTable
          data={maintenances}
          keyExtractor={(m) => m.id}
          isLoading={maintenancesQuery.isLoading}
          emptyMessage="Nenhuma manutenção registrada. Use o botão 'Manutenção' nos cards de máquina para registrar."
          defaultSortKey="startedAt"
          defaultSortDirection="desc"
          columns={columns}
          actions={actions}
        />
      </section>

      <CloseMaintenanceDialog
        state={closeDialog}
        onClose={() => setCloseDialog(null)}
        onConfirm={(solution) => {
          if (closeDialog) closeMaintenance.mutate({ id: closeDialog.id, solution });
        }}
        isConfirming={closeMaintenance.isPending}
      />

      <ConfirmActionDialog
        open={cancelDialog !== null}
        onOpenChange={(open) => { if (!open) setCancelDialog(null); }}
        title="Cancelar manutenção"
        description={cancelDialog
          ? `Cancelar a manutenção de ${cancelDialog.machineName} (${cancelDialog.problem})? A máquina voltará ao status ativo.`
          : ""}
        confirmLabel="Cancelar manutenção"
        onConfirm={() => {
          if (cancelDialog) cancelMaintenance.mutate(cancelDialog.id, { onSuccess: () => setCancelDialog(null) });
        }}
        isConfirming={cancelMaintenance.isPending}
      />
    </PageContainer>
  );
}
