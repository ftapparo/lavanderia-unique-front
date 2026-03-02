import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { api, type MachinePayload } from "@/services/api";
import { notify } from "@/lib/notify";

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

      <Card>
        <CardHeader>
          <CardTitle>Novo Par</CardTitle>
          <CardDescription>Selecione uma lavadora e uma secadora para montar o par.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[2fr_2fr_2fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Nome do par</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Par 1" />
          </div>
          <div className="space-y-2">
            <Label>Lavadora</Label>
            <Select value={washerMachineId} onValueChange={setWasherMachineId}>
              <SelectTrigger><SelectValue placeholder="Selecione a lavadora" /></SelectTrigger>
              <SelectContent>
                {washers.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machineLabel(machine)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Secadora</Label>
            <Select value={dryerMachineId} onValueChange={setDryerMachineId}>
              <SelectTrigger><SelectValue placeholder="Selecione a secadora" /></SelectTrigger>
              <SelectContent>
                {dryers.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id}>
                    {machineLabel(machine)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createPair.mutate()} disabled={createPair.isPending}>
            {createPair.isPending ? "Criando..." : "Criar Par"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pares Cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pairs.map((pair) => (
            <div key={pair.id} className="rounded-md border p-3">
              <p className="typo-label text-primary">{pair.name}</p>
              <p className="typo-caption text-muted-foreground">
                {pair.washerMachineName} + {pair.dryerMachineName}
              </p>
            </div>
          ))}
          {pairs.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhum par cadastrado.</p> : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
