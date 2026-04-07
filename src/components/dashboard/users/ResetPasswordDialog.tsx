import { useState } from "react";
import { KeyRound, RefreshCw } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@/components/ui/primitives";

type ResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  isResetting: boolean;
  onConfirm: (password?: string, mustChangePassword?: boolean) => void;
};

const generatePin = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  userName,
  isResetting,
  onConfirm,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(true);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setPassword("");
      setMustChangePassword(true);
    }
    onOpenChange(value);
  };

  const handleConfirm = () => {
    onConfirm(password.trim() || undefined, mustChangePassword);
  };

  const handleGeneratePin = () => {
    setPassword(generatePin());
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <KeyRound className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <DialogTitle className="text-base">Redefinir Senha</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {userName}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label>Nova senha</Label>
            <div className="flex gap-2">
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deixe vazio para gerar PIN automatico"
                type="text"
                className="font-mono"
                disabled={isResetting}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePin}
                disabled={isResetting}
                className="shrink-0 gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Gerar PIN
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Se vazio, o sistema gera um PIN de 6 digitos automaticamente.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mustChangePassword}
                onChange={(e) => setMustChangePassword(e.target.checked)}
                disabled={isResetting}
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <div>
                <span className="text-sm font-medium">Exigir troca de senha no primeiro acesso</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  O usuario sera redirecionado para trocar a senha ao fazer login.
                </p>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isResetting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isResetting}
            className="gap-2"
          >
            <KeyRound className="h-4 w-4" />
            {isResetting ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
