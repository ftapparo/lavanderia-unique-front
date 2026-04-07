import { useNavigate } from "react-router-dom";
import { Building2, Layers } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

type OptionCard = {
  icon: React.ElementType;
  title: string;
  description: string;
  detail: string;
  href: string;
};

const options: OptionCard[] = [
  {
    icon: Building2,
    title: "Adicionar uma unidade",
    description: "Cadastre uma unidade individualmente.",
    detail:
      "Preencha os dados da unidade passo a passo, valide em tempo real se ela ja existe e opcionalmente ja vincule um usuario do sistema.",
    href: "/dashboard/admin/unidades/adicionar/uma",
  },
  {
    icon: Layers,
    title: "Adicionar em lote",
    description: "Gere varias unidades de uma so vez.",
    detail:
      "Informe a faixa de andares e a quantidade de unidades por andar. O sistema ignora automaticamente as que ja existem e exibe o progresso em tempo real.",
    href: "/dashboard/admin/unidades/adicionar/lote",
  },
];

export default function AdminAddUnitPage() {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <PageHeader
        title="Adicionar Unidade"
        description="Escolha como deseja adicionar unidades ao sistema."
        actions={
          <Button variant="outline" onClick={() => navigate("/dashboard/admin/unidades")}>
            Voltar para lista
          </Button>
        }
      />

      <div className="grid max-w-5xl gap-6 md:grid-cols-2">
        {options.map((opt) => (
          <button
            key={opt.href}
            onClick={() => navigate(opt.href)}
            className={cn(
              "group relative flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left",
              "transition-all duration-200",
              "hover:border-primary hover:shadow-md hover:shadow-primary/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <opt.icon className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h2 className="typo-section-title">{opt.title}</h2>
              <p className="typo-body text-muted-foreground">{opt.description}</p>
              <p className="typo-caption text-muted-foreground">{opt.detail}</p>
            </div>

            <span className="absolute right-5 top-6 text-muted-foreground/40 transition-all group-hover:right-4 group-hover:text-primary">
              -&gt;
            </span>
          </button>
        ))}
      </div>
    </PageContainer>
  );
}
