import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives";
import type { LaundrySessionDetailsPayload } from "@/services/api";
import ReservationSessionDetailsContent from "./ReservationSessionDetailsContent";

type ReservationActiveSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  errorMessage: string | null;
  session: LaundrySessionDetailsPayload | null;
  finishPending: boolean;
  formatDateTime: (value: string) => string;
  onFinish: (sessionId: string) => void;
};

export default function ReservationActiveSessionDialog({
  open,
  onOpenChange,
  isLoading,
  errorMessage,
  session,
  finishPending,
  formatDateTime,
  onFinish,
}: ReservationActiveSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sessao Ativa</DialogTitle>
          <DialogDescription>
            Monitoramento da sessao em andamento com status de energia dos dispositivos.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="typo-caption text-muted-foreground">Carregando sessao...</p>
        ) : null}

        {errorMessage ? (
          <p className="typo-caption text-destructive">{errorMessage}</p>
        ) : null}

        {session ? (
          <ReservationSessionDetailsContent session={session} formatDateTime={formatDateTime} />
        ) : null}

        <DialogFooter>
          {session ? (
            <Button
              variant="destructive"
              onClick={() => onFinish(session.id)}
              disabled={finishPending}
            >
              {finishPending ? "Finalizando..." : "Finalizar sessao"}
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
