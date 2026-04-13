import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import type { MachinePayload } from "@/services/api";

type MachinePairCreateCardProps = {
  name: string;
  washerMachineId: string;
  dryerMachineId: string;
  washers: MachinePayload[];
  dryers: MachinePayload[];
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onWasherChange: (value: string) => void;
  onDryerChange: (value: string) => void;
  onSubmit: () => void;
  machineLabel: (machine: MachinePayload) => string;
};

export default function MachinePairCreateCard({
  name,
  washerMachineId,
  dryerMachineId,
  washers,
  dryers,
  isSubmitting,
  onNameChange,
  onWasherChange,
  onDryerChange,
  onSubmit,
  machineLabel,
}: MachinePairCreateCardProps) {
  return (
    <Card>
      <SectionCardHeader title="Novo Par" description="Selecione uma lavadora e uma secadora para montar o par." />
      <CardContent className="grid gap-4 md:grid-cols-[2fr_2fr_2fr_auto] md:items-end">
        <div className="space-y-2">
          <Label>Nome do par</Label>
          <Input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="Par 1" />
        </div>
        <div className="space-y-2">
          <Label>Lavadora</Label>
          <Select value={washerMachineId} onValueChange={onWasherChange}>
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
          <Select value={dryerMachineId} onValueChange={onDryerChange}>
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
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Criar Par"}
        </Button>
      </CardContent>
    </Card>
  );
}
