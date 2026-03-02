import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives";
import type { ReservationPayload } from "@/services/api";

type ReservationCancelDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationPayload | null;
  cancelPending: boolean;
  formatDateTime: (value: string) => string;
  onConfirmCancel: () => void;
};

export default function ReservationCancelDialog({
  open,
  onOpenChange,
  reservation,
  cancelPending,
  formatDateTime,
  onConfirmCancel,
}: ReservationCancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Reserva</DialogTitle>
          <DialogDescription>
            Deseja realmente cancelar esta reserva?
          </DialogDescription>
        </DialogHeader>

        {reservation ? (
          <div className="space-y-1 typo-caption">
            <p><strong>Par:</strong> {reservation.machinePairName}</p>
            <p><strong>Morador:</strong> {reservation.userName}</p>
            <p><strong>Apartamento:</strong> {reservation.unitName}</p>
            <p><strong>Horario:</strong> {formatDateTime(reservation.startAt)} - {format(new Date(reservation.endAt), "HH:mm", { locale: ptBR })}</p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirmCancel}
            disabled={cancelPending}
          >
            {cancelPending ? "Cancelando..." : "Confirmar cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
