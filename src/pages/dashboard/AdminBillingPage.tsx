import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, Input, Label } from "@/components/ui/primitives";
import { api, type InvoiceDetailsPayload, type InvoicePayload } from "@/services/api";
import { notify } from "@/lib/notify";

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

  return (
    <PageContainer>
      <PageHeader
        title="Faturamento"
        description="Execucao manual de fechamento e consulta de faturas."
      />

      <Card>
        <SectionCardHeader title="Executar Fechamento" />
        <CardContent className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label>Competencia (YYYY-MM)</Label>
            <Input value={competence} onChange={(event) => setCompetence(event.target.value)} placeholder="2026-03" />
          </div>
          <Button onClick={() => runBilling.mutate()} disabled={runBilling.isPending}>
            {runBilling.isPending ? "Executando..." : "Rodar faturamento"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <SectionCardHeader title="Faturas" />
        <CardContent className="space-y-3">
          {(invoicesQuery.data || []).map((invoice) => (
            <div key={invoice.id} className="rounded-md border p-3">
              <p className="typo-label text-primary">{invoice.competence} - {invoice.userName}</p>
              <p className="typo-caption text-muted-foreground">
                Unidade: {invoice.unitName || "-"} | Modo: {invoice.billingMode} | Total: R$ {invoice.totalAmount.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedInvoice(invoice)}>Detalhes</Button>
                <Button size="sm" variant="outline" onClick={() => void exportCsv(invoice.competence)}>CSV</Button>
                <Button size="sm" variant="outline" onClick={() => void exportXlsx(invoice.competence)}>XLSX</Button>
              </div>
            </div>
          ))}
          {(invoicesQuery.data || []).length === 0 ? (
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
        Competencia: <strong>{details.competence}</strong> | Usuario: <strong>{details.userName}</strong>
      </p>
      <p className="typo-caption">Total: <strong>R$ {details.totalAmount.toFixed(2)}</strong></p>
      <div className="space-y-2 rounded-md border p-2">
        {details.items.map((item) => (
          <div key={item.id} className="rounded border p-2">
            <p className="typo-caption"><strong>{item.description}</strong></p>
            <p className="typo-caption text-muted-foreground">
              Qtd: {item.quantity} | Unit: R$ {item.unitPrice.toFixed(2)} | Total: R$ {item.totalAmount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
