import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, addHours, addWeeks, endOfMonth, format, isSameDay, isSameMonth, startOfDay, startOfMonth, startOfWeek, subWeeks } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Badge, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useSidebar } from "@/components/ui/primitives";
import { api, type LaundrySessionDetailsPayload, type LaundrySessionPayload, type MachinePairPayload, type MembershipPayload, type ReservationPayload, type ReservationStatus, type UnitPayload } from "@/services/api";
import { notify } from "@/lib/notify";
import { useAuth } from "@/contexts/AuthContext";

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

const WORK_DAY_START_HOUR = 0;
const WORK_DAY_END_HOUR = 24;
const SLOT_STEP_HOURS = 2;
const HOUR_ROW_HEIGHT = 72;
const WEEK_DAYS_COUNT = 5;
const MOBILE_SWITCH_WIDTH_EXPANDED = 1497;
const MOBILE_SWITCH_WIDTH_COLLAPSED = 1288;
const HOURS_IN_VIEW = WORK_DAY_END_HOUR - WORK_DAY_START_HOUR;
const TOTAL_ROWS = HOURS_IN_VIEW / SLOT_STEP_HOURS;
const VIEW_HEIGHT = TOTAL_ROWS * HOUR_ROW_HEIGHT;
const HOURLY_MARKS = Array.from(
  { length: HOURS_IN_VIEW / SLOT_STEP_HOURS },
  (_, index) => WORK_DAY_START_HOUR + (index * SLOT_STEP_HOURS),
);

const reservationDate = (reservation: ReservationPayload) => new Date(reservation.startAt);
const toSlotStart = (baseDate: Date, hour: number): Date => addHours(startOfDay(baseDate), hour);
const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
const formatDateTime = (value: string): string => new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
const reservationSortDesc = (a: ReservationPayload, b: ReservationPayload): number => new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
const capitalize = (text: string): string => text ? `${text[0].toUpperCase()}${text.slice(1)}` : text;

