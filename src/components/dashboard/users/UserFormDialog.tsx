import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";
import { USER_ROLE_LABELS } from "@/lib/user-role-labels";

export type UserRole = "USER" | "ADMIN" | "SUPER";

export type UserFormValues = {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  role: UserRole;
  cargo: string;
  password: string;
  mustChangePassword: boolean;
};

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  loadingLabel: string;
  isSubmitting: boolean;
  values: UserFormValues;
  onChange: (values: UserFormValues) => void;
  onSubmit: () => void;
  isEdit?: boolean;
};

const CARGO_SUGGESTIONS = [
  "Gerente",
  "Sindico",
  "Zelador",
  "Porteiro",
  "Auxiliar Administrativo",
];

const formatDocument = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const generatePin = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export default function UserFormDialog({
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
  isEdit = false,
}: UserFormDialogProps) {
  const [showCargoSuggestions, setShowCargoSuggestions] = useState(false);

  useEffect(() => {
    if (!open) setShowCargoSuggestions(false);
  }, [open]);

  const canUseCargo = values.role === "SUPER";

  const handleGeneratePin = () => {
    onChange({ ...values, password: generatePin() });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Nome completo *</Label>
            <Input
              value={values.name}
              onChange={(e) => onChange({ ...values, name: e.target.value })}
              placeholder="Nome do usuario"
            />
          </div>

          <div className="space-y-2">
            <Label>CPF ou CNPJ *</Label>
            <Input
              value={values.cpf}
              onChange={(e) => onChange({ ...values, cpf: formatDocument(e.target.value) })}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              inputMode="numeric"
              disabled={isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={values.phone}
              onChange={(e) => onChange({ ...values, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              inputMode="tel"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>E-mail *</Label>
            <Input
              value={values.email}
              onChange={(e) => onChange({ ...values, email: e.target.value })}
              placeholder="email@exemplo.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label>Papel no sistema *</Label>
            <Select
              value={values.role}
              onValueChange={(value) => {
                const nextRole = value as UserRole;
                onChange({
                  ...values,
                  role: nextRole,
                  cargo: nextRole === "SUPER" ? values.cargo : "",
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">{USER_ROLE_LABELS.USER}</SelectItem>
                <SelectItem value="ADMIN">{USER_ROLE_LABELS.ADMIN}</SelectItem>
                <SelectItem value="SUPER">{USER_ROLE_LABELS.SUPER}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {canUseCargo && (
            <div className="space-y-2 relative">
              <Label>Cargo</Label>
              <Input
                value={values.cargo}
                onChange={(e) => {
                  onChange({ ...values, cargo: e.target.value });
                  setShowCargoSuggestions(true);
                }}
                onFocus={() => setShowCargoSuggestions(true)}
                onBlur={() => setTimeout(() => setShowCargoSuggestions(false), 150)}
                placeholder="Ex: Zelador, Porteiro..."
              />
              {showCargoSuggestions && (
                <div className="absolute z-10 top-full left-0 right-0 bg-popover border rounded-md shadow-md mt-1 overflow-hidden">
                  {CARGO_SUGGESTIONS.filter(
                    (s) => !values.cargo || s.toLowerCase().includes(values.cargo.toLowerCase())
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onMouseDown={() => {
                        onChange({ ...values, cargo: suggestion });
                        setShowCargoSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isEdit && (
            <div className="space-y-2 md:col-span-2">
              <Label>Senha inicial</Label>
              <div className="flex gap-2">
                <Input
                  value={values.password}
                  onChange={(e) => onChange({ ...values, password: e.target.value })}
                  placeholder="Deixe vazio para gerar PIN automatico"
                  type="text"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeneratePin}
                  className="shrink-0"
                >
                  Gerar PIN
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Se vazio, o sistema gera um PIN de 6 digitos automaticamente.
              </p>
            </div>
          )}

          {!isEdit && (
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={values.mustChangePassword}
                  onChange={(e) => onChange({ ...values, mustChangePassword: e.target.checked })}
                  className="h-4 w-4 rounded border-input accent-primary"
                />
                <span className="text-sm">Exigir troca de senha no primeiro acesso</span>
              </label>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? loadingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
