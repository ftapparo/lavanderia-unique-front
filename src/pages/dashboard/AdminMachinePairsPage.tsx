import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { api, type MachinePayload } from "@/services/api";
import { notify } from "@/lib/notify";
import MachinePairCreateCard from "@/components/dashboard/machine-pairs/MachinePairCreateCard";
import MachinePairListCard from "@/components/dashboard/machine-pairs/MachinePairListCard";

export default function AdminMachinePairsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [washerMachineId, setWasherMachineId] = useState("");
  const [dryerMachineId, setDryerMachineId] = useState("");

  const machinesQuery = useQuery({ queryKey: ["admin-machines"], queryFn: api.machines.list });
  const pairsQuery = useQuery({ queryKey: ["machine-pairs"], queryFn: api.machinePairs.list });

  const machines = useMemo(() => machinesQuery.data || [], [machinesQuery.data]);
  const washers = machines.filter((machine) => machine.type === "WASHER" && machine.active);
  const dryers = machines.filter((machine) => machine.type === "DRYER" && machine.active);
  const pairs = pairsQuery.data || [];

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["machine-pairs"] });
  };

  const createPair = useMutation({
    mutationFn: () => api.machinePairs.create({
      name,
      washerMachineId,
      dryerMachineId,
      active: true,
    }),
    onSuccess: async () => {
      notify.success("Par de maquinas criado.");
      setName("");
      setWasherMachineId("");
      setDryerMachineId("");
      await reload();
    },
    onError: (error) => notify.error("Falha ao criar par.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const machineLabel = (machine: MachinePayload) => `#${machine.number} - ${machine.brand} ${machine.model}`;

  return (
    <PageContainer>
      <PageHeader
        title="Admin Pares"
        description="Configure os pares de uso vinculando uma lavadora e uma secadora."
      />

      <MachinePairCreateCard
        name={name}
        washerMachineId={washerMachineId}
        dryerMachineId={dryerMachineId}
        washers={washers}
        dryers={dryers}
        isSubmitting={createPair.isPending}
        onNameChange={setName}
        onWasherChange={setWasherMachineId}
        onDryerChange={setDryerMachineId}
        onSubmit={() => createPair.mutate()}
        machineLabel={machineLabel}
      />

      <MachinePairListCard pairs={pairs} />
    </PageContainer>
  );
}
