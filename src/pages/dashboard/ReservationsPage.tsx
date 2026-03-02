import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { DateTimePicker } from "@/components/ui/composites";
import { Badge, Button, Calendar, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { api, type MachinePairPayload, type ReservationPayload, type ReservationStatus } from "@/services/api";
import { notify } from "@/lib/notify";

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  CANCELED: "Cancelada",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizada",
};

const statusVariant = (status: ReservationStatus): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "CONFIRMED") return "default";
  if (status === "CANCELED") return "destructive";
  if (status === "IN_PROGRESS") return "secondary";
  return "outline";
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

const reservationSortDesc = (a: ReservationPayload, b: ReservationPayload) =>
  new Date(b.startAt).getTime() - new Date(a.startAt).getTime();

type ViewMode = "month" | "week";

const reservationDate = (reservation: ReservationPayload) => new Date(reservation.startAt);

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const [machinePairId, setMachinePairId] = useState<string>("");
  const [startAt, setStartAt] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const machinePairsQuery = useQuery({
    queryKey: ["machine-pairs"],
    queryFn: api.machinePairs.list,
  });

  const reservationsQuery = useQuery({
    queryKey: ["reservations"],
    queryFn: api.reservations.list,
  });

  const createReservation = useMutation({
    mutationFn: (input: { machinePairId: string; startAt: string }) => api.reservations.create(input),
    onSuccess: async () => {
      notify.success("Reserva criada com sucesso.");
      setStartAt("");
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      notify.error("Falha ao criar reserva.", {
        description: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    },
  });

  const cancelReservation = useMutation({
    mutationFn: (id: string) => api.reservations.cancel(id),
    onSuccess: async () => {
      notify.success("Reserva cancelada com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      notify.error("Falha ao cancelar reserva.", {
        description: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    },
  });

  const machinePairs = machinePairsQuery.data || [];
  const reservations = useMemo(
    () => [...(reservationsQuery.data || [])].sort(reservationSortDesc),
    [reservationsQuery.data],
  );
  const selectedDayReservations = useMemo(
    () => reservations.filter((reservation) => isSameDay(reservationDate(reservation), selectedDate)),
    [reservations, selectedDate],
  );
  const reservedDays = useMemo(
    () => reservations.map((reservation) => reservationDate(reservation)),
    [reservations],
  );
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [selectedDate]);

  const handleCreate = async () => {
    if (!machinePairId) {
      notify.warning("Selecione um par de maquinas.");
      return;
    }
    if (!startAt) {
      notify.warning("Selecione data e hora de inicio.");
      return;
    }

    await createReservation.mutateAsync({ machinePairId, startAt });
  };

  const canCancel = (status: ReservationStatus) => status !== "CANCELED" && status !== "FINISHED";

  return (
    <PageContainer>
      <PageHeader
        title="Reservas"
        description="Agenda de reservas com duracao fixa de 2 horas por par de maquinas."
      />

      <Card>
        <CardHeader>
          <CardTitle>Nova Reserva</CardTitle>
          <CardDescription>Selecione o par de maquinas e a data/hora de inicio da reserva.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[2fr_2fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="machinePairId">Par de maquinas</Label>
            <Select value={machinePairId} onValueChange={setMachinePairId}>
              <SelectTrigger id="machinePairId">
                <SelectValue placeholder="Selecione um par" />
              </SelectTrigger>
              <SelectContent>
                {machinePairs.map((pair: MachinePairPayload) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.unitCode} - {pair.name} ({pair.washerMachineName} + {pair.dryerMachineName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Inicio da reserva</Label>
            <DateTimePicker value={startAt} onChange={setStartAt} />
          </div>

          <Button onClick={() => void handleCreate()} disabled={createReservation.isPending}>
            {createReservation.isPending ? "Criando..." : "Criar Reserva"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de Reservas</CardTitle>
          <CardDescription>Visualize a agenda em modo mensal ou semanal e acompanhe os status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              Visao Mensal
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Visao Semanal
            </Button>
          </div>

          {reservationsQuery.isLoading ? <p className="typo-caption text-muted-foreground">Carregando reservas...</p> : null}
          {reservationsQuery.isError ? (
            <p className="typo-body text-destructive">
              {reservationsQuery.error instanceof Error ? reservationsQuery.error.message : "Falha ao carregar reservas."}
            </p>
          ) : null}
          {!reservationsQuery.isLoading && !reservationsQuery.isError && reservations.length === 0 ? (
            <p className="typo-caption text-muted-foreground">Nenhuma reserva encontrada.</p>
          ) : null}

          {!reservationsQuery.isLoading && !reservationsQuery.isError && reservations.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
              <Card className="bg-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {viewMode === "month" ? "Calendario Mensal" : "Calendario da Semana"}
                  </CardTitle>
                  <CardDescription>
                    Data selecionada: {format(selectedDate, "dd/MM/yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    locale={ptBR}
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    modifiers={{ reserved: reservedDays }}
                    modifiersClassNames={{ reserved: "bg-primary/15 text-primary font-semibold" }}
                  />
                </CardContent>
              </Card>

              <div className="space-y-3">
                {viewMode === "week" ? (
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {weekDays.map((day) => {
                      const dayReservations = reservations.filter((reservation) => isSameDay(reservationDate(reservation), day));
                      return (
                        <div key={day.toISOString()} className="rounded-md border bg-card p-3">
                          <p className="typo-label text-primary">{format(day, "EEE, dd/MM", { locale: ptBR })}</p>
                          <div className="mt-2 space-y-2">
                            {dayReservations.length === 0 ? (
                              <p className="typo-caption text-muted-foreground">Sem reservas</p>
                            ) : dayReservations.map((reservation) => (
                              <div key={reservation.id} className="rounded border px-2 py-2">
                                <p className="typo-caption font-medium">{reservation.machinePairName}</p>
                                <p className="typo-caption text-muted-foreground">
                                  {formatDateTime(reservation.startAt)}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2">
                                  <Badge variant={statusVariant(reservation.status)}>
                                    {STATUS_LABELS[reservation.status]}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!canCancel(reservation.status) || cancelReservation.isPending}
                                    onClick={() => cancelReservation.mutate(reservation.id)}
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="typo-label text-primary">Reservas do dia selecionado</p>
                  {selectedDayReservations.length === 0 ? (
                    <p className="typo-caption text-muted-foreground">Nenhuma reserva para esta data.</p>
                  ) : selectedDayReservations.map((reservation) => (
                    <div key={reservation.id} className="rounded-md border bg-card p-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <p className="typo-label text-primary">
                            {reservation.unitCode} - {reservation.machinePairName}
                          </p>
                          <p className="typo-caption text-muted-foreground">
                            Inicio: {formatDateTime(reservation.startAt)} | Fim: {formatDateTime(reservation.endAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant(reservation.status)}>
                            {STATUS_LABELS[reservation.status]}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canCancel(reservation.status) || cancelReservation.isPending}
                            onClick={() => cancelReservation.mutate(reservation.id)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
