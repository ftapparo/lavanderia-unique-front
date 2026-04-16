import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { ConfirmActionDialog, SectionHeader } from "@/components/ui/composites";
import { Button } from "@/components/ui/primitives";
import { api, type MachinePayload, type MachineType } from "@/services/api";
import { notify } from "@/lib/notify";
import MachineCard from "@/components/dashboard/machines/MachineCard";
import MachineFormDialog from "@/components/dashboard/machines/MachineFormDialog";
import MaintenanceFormDialog, { type MaintenanceFormValues } from "@/components/dashboard/machines/MaintenanceFormDialog";
type MachineFormValues = {
  number: string;
  brand: string;
  model: string;
  type: MachineType;
  tuyaDeviceId: string;
};

const emptyForm: MachineFormValues = {
  number: "",
  brand: "",
  model: "",
  type: "WASHER",
  tuyaDeviceId: "",
};

const parsePositiveInt = (value: string): number => Number.parseInt(value, 10);

export default function AdminMachinesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<MachineFormValues>(emptyForm);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MachineFormValues>(emptyForm);
  const [deleteTargetMachine, setDeleteTargetMachine] = useState<MachinePayload | null>(null);
  const [maintenanceMachine, setMaintenanceMachine] = useState<MachinePayload | null>(null);

  const machinesQuery = useQuery({ queryKey: ["admin-machines"], queryFn: api.machines.list });
  const machines = useMemo(() => machinesQuery.data || [], [machinesQuery.data]);

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-machines"] });
  };

  const createMachine = useMutation({
    mutationFn: () => api.machines.create({
      number: parsePositiveInt(createForm.number),
      brand: createForm.brand,
      model: createForm.model,
      type: createForm.type,
      tuyaDeviceId: createForm.tuyaDeviceId.trim() || undefined,
    }),
    onSuccess: async () => {
      notify.success("Maquina criada.");
      setCreateForm(emptyForm);
      setCreateOpen(false);
      await reload();
    },
    onError: (error) => notify.error("Falha ao criar maquina.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const updateMachine = useMutation({
    mutationFn: () => api.machines.update(String(editId), {
      number: parsePositiveInt(editForm.number),
      brand: editForm.brand,
      model: editForm.model,
      type: editForm.type,
      tuyaDeviceId: editForm.tuyaDeviceId.trim() || null,
    }),
    onSuccess: async () => {
      notify.success("Maquina atualizada.");
      setEditId(null);
      await reload();
    },
    onError: (error) => notify.error("Falha ao atualizar maquina.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const toggleMachine = useMutation({
    mutationFn: (machine: MachinePayload) => api.machines.update(machine.id, { active: !machine.active }),
    onSuccess: async () => {
      notify.success("Status da maquina atualizado.");
      await reload();
    },
    onError: (error) => notify.error("Falha ao alterar status da maquina.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const createMaintenance = useMutation({
    mutationFn: (values: MaintenanceFormValues) =>
      api.maintenances.open(maintenanceMachine!.id, {
        problem: values.problem,
        startedAt: values.startedAt!.toISOString(),
      }),
    onSuccess: async () => {
      notify.success("Manutenção registrada.");
      setMaintenanceMachine(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-maintenances"] });
    },
    onError: (error) => notify.error("Falha ao registrar manutenção.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const removeMachine = useMutation({
    mutationFn: (id: string) => api.machines.remove(id),
    onSuccess: async () => {
      notify.success("Maquina removida.");
      await reload();
    },
    onError: (error) => notify.error("Falha ao remover maquina.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const handleEdit = (machine: MachinePayload) => {
    setEditId(machine.id);
    setEditForm({
      number: String(machine.number),
      brand: machine.brand,
      model: machine.model,
      type: machine.type,
      tuyaDeviceId: machine.tuyaDeviceId || "",
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Administracao de Maquinas"
        description="Cadastro de maquinas sem vinculo de unidade."
        actions={(
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Maquina
          </Button>
        )}
      />

      <div className="space-y-4">
        <SectionHeader title="Maquinas cadastradas" description="Cada card representa uma maquina individual." />

        {machines.length === 0 ? (
          <p className="typo-caption text-muted-foreground">Nenhuma maquina cadastrada.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {machines.map((machine) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                onEdit={handleEdit}
                onToggleActive={(item) => toggleMachine.mutate(item)}
                onRemove={(item) => setDeleteTargetMachine(item)}
                onMaintenance={(item) => setMaintenanceMachine(item)}
              />
            ))}
          </div>
        )}
      </div>

      <MachineFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Nova Maquina"
        description="Informe numero, marca, modelo, tipo e ID da tomada Tuya."
        submitLabel="Criar"
        loadingLabel="Criando..."
        isSubmitting={createMachine.isPending}
        values={createForm}
        onChange={setCreateForm}
        onSubmit={() => createMachine.mutate()}
      />

      <MachineFormDialog
        open={Boolean(editId)}
        onOpenChange={(open) => { if (!open) setEditId(null); }}
        title="Editar Maquina"
        description="Atualize os dados da maquina e o vinculo da tomada Tuya."
        submitLabel="Salvar"
        loadingLabel="Salvando..."
        isSubmitting={updateMachine.isPending}
        values={editForm}
        onChange={setEditForm}
        onSubmit={() => updateMachine.mutate()}
      />

      {maintenanceMachine && (
        <MaintenanceFormDialog
          open={maintenanceMachine !== null}
          onOpenChange={(open) => { if (!open) setMaintenanceMachine(null); }}
          machine={maintenanceMachine}
          isSubmitting={createMaintenance.isPending}
          onSubmit={(values) => createMaintenance.mutate(values)}
        />
      )}

      <ConfirmActionDialog
        open={deleteTargetMachine !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetMachine(null);
        }}
        title="Confirmar exclusao"
        description={deleteTargetMachine
          ? `Excluir a maquina #${deleteTargetMachine.number} (${deleteTargetMachine.brand} ${deleteTargetMachine.model})? Esta acao nao pode ser desfeita.`
          : ""}
        confirmLabel="Excluir"
        onConfirm={() => {
          if (!deleteTargetMachine) return;
          removeMachine.mutate(deleteTargetMachine.id, {
            onSuccess: () => setDeleteTargetMachine(null),
          });
        }}
        isConfirming={removeMachine.isPending}
      />
    </PageContainer>
  );
}
