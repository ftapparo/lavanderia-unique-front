import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export type AlertVariantOption = "info" | "success" | "warning" | "error";

export type AlertVariantSwitcherProps = {
  value: AlertVariantOption;
  onChange: (value: AlertVariantOption) => void;
};

const alertMap = {
  info: {
    title: "Aviso informativo",
    description: "Use este bloco para mensagens de contexto sem interromper o fluxo.",
    icon: Info,
    label: "Info",
  },
  success: {
    title: "Operacao concluida",
    description: "A acao foi concluida com sucesso e os dados foram atualizados.",
    icon: CheckCircle2,
    label: "Sucesso",
  },
  warning: {
    title: "Atencao necessaria",
    description: "Existe um ponto pendente que precisa de revisao antes de continuar.",
    icon: AlertTriangle,
    label: "Alerta",
  },
  error: {
    title: "Falha na operacao",
    description: "Nao foi possivel concluir a acao. Verifique os dados e tente novamente.",
    icon: XCircle,
    label: "Erro",
  },
} as const;

export function AlertVariantSwitcher({ value, onChange }: AlertVariantSwitcherProps) {
  const Icon = alertMap[value].icon;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(alertMap) as AlertVariantOption[]).map((variant) => (
          <Button
            key={variant}
            size="sm"
            variant={value === variant ? "default" : "outline"}
            onClick={() => onChange(variant)}
          >
            {alertMap[variant].label}
          </Button>
        ))}
      </div>

      <Alert variant={value}>
        <Icon className="h-4 w-4" />
        <AlertTitle>{alertMap[value].title}</AlertTitle>
        <AlertDescription>{alertMap[value].description}</AlertDescription>
      </Alert>
    </div>
  );
}
