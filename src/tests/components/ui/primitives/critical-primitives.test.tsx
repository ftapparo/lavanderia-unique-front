import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/primitives";

describe("critical primitives behavior", () => {
  it("renders button/input/checkbox/radio/switch/tabs", () => {
    render(
      <div>
        <Button>Salvar</Button>
        <Input placeholder="Nome" />
        <Checkbox aria-label="check" checked />
        <RadioGroup value="a">
          <RadioGroupItem value="a" id="ra" />
        </RadioGroup>
        <Switch aria-label="switch" checked />
        <Tabs defaultValue="t1">
          <TabsList>
            <TabsTrigger value="t1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="t1">Conteudo</TabsContent>
        </Tabs>
      </div>,
    );

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nome")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab 1" })).toBeInTheDocument();
    expect(screen.getByText("Conteudo")).toBeInTheDocument();
  });

  it("opens popover and dialog", () => {
    render(
      <>
        <Popover>
          <PopoverTrigger asChild><Button>Abrir popover</Button></PopoverTrigger>
          <PopoverContent>Conteudo popover</PopoverContent>
        </Popover>

        <Dialog>
          <DialogTrigger asChild><Button>Abrir dialog</Button></DialogTrigger>
          <DialogContent>Conteudo dialog</DialogContent>
        </Dialog>
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir popover" }));
    expect(screen.getByText("Conteudo popover")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir dialog" }));
    expect(screen.getByText("Conteudo dialog")).toBeInTheDocument();
  });

  it("renders tooltip/select/sidebar baseline", () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild><Button>Tooltip</Button></TooltipTrigger>
          <TooltipContent>Texto tooltip</TooltipContent>
        </Tooltip>

        <Select defaultValue="a">
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Opcao A</SelectItem>
          </SelectContent>
        </Select>

        <SidebarProvider>
          <Sidebar>
            <SidebarTrigger />
          </Sidebar>
        </SidebarProvider>
      </TooltipProvider>,
    );

    expect(screen.getByRole("button", { name: "Tooltip" })).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
