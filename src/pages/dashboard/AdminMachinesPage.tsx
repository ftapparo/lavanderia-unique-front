import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { api, type MachinePayload, type MachineType } from "@/services/api";
import { notify } from "@/lib/notify";

const parsePositiveInt = (value: string): number => Number.parseInt(value, 10);

export default function AdminMachinesPage() {
  const queryClient = useQueryClient();
  const [number, setNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<MachineType>("WASHER");

  const [editId, setEditId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editType, setEditType] = useState<MachineType>("WASHER");

  const machinesQuery = useQuery({ queryKey: ["admin-machines"], queryFn: api.machines.list });
  const machines = useMemo(() => machinesQuery.data || [], [machinesQuery.data]);

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-machines"] });
  };

  const createMachine = useMutation({
    mutationFn: () => api.machines.create({
      number: parsePositiveInt(number),
      brand,
      model,
      type,
    }),
    onSuccess: async () => {
      notify.success("Maquina criada.");
      setNumber("");
      setBrand("");
      setModel("");
      setType("WASHER");
      await reload();
    },
    onError: (error) => notify.error("Falha ao criar maquina.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const updateMachine = useMutation({
    mutationFn: () => api.machines.update(String(editId), {
      number: parsePositiveInt(editNumber),
      brand: editBrand,
      model: editModel,
      type: editType,
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

  const removeMachine = useMutation({
    mutationFn: (id: string) => api.machines.remove(id),
    onSuccess: async () => {
      notify.success("Maquina removida.");
      await reload();
    },
    onError: (error) => notify.error("Falha ao remover maquina.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Administracao de Maquinas"
        description="Cadastro de maquinas sem vinculo de unidade."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nova Maquina</CardTitle>
          <CardDescription>Informe numero, marca, modelo e tipo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_2fr_2fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Numero</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(value) => setType(value as MachineType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WASHER">Lavadora</SelectItem>
                <SelectItem value="DRYER">Secadora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMachine.mutate()} disabled={createMachine.isPending}>Criar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Maquinas Cadastradas</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {machines.map((machine: MachinePayload) => (
            <div key={machine.id} className="rounded-md border p-3">
              {editId === machine.id ? (
                <div className="grid gap-3 md:grid-cols-[1fr_2fr_2fr_1fr_auto_auto] md:items-end">
                  <Input value={editNumber} onChange={(e) => setEditNumber(e.target.value)} inputMode="numeric" />
                  <Input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} />
                  <Input value={editModel} onChange={(e) => setEditModel(e.target.value)} />
                  <Select value={editType} onValueChange={(value) => setEditType(value as MachineType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WASHER">Lavadora</SelectItem>
                      <SelectItem value="DRYER">Secadora</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => updateMachine.mutate()}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditId(null)}>Cancelar</Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="typo-label text-primary">#{machine.number} - {machine.brand} {machine.model}</p>
                    <p className="typo-caption text-muted-foreground">
                      {machine.type === "WASHER" ? "Lavadora" : "Secadora"} | {machine.active ? "Ativa" : "Inativa"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditId(machine.id);
                        setEditNumber(String(machine.number));
                        setEditBrand(machine.brand);
                        setEditModel(machine.model);
                        setEditType(machine.type);
                      }}
                    >
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleMachine.mutate(machine)}>
                      {machine.active ? "Inativar" : "Ativar"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeMachine.mutate(machine.id)}>Remover</Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {machines.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhuma maquina cadastrada.</p> : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
