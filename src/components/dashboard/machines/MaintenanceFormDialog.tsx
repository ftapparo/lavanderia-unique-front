import { useState, useEffect } from "react";
import { Wrench } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@/components/ui/primitives";
import { DatePicker } from "@/components/ui/composites";
import type { MachinePayload } from "@/services/api";

type MaintenanceOption = {
  label: string;
  description: string;
};

export const MAINTENANCE_OPTIONS: (MaintenanceOption & { value: string })[] = [
  {
    value: "DRUM_CLEANING",
    label: "Limpeza do tambor",
    description: "Limpeza interna do tambor para remover resíduos de sabão, cal e sujeira acumulada.",
  },
  {
    value: "FILTER_CLEANING",
    label: "Limpeza do filtro",
    description: "Limpeza ou substituição do filtro de fiapos, pelúcia e detritos.",
  },
  {
    value: "DRAIN_PUMP_CLEANING",
    label: "Limpeza da bomba de drenagem",
    description: "Desobstrução e limpeza da bomba responsável pelo escoamento da água.",
  },
  {
    value: "VENT_DUCT_CLEANING",
    label: "Limpeza do duto de ventilação",
    description: "Limpeza do duto de saída de ar quente da secadora para evitar risco de incêndio.",
  },
  {
    value: "WATER_INLET_VALVE",
    label: "Verificação da válvula de entrada d'água",
    description: "Inspeção e limpeza da válvula de admissão de água para garantir fluxo adequado.",
  },
  {
    value: "SEAL_REPLACEMENT",
    label: "Troca da borracha de vedação",
    description: "Substituição da borracha da porta para evitar vazamentos.",
  },
  {
    value: "BELT_REPLACEMENT",
    label: "Troca da correia",
    description: "Substituição da correia de acionamento do tambor quando desgastada.",
  },
  {
    value: "BEARING_REPLACEMENT",
    label: "Troca dos rolamentos",
    description: "Substituição dos rolamentos do eixo do tambor para eliminar ruídos e vibrações.",
  },
  {
    value: "DOOR_LATCH_REPAIR",
    label: "Reparo do fecho da porta",
    description: "Ajuste ou substituição do mecanismo de travamento da porta.",
  },
  {
    value: "HEATING_ELEMENT_CHECK",
    label: "Verificação da resistência de aquecimento",
    description: "Teste e inspeção do elemento de aquecimento da secadora.",
  },
  {
    value: "ELECTRICAL_INSPECTION",
    label: "Inspeção elétrica geral",
    description: "Verificação de cabos, conexões e componentes elétricos da máquina.",
  },
  {
    value: "CONTROL_BOARD_CHECK",
    label: "Verificação da placa de controle",
    description: "Diagnóstico e inspeção da placa eletrônica de controle da máquina.",
  },
  {
    value: "OTHER",
    label: "Outra",
    description: "",
  },
];

export const MAINTENANCE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  MAINTENANCE_OPTIONS.map((o) => [o.value, o.label]),
);

export type MaintenanceFormValues = {
  selectedType: string;
  problem: string;
  startedAt: Date | undefined;
};

const emptyForm = (): MaintenanceFormValues => ({
  selectedType: "",
  problem: "",
  startedAt: undefined,
});

type MaintenanceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machine: MachinePayload;
  isSubmitting: boolean;
  onSubmit: (values: MaintenanceFormValues) => void;
};

export default function MaintenanceFormDialog({
  open,
  onOpenChange,
  machine,
  isSubmitting,
  onSubmit,
}: MaintenanceFormDialogProps) {
  const [values, setValues] = useState<MaintenanceFormValues>(emptyForm());

  useEffect(() => {
    if (open) setValues(emptyForm());
  }, [open]);

  const isOther = values.selectedType === "OTHER";
  const selectedOption = MAINTENANCE_OPTIONS.find((o) => o.value === values.selectedType);
  const autoDescription = selectedOption && !isOther ? selectedOption.description : "";

  const handleTypeChange = (type: string) => {
    const opt = MAINTENANCE_OPTIONS.find((o) => o.value === type);
    setValues((prev) => ({
      ...prev,
      selectedType: type,
      problem: opt && opt.value !== "OTHER" ? opt.description : "",
    }));
  };

  const canSubmit =
    values.selectedType !== "" &&
    values.startedAt !== undefined &&
    (isOther ? values.problem.trim() !== "" : true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Registrar Manutenção
          </DialogTitle>
          <DialogDescription>
            Máquina #{machine.number} — {machine.brand} {machine.model}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de manutenção</Label>
            <Select value={values.selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo..." />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {values.selectedType !== "" && (
            <div className="space-y-2">
              <Label>Descrição / Problema</Label>
              {isOther ? (
                <Textarea
                  value={values.problem}
                  onChange={(e) => setValues((prev) => ({ ...prev, problem: e.target.value }))}
                  placeholder="Descreva o problema ou a manutenção a ser realizada..."
                  rows={3}
                />
              ) : (
                <p className="typo-caption text-muted-foreground rounded-md border border-border bg-muted/20 px-3 py-2">
                  {autoDescription}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>
              {values.startedAt && values.startedAt > new Date()
                ? "Data programada (manutenção futura)"
                : "Data de início"}
            </Label>
            <DatePicker
              value={values.startedAt}
              onChange={(date) => setValues((prev) => ({ ...prev, startedAt: date ?? undefined }))}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={() => onSubmit(values)} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
