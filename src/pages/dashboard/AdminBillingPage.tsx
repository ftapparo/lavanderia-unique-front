import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from "recharts";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import {
  Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle,
  Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/primitives";
import { api, type InvoiceDetailsPayload, type InvoicePayload } from "@/services/api";
import { notify } from "@/lib/notify";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function shortDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isoToDateStr(iso: string) {
  return iso.slice(0, 10);
}

function getHour(iso: string) {
  return new Date(iso).getHours();
}

function getLast30Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}


// ── chart tooltips ────────────────────────────────────────────────────────────

function CurrencyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-primary font-mono tabular-nums">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function UsageTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <p className="font-medium text-foreground">{`${label}h`}</p>
      <p className="text-muted-foreground">{payload[0].value} uso{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function DailyRevenueChart({ invoices }: { invoices: InvoicePayload[] }) {
  const days = getLast30Days();
  const data = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inv of invoices) {
      const d = isoToDateStr(inv.createdAt);
      map[d] = (map[d] ?? 0) + inv.totalAmount;
    }
    return days.map((d) => ({
      date: shortDate(d),
      total: map[d] ?? 0,
    }));
  }, [invoices, days]);

  return (
    <Card>
      <SectionCardHeader title="Arrecadação — últimos 30 dias" />
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                interval={4}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(v) => `R$${v}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CurrencyTooltip />} />
              <Line
                type="monotone"
                dataKey="total"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-primary)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function HourlyUsageChart({ invoices }: { invoices: InvoicePayload[] }) {
  const data = useMemo(() => {
    const map: Record<number, number> = {};
    for (const inv of invoices) {
      const h = getHour(inv.createdAt);
      map[h] = (map[h] ?? 0) + 1;
    }
    return Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      usos: map[h] ?? 0,
    }));
  }, [invoices]);

  return (
    <Card>
      <SectionCardHeader title="Tendência de uso — por hora do dia" />
      <CardContent>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickFormatter={(v) => `${v}h`}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<UsageTooltip />} />
              <Bar
                dataKey="usos"
                fill="var(--color-secondary)"
                radius={[3, 3, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

type GroupBy = "unit" | "user";
type FilterMode = "month" | "day";

function UnitBillingCard({ invoices }: { invoices: InvoicePayload[] }) {
  const [filterMode, setFilterMode] = useState<FilterMode>("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedDay, setSelectedDay] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("unit");

  const unitsQuery = useQuery({ queryKey: ["units"], queryFn: api.units.list });
  const units = useMemo(
    () => (unitsQuery.data ?? [])
      .filter((u) => u.active)
      .map((u) => ({ id: u.id, name: u.name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [unitsQuery.data],
  );

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesPeriod = filterMode === "month"
        ? inv.competence === selectedMonth
        : isoToDateStr(inv.createdAt) === selectedDay;
      const matchesUnit = selectedUnit === "all" || inv.unitId === selectedUnit;
      return matchesPeriod && matchesUnit;
    });
  }, [invoices, filterMode, selectedMonth, selectedDay, selectedUnit]);

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; sublabel: string; total: number }>();
    for (const inv of filtered) {
      const key = groupBy === "unit" ? (inv.unitId ?? inv.userId) : inv.userId;
      const label = groupBy === "unit" ? (inv.unitName ?? inv.userName) : inv.userName;
      const sublabel = groupBy === "unit" ? inv.userName : (inv.unitName ?? "—");
      if (!map.has(key)) {
        map.set(key, { label, sublabel, total: 0 });
      }
      map.get(key)!.total += inv.totalAmount;
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [filtered, groupBy]);

  const grandTotal = grouped.reduce((s, g) => s + g.total, 0);

  return (
    <Card>
      <SectionCardHeader title="Faturamento por unidade" />
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1.5">
            <Label className="typo-label">Período</Label>
            <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mês todo</SelectItem>
                <SelectItem value="day">Dia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filterMode === "month" ? (
            <div className="space-y-1.5">
              <Label className="typo-label">Competência</Label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="typo-label">Data</Label>
              <Input
                type="date"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-40"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="typo-label">Unidade</Label>
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="typo-label">Agrupar por</Label>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unit">Unidade</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {grouped.length === 0 ? (
          <p className="typo-caption text-muted-foreground">Nenhum dado para o período.</p>
        ) : (
          <div className="space-y-1">
            {grouped.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="typo-label truncate">{row.label}</p>
                  <p className="typo-caption text-muted-foreground truncate">{row.sublabel}</p>
                </div>
                <span className="ml-4 shrink-0 font-mono text-sm font-medium tabular-nums text-primary">
                  {formatCurrency(row.total)}
                </span>
              </div>
            ))}
            <div className="mt-2 flex justify-between rounded-md border-t pt-2 px-3">
              <span className="typo-label text-muted-foreground">Total</span>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function AdminBillingPage() {
  const queryClient = useQueryClient();
  const [competence, setCompetence] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoicePayload | null>(null);

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: api.invoices.list,
  });

  const invoiceDetailsQuery = useQuery({
    queryKey: ["invoice-details", selectedInvoice?.id],
    queryFn: () => api.invoices.getById(String(selectedInvoice?.id)),
    enabled: Boolean(selectedInvoice?.id),
  });

  const runBilling = useMutation({
    mutationFn: () => api.billing.run({ competence: competence || undefined }),
    onSuccess: async (result) => {
      notify.success(`Faturamento executado (${result.competence}).`);
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: (error) => notify.error("Falha ao executar faturamento.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const exportCsv = async (target: string) => {
    await api.billing.exportDownload(target, "csv");
  };

  const exportXlsx = async (target: string) => {
    await api.billing.exportDownload(target, "xlsx");
  };

  const invoices = invoicesQuery.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Faturamento"
        description="Execução de fechamento, análise de arrecadação e faturas."
      />

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DailyRevenueChart invoices={invoices} />
        <HourlyUsageChart invoices={invoices} />
      </div>

      {/* Unit billing */}
      <UnitBillingCard invoices={invoices} />

      {/* Run billing */}
      <Card>
        <SectionCardHeader title="Executar Fechamento" />
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Competência (YYYY-MM)</Label>
            <Input value={competence} onChange={(event) => setCompetence(event.target.value)} placeholder="2026-03" />
          </div>
          <Button onClick={() => runBilling.mutate()} disabled={runBilling.isPending}>
            {runBilling.isPending ? "Executando..." : "Rodar faturamento"}
          </Button>
        </CardContent>
      </Card>

      {/* Invoice list */}
      <Card>
        <SectionCardHeader title="Faturas" />
        <CardContent className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="rounded-md border p-3">
              <p className="typo-label text-primary">{invoice.competence} - {invoice.userName}</p>
              <p className="typo-caption text-muted-foreground">
                Unidade: {invoice.unitName || "-"} | Modo: {invoice.billingMode} | Total: {formatCurrency(invoice.totalAmount)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(invoice)}>Detalhes</Button>
                <Button size="sm" variant="outline" onClick={() => void exportCsv(invoice.competence)}>CSV</Button>
                <Button size="sm" variant="outline" onClick={() => void exportXlsx(invoice.competence)}>XLSX</Button>
              </div>
            </div>
          ))}
          {invoices.length === 0 ? (
            <p className="typo-caption text-muted-foreground">Nenhuma fatura gerada.</p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedInvoice)} onOpenChange={(open) => { if (!open) setSelectedInvoice(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
          </DialogHeader>
          {invoiceDetailsQuery.data ? (
            <InvoiceDetailsContent details={invoiceDetailsQuery.data} />
          ) : (
            <p className="typo-caption text-muted-foreground">Carregando detalhes...</p>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function InvoiceDetailsContent({ details }: { details: InvoiceDetailsPayload }) {
  return (
    <div className="space-y-3">
      <p className="typo-caption">
        Competência: <strong>{details.competence}</strong> | Usuário: <strong>{details.userName}</strong>
      </p>
      <p className="typo-caption">Total: <strong>{formatCurrency(details.totalAmount)}</strong></p>
      <div className="space-y-2 rounded-md border p-2">
        {details.items.map((item) => (
          <div key={item.id} className="rounded border p-2">
            <p className="typo-caption"><strong>{item.description}</strong></p>
            <p className="typo-caption text-muted-foreground">
              Qtd: {item.quantity} | Unit: {formatCurrency(item.unitPrice)} | Total: {formatCurrency(item.totalAmount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
