import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/primitives";
import type { MachinePairPayload, ReservationPayload, ReservationStatus } from "@/services/api";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
  IN_PROGRESS: "Em uso",
  FINISHED: "Finalizada",
};

const statusVariant = (status: ReservationStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "CONFIRMED") return "default";
  if (status === "CANCELED") return "destructive";
  if (status === "IN_PROGRESS") return "secondary";
  return "outline";
};

type ReservationDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: ReservationPayload | null;
  selectedPair: MachinePairPayload | null;
  canCheckIn: (reservation: ReservationPayload | null) => boolean;
  canCancel: (status: ReservationStatus) => boolean;
  canCheckout: (reservation: ReservationPayload | null) => boolean;
  checkinPending: boolean;
  checkoutPending: boolean;
  formatDateTime: (value: string) => string;
  onCheckIn: (reservationId: string) => void;
  onCheckout: (reservationId: string) => void;
  onOpenCancelDialog: (reservation: ReservationPayload) => void;
};

export default function ReservationDetailsDialog({
  open,
  onOpenChange,
  reservation,
  selectedPair,
  canCheckIn,
  canCancel,
  canCheckout,
  checkinPending,
  checkoutPending,
  formatDateTime,
  onCheckIn,
  onCheckout,
  onOpenCancelDialog,
}: ReservationDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva</DialogTitle>
          <DialogDescription>
            Informacoes completas da reserva selecionada.
          </DialogDescription>
        </DialogHeader>

        {reservation ? (
          <div className="space-y-2 typo-caption">
            <p><strong>Par de maquinas:</strong> {reservation.machinePairName}</p>
            <p><strong>Lavadora:</strong> {selectedPair?.washerMachineName || "-"}</p>
            <p><strong>Secadora:</strong> {selectedPair?.dryerMachineName || "-"}</p>
            <p><strong>Morador:</strong> {reservation.userName}</p>
            <p><strong>Apartamento:</strong> {reservation.unitName}</p>
            <p><strong>Horario:</strong> {formatDateTime(reservation.startAt)} - {format(new Date(reservation.endAt), "HH:mm", { locale: ptBR })}</p>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <Badge variant={statusVariant(reservation.status)}>
                {STATUS_LABELS[reservation.status]}
              </Badge>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {reservation && canCheckIn(reservation) ? (
            <Button
              onClick={() => onCheckIn(reservation.id)}
              disabled={checkinPending}
            >
              {checkinPending ? "Realizando check-in..." : "Fazer check-in"}
            </Button>
          ) : null}
          {reservation && canCheckout(reservation) ? (
            <Button
              variant="secondary"
              onClick={() => onCheckout(reservation.id)}
              disabled={checkoutPending}
            >
              {checkoutPending ? "Realizando checkout..." : "Fazer checkout"}
            </Button>
          ) : null}
          {reservation && canCancel(reservation.status) ? (
            <Button
              variant="outline"
              className="hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onOpenCancelDialog(reservation)}
            >
              Cancelar reserva
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
