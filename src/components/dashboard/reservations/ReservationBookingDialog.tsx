import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import type { MachinePairPayload, UnitPayload, UserListItemPayload } from "@/services/api";

type ReservationBookingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingStartAt: string;
  bookingUnitId: string;
  bookingUserId: string;
  bookingMachinePairId: string;
  isAdmin: boolean;
  autoUnit: UnitPayload | null;
  units: UnitPayload[];
  eligibleUsers: UserListItemPayload[];
  machinePairs: MachinePairPayload[];
  creating: boolean;
  formatDateTime: (value: string) => string;
  onUnitChange: (value: string) => void;
  onUserChange: (value: string) => void;
  onPairChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ReservationBookingDialog({
  open,
  onOpenChange,
  bookingStartAt,
  bookingUnitId,
  bookingUserId,
  bookingMachinePairId,
  isAdmin,
  autoUnit,
  units,
  eligibleUsers,
  machinePairs,
  creating,
  formatDateTime,
  onUnitChange,
  onUserChange,
  onPairChange,
  onSubmit,
}: ReservationBookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>
            Selecione o par de maquinas e confirme o horario de 2 horas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Horario</Label>
            <div className="rounded-md border bg-muted/20 px-3 py-2 typo-caption">
              {bookingStartAt ? formatDateTime(bookingStartAt) : "-"}
            </div>
          </div>

          {isAdmin ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Unidade</Label>
                <Select value={bookingUnitId} onValueChange={onUnitChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Morador responsavel</Label>
                <Select value={bookingUserId} onValueChange={onUserChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={bookingUnitId ? "Selecione o morador" : "Selecione a unidade primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <Label>Unidade</Label>
              <div className="rounded-md border bg-muted/20 px-3 py-2 typo-caption">
                {autoUnit ? autoUnit.code : "Sem unidade vinculada"}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label>Par de maquinas</Label>
            <Select value={bookingMachinePairId} onValueChange={onPairChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um par" />
              </SelectTrigger>
              <SelectContent>
                {machinePairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.name} ({pair.washerMachineName} + {pair.dryerMachineName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={creating}>
            {creating ? "Reservando..." : "Reservar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
