import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import type { MachineType } from "@/services/api";

type MachineFormValues = {
  number: string;
  brand: string;
  model: string;
  type: MachineType;
  tuyaDeviceId: string;
};

type MachineFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  loadingLabel: string;
  isSubmitting: boolean;
  values: MachineFormValues;
  onChange: (values: MachineFormValues) => void;
  onSubmit: () => void;
};

export default function MachineFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  loadingLabel,
  isSubmitting,
  values,
  onChange,
  onSubmit,
}: MachineFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Numero</Label>
            <Input
              value={values.number}
              onChange={(e) => onChange({ ...values, number: e.target.value })}
              inputMode="numeric"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={values.type}
              onValueChange={(value) => onChange({ ...values, type: value as MachineType })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WASHER">Lavadora</SelectItem>
                <SelectItem value="DRYER">Secadora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Marca</Label>
            <Input
              value={values.brand}
              onChange={(e) => onChange({ ...values, brand: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Input
              value={values.model}
              onChange={(e) => onChange({ ...values, model: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Device ID Tuya</Label>
            <Input
              value={values.tuyaDeviceId}
              onChange={(e) => onChange({ ...values, tuyaDeviceId: e.target.value })}
              placeholder="Opcional"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? loadingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
