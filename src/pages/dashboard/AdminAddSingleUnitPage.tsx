import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/primitives";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SingleUnitWizard from "@/components/dashboard/units/SingleUnitWizard";

export default function AdminAddSingleUnitPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="Adicionar Uma Unidade"
        description="Preencha os dados passo a passo."
        actions={
          <Button variant="outline" onClick={() => navigate("/dashboard/admin/unidades/adicionar")}>
            Voltar
          </Button>
        }
      />
      <SingleUnitWizard />
    </PageContainer>
  );
}
