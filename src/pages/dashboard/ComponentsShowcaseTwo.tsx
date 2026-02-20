import { useState } from "react";
import { BellRing } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/primitives";
import { Avatar, AvatarFallback } from "@/components/ui/primitives";
import { Button } from "@/components/ui/primitives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/primitives";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/primitives";
import { Progress } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/primitives";
import { Slider } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/primitives";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/primitives";
import { AlertVariantSwitcher, StatusBadgeGroup, type AlertVariantOption } from "@/components/ui/composites";

export default function ComponentsShowcaseTwo() {
  const [sliderValue, setSliderValue] = useState([35]);
  const [alertType, setAlertType] = useState<AlertVariantOption>("info");
  const updateSliderByStep = (step: number) => {
    setSliderValue((prev) => [Math.min(100, Math.max(0, (prev[0] ?? 0) + step))]);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Showcase de Componentes 2"
        description="Componentes adicionais para calibrar contraste, spacing e estados interativos."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Badge + Alert</CardTitle>
            <CardDescription>
              `StatusBadgeGroup` e `AlertVariantSwitcher` padronizam feedback visual de status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatusBadgeGroup
              items={[
                { label: "Info", variant: "info" },
                { label: "Sucesso", variant: "success" },
                { label: "Alerta", variant: "warning" },
                { label: "Erro", variant: "error" },
              ]}
            />
            <AlertVariantSwitcher value={alertType} onChange={setAlertType} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
            <CardDescription>
              `Tabs` organiza conteudo por secoes no mesmo espaco, com estado ativo e navegacao rapida.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Atividade</TabsTrigger>
                <TabsTrigger value="history">Historico</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-3 rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Resumo geral do modulo e indicadores principais.</p>
              </TabsContent>
              <TabsContent value="activity" className="space-y-3 rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Linha do tempo com eventos e alteracoes recentes.</p>
              </TabsContent>
              <TabsContent value="history" className="space-y-3 rounded-md border p-4">
                <p className="text-sm text-muted-foreground">Dados historicos para auditoria e comparacao.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Slider + Progress</CardTitle>
            <CardDescription>
              `Slider` controla um valor continuo; `Progress` representa visualmente esse mesmo valor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Intensidade</span>
                <span>{sliderValue[0]}%</span>
              </div>
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Progresso da tarefa</span>
                <span>{sliderValue[0]}%</span>
              </div>
              <Progress value={sliderValue[0]} />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => updateSliderByStep(-10)}>
                  -10%
                </Button>
                <Button variant="outline" size="sm" onClick={() => updateSliderByStep(10)}>
                  +10%
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tooltip + Popover + Dialog + Avatar + Skeleton</CardTitle>
            <CardDescription>
              `Tooltip`, `Popover` e `Dialog` cobrem overlays; `Avatar` representa perfil e `Skeleton` estado de carregamento.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline">Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Dica rapida para a acao.</p>
                </TooltipContent>
              </Tooltip>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Popover</Button>
                </PopoverTrigger>
                <PopoverContent className="space-y-2">
                  <p className="text-sm font-medium">Detalhes rapidos</p>
                  <p className="text-sm text-muted-foreground">Conteudo contextual sem trocar de tela.</p>
                </PopoverContent>
              </Popover>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <BellRing className="mr-2 h-4 w-4" />
                    Abrir dialog
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmar acao</DialogTitle>
                    <DialogDescription>Este modal ajuda a validar hierarquia de botoes e contraste.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancelar</Button>
                    <Button>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-4 w-[65%]" />
              <Skeleton className="h-4 w-[45%]" />
            </div>

            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>TP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Template Project</p>
                <p className="text-xs text-muted-foreground">Exemplo de uso do componente Avatar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accordion</CardTitle>
          <CardDescription>
            `Accordion` expande e recolhe conteudo por secoes, ideal para FAQs e detalhes opcionais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como usar esta pagina?</AccordionTrigger>
              <AccordionContent>Ajuste estilos dos componentes e compare estados visuais lado a lado.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Qual a diferenca da pagina 1?</AccordionTrigger>
              <AccordionContent>A pagina 1 cobre controles basicos; esta pagina agrupa componentes complementares.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Posso adicionar novos blocos?</AccordionTrigger>
              <AccordionContent>Sim. A ideia e evoluir continuamente para virar referencia interna do template.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