export default function ReservationsPage() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { state: sidebarState } = useSidebar();
  const isAdmin = profile?.role === "ADMIN";
  const isSidebarExpanded = sidebarState === "expanded";

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"SEMANAL" | "MENSAL">("SEMANAL");
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1920);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStartAt, setBookingStartAt] = useState<string>("");
  const [bookingMachinePairId, setBookingMachinePairId] = useState<string>("");
  const [bookingUnitId, setBookingUnitId] = useState<string>("");
  const [reservationDetailsOpen, setReservationDetailsOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ReservationPayload | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelTargetReservation, setCancelTargetReservation] = useState<ReservationPayload | null>(null);
  const [activeSessionOpen, setActiveSessionOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>("");

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const unitsQuery = useQuery({ queryKey: ["units"], queryFn: api.units.list });
  const machinePairsQuery = useQuery({ queryKey: ["machine-pairs"], queryFn: api.machinePairs.list });
  const membershipsQuery = useQuery({ queryKey: ["unit-memberships"], queryFn: api.memberships.list });
  const reservationsQuery = useQuery({ queryKey: ["reservations"], queryFn: api.reservations.list });

  const createReservation = useMutation({
    mutationFn: (input: { unitId: string; machinePairId: string; startAt: string }) => api.reservations.create(input),
    onSuccess: async () => {
      notify.success("Reserva criada com sucesso.");
      setBookingOpen(false);
      setBookingMachinePairId("");
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

  const checkInReservation = useMutation({
    mutationFn: (id: string) => api.reservations.checkIn(id),
    onSuccess: async (session) => {
      notify.success("Check-in realizado e energia liberada.");
      setActiveSessionId(session.id);
      setActiveSessionOpen(true);
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error) => {
      notify.error("Falha ao realizar check-in.", {
        description: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    },
  });

  const activeSessionQuery = useQuery({
    queryKey: ["session", activeSessionId],
    queryFn: () => api.sessions.getById(activeSessionId),
    enabled: activeSessionOpen && Boolean(activeSessionId),
    refetchInterval: activeSessionOpen ? 15000 : false,
  });

  const finishSession = useMutation({
    mutationFn: (sessionId: string) => api.sessions.finish(sessionId),
    onSuccess: async () => {
      notify.success("Sessao finalizada com sucesso.");
      setActiveSessionOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
      await queryClient.invalidateQueries({ queryKey: ["session", activeSessionId] });
    },
    onError: (error) => {
      notify.error("Falha ao finalizar sessao.", {
        description: error instanceof Error ? error.message : "Erro desconhecido.",
      });
    },
  });

  const units = (unitsQuery.data || []).filter((unit) => unit.active);
  const machinePairs = machinePairsQuery.data || [];
  const memberships = membershipsQuery.data || [];
  const allReservations = useMemo(
    () => [...(reservationsQuery.data || [])].sort(reservationSortDesc),
    [reservationsQuery.data],
  );
  const dailyReservations = useMemo(
    () => allReservations.filter((reservation) => reservation.status !== "CANCELED"),
    [allReservations],
  );

  const membershipsByPriority = useMemo(() => {
    return [...memberships]
      .filter((membership: MembershipPayload) => membership.active)
      .sort((a: MembershipPayload, b: MembershipPayload) => (a.startDate < b.startDate ? 1 : -1));
  }, [memberships]);

  const autoUnit = useMemo(() => {
    const firstMembership = membershipsByPriority[0];
    if (!firstMembership) return null;
    return units.find((unit: UnitPayload) => unit.id === firstMembership.unitId) || null;
  }, [membershipsByPriority, units]);

  const mobileSwitchWidth = isSidebarExpanded ? MOBILE_SWITCH_WIDTH_EXPANDED : MOBILE_SWITCH_WIDTH_COLLAPSED;
  const isMobileCalendar = viewportWidth < mobileSwitchWidth;
  const effectiveViewMode: "SEMANAL" | "MENSAL" = isAdmin && !isMobileCalendar ? viewMode : "SEMANAL";

  const weekDays = useMemo(() => {
    if (isMobileCalendar) {
      return [selectedDate];
    }
    const weekStartValue = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: WEEK_DAYS_COUNT }, (_, index) => addDays(weekStartValue, index));
  }, [isMobileCalendar, selectedDate]);

  const weekStart = weekDays[0];

  const monthReservations = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    return allReservations.filter((reservation) => {
      const reservationStart = new Date(reservation.startAt);
      return reservationStart >= monthStart && reservationStart <= monthEnd;
    });
  }, [selectedDate, allReservations]);

  const toTop = (date: Date): number => {
    const minutes = (date.getHours() - WORK_DAY_START_HOUR) * 60 + date.getMinutes();
    return (minutes / (60 * SLOT_STEP_HOURS)) * HOUR_ROW_HEIGHT;
  };

  const canCancel = (status: ReservationStatus): boolean => status !== "CANCELED" && status !== "FINISHED";

  const openReservationDetails = (reservation: ReservationPayload) => {
    setSelectedReservation(reservation);
    setReservationDetailsOpen(true);
  };

  const openCancelDialog = (reservation: ReservationPayload) => {
    setCancelTargetReservation(reservation);
    setCancelDialogOpen(true);
  };

  const openBookingModal = (day: Date, slotHour: number) => {
    const normalizedHour = clamp(slotHour, WORK_DAY_START_HOUR, WORK_DAY_END_HOUR - SLOT_STEP_HOURS);
    const start = toSlotStart(day, normalizedHour);
    setSelectedDate(day);
    setBookingStartAt(start.toISOString());
    setBookingMachinePairId("");

    if (isAdmin) {
      setBookingUnitId("");
    } else {
      setBookingUnitId(autoUnit?.id || "");
    }

    setBookingOpen(true);
  };

  const handleCreate = async () => {
    if (!bookingStartAt) {
      notify.warning("Horario invalido para reserva.");
      return;
    }
    if (!bookingMachinePairId) {
      notify.warning("Selecione o par de maquinas.");
      return;
    }

    const targetUnitId = isAdmin ? bookingUnitId : (autoUnit?.id || "");
    if (!targetUnitId) {
      notify.warning("Unidade nao definida para a reserva.");
      return;
    }

    await createReservation.mutateAsync({
      unitId: targetUnitId,
      machinePairId: bookingMachinePairId,
      startAt: bookingStartAt,
    });
  };

  const handleCancelReservation = async () => {
    if (!cancelTargetReservation) return;
    await cancelReservation.mutateAsync(cancelTargetReservation.id);
    if (selectedReservation?.id === cancelTargetReservation.id) {
      setReservationDetailsOpen(false);
      setSelectedReservation(null);
    }
    setCancelDialogOpen(false);
    setCancelTargetReservation(null);
  };

  const selectedPair = useMemo(() => {
    if (!selectedReservation) return null;
    return machinePairs.find((pair) => pair.id === selectedReservation.machinePairId) || null;
  }, [selectedReservation, machinePairs]);

  const canCheckIn = (reservation: ReservationPayload | null): boolean => {
    if (!reservation) return false;
    return reservation.status === "CONFIRMED" || reservation.status === "PENDING";
  };

  const currentLabel = effectiveViewMode === "MENSAL"
    ? capitalize(format(selectedDate, "MMMM yyyy", { locale: ptBR }))
    : capitalize(format(weekStart, "MMMM yyyy", { locale: ptBR }));

  const goPrev = () => {
    if (effectiveViewMode === "MENSAL") {
      setSelectedDate(addDays(startOfMonth(selectedDate), -1));
      return;
    }
    setSelectedDate(isMobileCalendar ? addDays(selectedDate, -1) : subWeeks(selectedDate, 1));
  };

  const goNext = () => {
    if (effectiveViewMode === "MENSAL") {
      setSelectedDate(addDays(endOfMonth(selectedDate), 1));
      return;
    }
    setSelectedDate(isMobileCalendar ? addDays(selectedDate, 1) : addWeeks(selectedDate, 1));
  };

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Reservas"
        description="Agenda semanal para reservas de 2 horas por par de maquinas."
      />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => setSelectedDate(new Date())}>
              Hoje
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={goPrev}
            >
              {"<"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={goNext}
            >
              {">"}
            </Button>
            <p className="text-sm font-semibold text-primary">
              {currentLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && !isMobileCalendar ? (
              <>
                <Button
                  size="sm"
                  variant={effectiveViewMode === "SEMANAL" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("SEMANAL")}
                >
                  Semanal
                </Button>
                <Button
                  size="sm"
                  variant={effectiveViewMode === "MENSAL" ? "secondary" : "ghost"}
                  onClick={() => setViewMode("MENSAL")}
                >
                  Mensal
                </Button>
              </>
            ) : null}
            {!isAdmin ? (
              <Badge variant="secondary">
                Unidade: {autoUnit?.name || "Nao encontrada"}
              </Badge>
            ) : null}
          </div>
        </div>

        {reservationsQuery.isLoading ? <p className="typo-caption text-muted-foreground">Carregando agenda...</p> : null}
        {reservationsQuery.isError ? (
          <p className="typo-body text-destructive">
            {reservationsQuery.error instanceof Error ? reservationsQuery.error.message : "Falha ao carregar agenda."}
          </p>
        ) : null}

        {!reservationsQuery.isLoading && !reservationsQuery.isError && effectiveViewMode === "SEMANAL" ? (
          <div className="rounded-md border border-border/70 bg-card">
            <div className={isMobileCalendar ? "grid grid-cols-[60px_minmax(0,1fr)]" : "grid grid-cols-[72px_repeat(5,minmax(0,1fr))]"}>
              <div className="border-b bg-muted/15 p-2 text-[11px] font-medium text-muted-foreground">Hora</div>
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="border-b border-l bg-muted/15 p-2">
                  <p className={`text-[30px] leading-none font-normal ${isSameMonth(day, selectedDate) ? "text-primary" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </p>
                  <p className="text-xs text-muted-foreground">{capitalize(format(day, "EEEE", { locale: ptBR }))}</p>
                </div>
              ))}

              <div className="relative border-r bg-muted/10" style={{ height: `${VIEW_HEIGHT}px` }}>
                {HOURLY_MARKS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute inset-x-0 border-t border-dashed px-2 typo-caption text-muted-foreground"
                    style={{ top: `${((hour - WORK_DAY_START_HOUR) / SLOT_STEP_HOURS) * HOUR_ROW_HEIGHT}px` }}
                  >
                    {format(toSlotStart(selectedDate, hour), "HH:mm", { locale: ptBR })}
                  </div>
                ))}
              </div>

                {weekDays.map((day) => {
                  const dayReservations = dailyReservations.filter((reservation) => isSameDay(reservationDate(reservation), day));
                  return (
                    <div
                      key={day.toISOString()}
                      className="relative border-l bg-card"
                      style={{ height: `${VIEW_HEIGHT}px` }}
                      onClick={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        const offsetY = clamp(event.clientY - rect.top, 0, VIEW_HEIGHT);
                        const hourFloat = WORK_DAY_START_HOUR + ((offsetY / HOUR_ROW_HEIGHT) * SLOT_STEP_HOURS);
                        const snapped = Math.floor(hourFloat / SLOT_STEP_HOURS) * SLOT_STEP_HOURS;
                        openBookingModal(day, snapped);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          openBookingModal(day, WORK_DAY_START_HOUR);
                        }
                      }}
                    >
                      {HOURLY_MARKS.map((hour) => (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className="absolute inset-x-0 border-t border-dashed border-muted-foreground/20"
                          style={{ top: `${((hour - WORK_DAY_START_HOUR) / SLOT_STEP_HOURS) * HOUR_ROW_HEIGHT}px` }}
                        />
                      ))}

                      {dayReservations.map((reservation) => {
                        const start = new Date(reservation.startAt);
                        const end = new Date(reservation.endAt);
                        const top = clamp(toTop(start), 0, VIEW_HEIGHT);
                        const height = clamp(toTop(end) - toTop(start), 28, VIEW_HEIGHT - top);

                        return (
                          <div
                            key={reservation.id}
                            className="absolute left-1 right-1 overflow-hidden rounded border border-primary/40 bg-primary/10 px-2 py-1 text-left shadow-sm"
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={(event) => {
                              event.stopPropagation();
                              openReservationDetails(reservation);
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="typo-caption font-medium">{reservation.machinePairName}</p>
                              {canCancel(reservation.status) ? (
                                <button
                                  type="button"
                                  className="text-destructive"
                                  aria-label="Cancelar reserva"
                                  title="Cancelar reserva"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openCancelDialog(reservation);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              ) : null}
                            </div>
                            <p className="typo-caption text-muted-foreground">Morador: {reservation.userName}</p>
                            <p className="typo-caption text-muted-foreground">Apartamento: {reservation.unitName}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          </div>
        ) : null}

        {!reservationsQuery.isLoading && !reservationsQuery.isError && effectiveViewMode === "MENSAL" ? (
          <div className="rounded-md border border-border/70 bg-card p-3">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Horario</th>
                    <th className="py-2 pr-3">Par de maquinas</th>
                    <th className="py-2 pr-3">Morador</th>
                    <th className="py-2 pr-3">Apartamento</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {monthReservations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-muted-foreground">
                        Nenhuma reserva encontrada para este mes.
                      </td>
                    </tr>
                  ) : (
                    monthReservations.map((reservation) => (
                      <tr key={reservation.id} className="border-b">
                        <td className="py-2 pr-3">{format(new Date(reservation.startAt), "dd/MM/yyyy")}</td>
                        <td className="py-2 pr-3">
                          {format(new Date(reservation.startAt), "HH:mm")} - {format(new Date(reservation.endAt), "HH:mm")}
                        </td>
                        <td className="py-2 pr-3">{reservation.machinePairName}</td>
                        <td className="py-2 pr-3">{reservation.userName}</td>
                        <td className="py-2 pr-3">{reservation.unitName}</td>
                        <td className="py-2 pr-3">
                          <Badge variant={statusVariant(reservation.status)}>
                            {STATUS_LABELS[reservation.status]}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openReservationDetails(reservation)}>
                              Detalhes
                            </Button>
                            {canCancel(reservation.status) ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => openCancelDialog(reservation)}
                              >
                                Cancelar
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
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
              <div className="space-y-1">
                <Label>Unidade</Label>
                <Select value={bookingUnitId} onValueChange={setBookingUnitId}>
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
              <Select value={bookingMachinePairId} onValueChange={setBookingMachinePairId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um par" />
                </SelectTrigger>
                <SelectContent>
                  {machinePairs.map((pair: MachinePairPayload) => (
                    <SelectItem key={pair.id} value={pair.id}>
                      {pair.name} ({pair.washerMachineName} + {pair.dryerMachineName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void handleCreate()} disabled={createReservation.isPending}>
              {createReservation.isPending ? "Reservando..." : "Reservar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reservationDetailsOpen} onOpenChange={setReservationDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>
              Informacoes completas da reserva selecionada.
            </DialogDescription>
          </DialogHeader>

          {selectedReservation ? (
            <div className="space-y-2 typo-caption">
              <p><strong>Par de maquinas:</strong> {selectedReservation.machinePairName}</p>
              <p><strong>Lavadora:</strong> {selectedPair?.washerMachineName || "-"}</p>
              <p><strong>Secadora:</strong> {selectedPair?.dryerMachineName || "-"}</p>
              <p><strong>Morador:</strong> {selectedReservation.userName}</p>
              <p><strong>Apartamento:</strong> {selectedReservation.unitName}</p>
              <p><strong>Horario:</strong> {formatDateTime(selectedReservation.startAt)} - {format(new Date(selectedReservation.endAt), "HH:mm", { locale: ptBR })}</p>
              <div className="flex items-center gap-2">
                <strong>Status:</strong>
                <Badge variant={statusVariant(selectedReservation.status)}>
                  {STATUS_LABELS[selectedReservation.status]}
                </Badge>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            {selectedReservation && canCheckIn(selectedReservation) ? (
              <Button
                onClick={() => {
                  void checkInReservation.mutateAsync(selectedReservation.id);
                }}
                disabled={checkInReservation.isPending}
              >
                {checkInReservation.isPending ? "Realizando check-in..." : "Fazer check-in"}
              </Button>
            ) : null}
            {selectedReservation && canCancel(selectedReservation.status) ? (
              <Button
                variant="destructive"
                onClick={() => openCancelDialog(selectedReservation)}
              >
                Cancelar reserva
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setReservationDetailsOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              Deseja realmente cancelar esta reserva?
            </DialogDescription>
          </DialogHeader>

          {cancelTargetReservation ? (
            <div className="space-y-1 typo-caption">
              <p><strong>Par:</strong> {cancelTargetReservation.machinePairName}</p>
              <p><strong>Morador:</strong> {cancelTargetReservation.userName}</p>
              <p><strong>Apartamento:</strong> {cancelTargetReservation.unitName}</p>
              <p><strong>Horario:</strong> {formatDateTime(cancelTargetReservation.startAt)} - {format(new Date(cancelTargetReservation.endAt), "HH:mm", { locale: ptBR })}</p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleCancelReservation()}
              disabled={cancelReservation.isPending}
            >
              {cancelReservation.isPending ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activeSessionOpen} onOpenChange={setActiveSessionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sessao Ativa</DialogTitle>
            <DialogDescription>
              Monitoramento da sessao em andamento com status de energia dos dispositivos.
            </DialogDescription>
          </DialogHeader>

          {activeSessionQuery.isLoading ? (
            <p className="typo-caption text-muted-foreground">Carregando sessao...</p>
          ) : null}

          {activeSessionQuery.isError ? (
            <p className="typo-caption text-destructive">
              {activeSessionQuery.error instanceof Error ? activeSessionQuery.error.message : "Falha ao carregar sessao."}
            </p>
          ) : null}

          {activeSessionQuery.data ? (
            <SessionDetailsContent session={activeSessionQuery.data} />
          ) : null}

          <DialogFooter>
            {activeSessionQuery.data ? (
              <Button
                variant="destructive"
                onClick={() => void finishSession.mutateAsync(activeSessionQuery.data!.id)}
                disabled={finishSession.isPending}
              >
                {finishSession.isPending ? "Finalizando..." : "Finalizar sessao"}
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setActiveSessionOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function SessionDetailsContent({ session }: { session: LaundrySessionDetailsPayload }) {
  return (
    <div className="space-y-2 typo-caption">
      <p><strong>Par de maquinas:</strong> {session.machinePairName}</p>
      <p><strong>Morador:</strong> {session.userName}</p>
      <p><strong>Apartamento:</strong> {session.unitName}</p>
      <p><strong>Status da sessao:</strong> {session.status}</p>
      <p><strong>Check-in:</strong> {formatDateTime(session.checkinAt)}</p>

      <div className="space-y-2 rounded-md border p-2">
        {session.devices.map((device) => (
          <div key={device.deviceId} className="rounded border p-2">
            <p><strong>{device.machineType === "WASHER" ? "Lavadora" : "Secadora"}:</strong> {device.machineName}</p>
            <p><strong>Energia:</strong> {device.isOn ? "Ligada" : "Desligada"}</p>
            <p><strong>Potencia:</strong> {device.powerWatts} W</p>
            <p><strong>Consumo:</strong> {device.energyKwh} kWh</p>
          </div>
        ))}
      </div>
    </div>
  );
}
