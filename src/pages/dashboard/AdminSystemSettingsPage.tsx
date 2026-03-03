import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/primitives";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";

export default function AdminSystemSettingsPage() {
  const settingsQuery = useQuery({
    queryKey: ["system-settings"],
    queryFn: api.settings.get,
  });

  const [checkinBefore, setCheckinBefore] = useState("15");
  const [checkinAfter, setCheckinAfter] = useState("30");
  const [overtimeThreshold, setOvertimeThreshold] = useState("15");
  const [pollSeconds, setPollSeconds] = useState("30");
  const [billingMode, setBillingMode] = useState<"PER_USE" | "PER_KWH">("PER_USE");
  const [pricePerUse, setPricePerUse] = useState("0");
  const [pricePerKwh, setPricePerKwh] = useState("0");

  useEffect(() => {
    if (!settingsQuery.data) return;
    setCheckinBefore(String(settingsQuery.data.checkinWindowBeforeMinutes));
    setCheckinAfter(String(settingsQuery.data.checkinWindowAfterMinutes));
    setOvertimeThreshold(String(settingsQuery.data.overtimeThresholdWatts));
    setPollSeconds(String(settingsQuery.data.consumptionPollSeconds));
    setBillingMode(settingsQuery.data.billingMode);
    setPricePerUse(String(settingsQuery.data.pricePerUse));
    setPricePerKwh(String(settingsQuery.data.pricePerKwh));
  }, [settingsQuery.data]);

  const updateSettings = useMutation({
    mutationFn: () => api.settings.update({
      checkinWindowBeforeMinutes: Number(checkinBefore),
      checkinWindowAfterMinutes: Number(checkinAfter),
      overtimeThresholdWatts: Number(overtimeThreshold),
      consumptionPollSeconds: Number(pollSeconds),
      billingMode,
      pricePerUse: Number(pricePerUse),
      pricePerKwh: Number(pricePerKwh),
    }),
    onSuccess: () => notify.success("Configuracoes atualizadas."),
    onError: (error) => notify.error("Falha ao atualizar configuracoes.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  return (
    <PageContainer>
      <PageHeader
        title="Configuracoes Operacionais"
        description="Parametros de check-in, overtime, polling e cobranca."
      />

      <Card>
        <CardHeader>
          <CardTitle>Parametros do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Check-in antes (min)</Label>
            <Input value={checkinBefore} onChange={(e) => setCheckinBefore(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Check-in depois (min)</Label>
            <Input value={checkinAfter} onChange={(e) => setCheckinAfter(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Threshold overtime (W)</Label>
            <Input value={overtimeThreshold} onChange={(e) => setOvertimeThreshold(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label>Polling de consumo (s)</Label>
            <Input value={pollSeconds} onChange={(e) => setPollSeconds(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label>Modo de cobranca</Label>
            <Select value={billingMode} onValueChange={(value) => setBillingMode(value as "PER_USE" | "PER_KWH")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PER_USE">Por uso</SelectItem>
                <SelectItem value="PER_KWH">Por kWh</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preco por uso</Label>
            <Input value={pricePerUse} onChange={(e) => setPricePerUse(e.target.value)} inputMode="decimal" />
          </div>
          <div className="space-y-2">
            <Label>Preco por kWh</Label>
            <Input value={pricePerKwh} onChange={(e) => setPricePerKwh(e.target.value)} inputMode="decimal" />
          </div>
          <div className="flex items-end">
            <Button onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
