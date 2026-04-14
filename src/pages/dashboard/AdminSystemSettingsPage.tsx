import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Button, Card, CardContent, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from "@/components/ui/primitives";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground mt-1">{children}</p>;
}

export default function AdminSystemSettingsPage() {
  const settingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: api.settings.get,
  });

  const [checkinBefore, setCheckinBefore] = useState("15");
  const [checkinAfter, setCheckinAfter] = useState("30");
  const [reservationDurationHours, setReservationDurationHours] = useState("2");
  const [reservationStartMode, setReservationStartMode] = useState<"ANY_TIME" | "FULL_HOUR">("FULL_HOUR");
  const [overtimeThreshold, setOvertimeThreshold] = useState("15");
  const [pollSeconds, setPollSeconds] = useState("30");
  const [billingMode, setBillingMode] = useState<"PER_USE" | "PER_KWH">("PER_USE");
  const [pricePerUse, setPricePerUse] = useState("0");
  const [pricePerKwh, setPricePerKwh] = useState("0");
  const [chargeNoShow, setChargeNoShow] = useState(true);

  useEffect(() => {
    if (!settingsQuery.data) return;
    setCheckinBefore(String(settingsQuery.data.checkinWindowBeforeMinutes));
    setCheckinAfter(String(settingsQuery.data.checkinWindowAfterMinutes));
    setReservationDurationHours(String(settingsQuery.data.reservationDurationHours));
    setReservationStartMode(settingsQuery.data.reservationStartMode);
    setOvertimeThreshold(String(settingsQuery.data.overtimeThresholdWatts));
    setPollSeconds(String(settingsQuery.data.consumptionPollSeconds));
    setBillingMode(settingsQuery.data.billingMode);
    setPricePerUse(String(settingsQuery.data.pricePerUse));
    setPricePerKwh(String(settingsQuery.data.pricePerKwh));
    setChargeNoShow(settingsQuery.data.chargeNoShow);
  }, [settingsQuery.data]);

  const updateSettings = useMutation({
    mutationFn: () => api.settings.update({
      checkinWindowBeforeMinutes: Number(checkinBefore),
      checkinWindowAfterMinutes: Number(checkinAfter),
      reservationDurationHours: Number(reservationDurationHours),
      reservationStartMode,
      overtimeThresholdWatts: Number(overtimeThreshold),
      consumptionPollSeconds: Number(pollSeconds),
      billingMode,
      pricePerUse: Number(pricePerUse),
      pricePerKwh: Number(pricePerKwh),
      chargeNoShow,
    }),
    onSuccess: () => notify.success("Configuracoes atualizadas."),
    onError: (error) => notify.error("Falha ao atualizar configuracoes.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Configuracoes do Sistema"
        description="Ajuste os parametros operacionais do sistema. As alteracoes entram em vigor imediatamente apos salvar."
      />

      {/* Reservas */}
      <Card>
        <SectionCardHeader
          title="Reservas"
          description="Definem como as reservas sao criadas e quanto tempo duram."
        />
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reservationDuration">Duracao da reserva</Label>
            <div className="flex items-center gap-2">
              <Input
                id="reservationDuration"
                value={reservationDurationHours}
                onChange={(e) => setReservationDurationHours(e.target.value)}
                inputMode="numeric"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">horas</span>
            </div>
            <FieldHint>Bloco de tempo fixo alocado por reserva. Nao pode haver sobreposicao de reservas no mesmo par de maquinas.</FieldHint>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reservationStartMode">Inicio permitido</Label>
            <Select value={reservationStartMode} onValueChange={(v) => setReservationStartMode(v as "ANY_TIME" | "FULL_HOUR")}>
              <SelectTrigger id="reservationStartMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_HOUR">Apenas hora cheia (08:00, 09:00...)</SelectItem>
                <SelectItem value="ANY_TIME">Qualquer horario</SelectItem>
              </SelectContent>
            </Select>
            <FieldHint>Restringe os horarios de inicio possiveis ao criar uma reserva.</FieldHint>
          </div>
        </CardContent>
      </Card>

      {/* Check-in */}
      <Card>
        <SectionCardHeader
          title="Janela de Check-in"
          description="Intervalo de tempo dentro do qual o morador pode realizar o check-in para sua reserva."
        />
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="checkinBefore">Antecedencia maxima</Label>
            <div className="flex items-center gap-2">
              <Input
                id="checkinBefore"
                value={checkinBefore}
                onChange={(e) => setCheckinBefore(e.target.value)}
                inputMode="numeric"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutos antes</span>
            </div>
            <FieldHint>Quantos minutos antes do inicio o check-in ja pode ser feito. Ex: 15 = check-in liberado 15 min antes do horario reservado.</FieldHint>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="checkinAfter">Tolerancia de atraso</Label>
            <div className="flex items-center gap-2">
              <Input
                id="checkinAfter"
                value={checkinAfter}
                onChange={(e) => setCheckinAfter(e.target.value)}
                inputMode="numeric"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutos depois</span>
            </div>
            <FieldHint>Quantos minutos apos o inicio o check-in ainda e aceito. Apos esse prazo, a reserva e encerrada automaticamente como ausencia.</FieldHint>
          </div>
        </CardContent>
      </Card>

      {/* Energia e monitoramento */}
      <Card>
        <SectionCardHeader
          title="Energia e Monitoramento"
          description="Controle do consumo das tomadas inteligentes e deteccao de overtime."
        />
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="overtimeThreshold">Limite de overtime</Label>
            <div className="flex items-center gap-2">
              <Input
                id="overtimeThreshold"
                value={overtimeThreshold}
                onChange={(e) => setOvertimeThreshold(e.target.value)}
                inputMode="decimal"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">watts</span>
            </div>
            <FieldHint>Consumo minimo (W) para considerar uma maquina ainda em uso apos o horario da reserva. Abaixo desse valor, o sistema encerra a sessao automaticamente.</FieldHint>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pollSeconds">Intervalo de leitura</Label>
            <div className="flex items-center gap-2">
              <Input
                id="pollSeconds"
                value={pollSeconds}
                onChange={(e) => setPollSeconds(e.target.value)}
                inputMode="numeric"
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">segundos</span>
            </div>
            <FieldHint>Frequencia com que o sistema consulta o consumo das tomadas inteligentes durante uma sessao ativa. Valores menores aumentam a precisao, mas geram mais trafego.</FieldHint>
          </div>
        </CardContent>
      </Card>

      {/* Cobranca */}
      <Card>
        <SectionCardHeader
          title="Cobranca"
          description="Define como as faturas mensais sao calculadas e quais usos sao cobrados."
        />
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="billingMode">Modo de cobranca</Label>
            <Select value={billingMode} onValueChange={(v) => setBillingMode(v as "PER_USE" | "PER_KWH")}>
              <SelectTrigger id="billingMode" className="w-full md:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PER_USE">Por uso — valor fixo por reserva utilizada</SelectItem>
                <SelectItem value="PER_KWH">Por kWh — baseado no consumo real de energia</SelectItem>
              </SelectContent>
            </Select>
            <FieldHint>Determina a formula usada para calcular o valor de cada item na fatura mensal.</FieldHint>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pricePerUse">Preco por uso</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                id="pricePerUse"
                value={pricePerUse}
                onChange={(e) => setPricePerUse(e.target.value)}
                inputMode="decimal"
                className="w-32"
                disabled={billingMode !== "PER_USE"}
              />
            </div>
            <FieldHint>Valor cobrado por reserva concluida. Ativo somente no modo <strong>Por uso</strong>.</FieldHint>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pricePerKwh">Preco por kWh</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">R$</span>
              <Input
                id="pricePerKwh"
                value={pricePerKwh}
                onChange={(e) => setPricePerKwh(e.target.value)}
                inputMode="decimal"
                className="w-32"
                disabled={billingMode !== "PER_KWH"}
              />
            </div>
            <FieldHint>Valor por quilowatt-hora consumido. Ativo somente no modo <strong>Por kWh</strong>.</FieldHint>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4 md:col-span-2">
            <div className="space-y-1">
              <Label htmlFor="chargeNoShow" className="text-base">Cobrar ausencia (no-show)</Label>
              <p className="text-sm text-muted-foreground">
                Quando ativo, reservas encerradas por ausencia de check-in sao incluidas na fatura mensal com o valor normal.
                Desative para isentar moradores que esqueceram de cancelar.
              </p>
            </div>
            <Switch id="chargeNoShow" checked={chargeNoShow} onCheckedChange={setChargeNoShow} className="ml-6 shrink-0" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Salvando..." : "Salvar configuracoes"}
        </Button>
      </div>
    </PageContainer>
  );
}
