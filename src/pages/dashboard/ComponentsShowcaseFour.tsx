import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { notify } from "@/lib/notify";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/primitives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/primitives";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/primitives";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/primitives";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/primitives";

export default function ComponentsShowcaseFour() {
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <PageContainer>
      <PageHeader
        title="Showcase de Componentes 4"
        description="Componentes adicionais com foco principal em testes de Toast (Sonner)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Toast (Sonner)</CardTitle>
          <CardDescription>
            Testes de notificacao: info, sucesso, alerta, erro, loading, promise e acao no toast.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => notify.info("Mensagem informativa", { description: "Atualizacao executada." })}>Info</Button>
          <Button onClick={() => notify.success("Operacao concluida", { description: "Os dados foram salvos." })}>
            Sucesso
          </Button>
          <Button onClick={() => notify.warning("Atenção", { description: "Existe um item pendente." })}>
            Alerta
          </Button>
          <Button onClick={() => notify.error("Falha na operacao", { description: "Tente novamente em instantes." })}>
            Erro
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const id = toast.loading("Sincronizando dados...");
              window.setTimeout(() => {
                toast.success("Sincronizacao concluida", { id, description: "Tudo atualizado com sucesso." });
              }, 1600);
            }}
          >
            Loading para Success
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              const job = new Promise((resolve) => window.setTimeout(resolve, 1800));
              toast.promise(job, {
                loading: "Processando...",
                success: "Processamento concluido",
                error: "Falha no processamento",
              });
            }}
          >
            Promise Toast
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              toast("Nova versao disponivel", {
                description: "Deseja atualizar agora?",
                action: {
                  label: "Atualizar",
                  onClick: () => notify.success("Atualizacao iniciada"),
                },
              });
            }}
          >
            Toast com acao
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Breadcrumb</CardTitle>
            <CardDescription>
              `Breadcrumb` ajuda a orientar a navegacao hierarquica e o contexto da tela atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Componentes</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Componentes 4</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagination</CardTitle>
            <CardDescription>
              `Pagination` organiza grandes listas em paginas para melhorar leitura e performance percebida.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dropdown Menu</CardTitle>
            <CardDescription>
              `DropdownMenu` agrupa acoes contextuais e configuracoes pontuais em um menu compacto.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Abrir menu
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Acoes rapidas</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Duplicar item</DropdownMenuItem>
                <DropdownMenuItem>Exportar</DropdownMenuItem>
                <DropdownMenuCheckboxItem
                  checked={emailAlerts}
                  onCheckedChange={(checked) => setEmailAlerts(Boolean(checked))}
                >
                  Alertas por e-mail
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menubar</CardTitle>
            <CardDescription>
              `Menubar` e util para menus persistentes no topo com multiplos grupos de acoes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>Arquivo</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Novo</MenubarItem>
                  <MenubarItem>Abrir</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Salvar</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Editar</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Desfazer</MenubarItem>
                  <MenubarItem>Refazer</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}


