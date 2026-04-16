import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Button, Card, CardContent } from "@/components/ui/primitives";
import type { MachinePayload } from "@/services/api";

type MachineCardProps = {
  machine: MachinePayload;
  onEdit: (machine: MachinePayload) => void;
  onToggleActive: (machine: MachinePayload) => void;
  onRemove: (machine: MachinePayload) => void;
  onMaintenance: (machine: MachinePayload) => void;
};

export default function MachineCard({ machine, onEdit, onToggleActive, onRemove, onMaintenance }: MachineCardProps) {
  const qrPayload = `machine:${machine.id}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(qrPayload)}`;

  return (
    <Card>
      <SectionCardHeader
        title={`#${machine.number} - ${machine.brand} ${machine.model}`}
        description={`${machine.type === "WASHER" ? "Lavadora" : "Secadora"} | ${machine.active ? "Ativa" : "Inativa"}`}
      />
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border bg-muted/20 p-3 flex items-center gap-3">
          <img
            src={qrCodeSrc}
            alt={`QR Code da maquina ${machine.number}`}
            className="h-24 w-24 rounded border border-border bg-background p-1"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <p className="typo-caption font-medium text-foreground">QR Code da maquina</p>
            <p className="typo-caption text-muted-foreground break-all">{qrPayload}</p>
          </div>
        </div>
        <p className="typo-caption text-muted-foreground">
          Tuya Device ID: {machine.tuyaDeviceId || "Nao vinculado"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(machine)}>Editar</Button>
          <Button size="sm" variant="outline" onClick={() => onToggleActive(machine)}>
            {machine.active ? "Inativar" : "Ativar"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onMaintenance(machine)}>
            Manutenção
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onRemove(machine)}
          >
            Remover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
