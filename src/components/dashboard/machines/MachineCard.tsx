import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Button, Card, CardContent } from "@/components/ui/primitives";
import type { MachinePayload } from "@/services/api";

type MachineCardProps = {
  machine: MachinePayload;
  onEdit: (machine: MachinePayload) => void;
  onToggleActive: (machine: MachinePayload) => void;
  onRemove: (machine: MachinePayload) => void;
};

export default function MachineCard({ machine, onEdit, onToggleActive, onRemove }: MachineCardProps) {
  return (
    <Card>
      <SectionCardHeader
        title={`#${machine.number} - ${machine.brand} ${machine.model}`}
        description={`${machine.type === "WASHER" ? "Lavadora" : "Secadora"} | ${machine.active ? "Ativa" : "Inativa"}`}
      />
      <CardContent className="space-y-4">
        <p className="typo-caption text-muted-foreground">
          Tuya Device ID: {machine.tuyaDeviceId || "Nao vinculado"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(machine)}>Editar</Button>
          <Button size="sm" variant="outline" onClick={() => onToggleActive(machine)}>
            {machine.active ? "Inativar" : "Ativar"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(machine)}
          >
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
