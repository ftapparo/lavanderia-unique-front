import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/primitives";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import BatchUnitWizard from "@/components/dashboard/units/BatchUnitWizard";

export default function AdminAddBatchUnitPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="Adicionar Unidades em Lote"
        description="Gere várias unidades de uma só vez por faixa de andares."
        actions={
          <Button variant="outline" onClick={() => navigate("/dashboard/admin/unidades/adicionar")}>
            Voltar
          </Button>
        }
      />
      <BatchUnitWizard />
    </PageContainer>
  );
}
