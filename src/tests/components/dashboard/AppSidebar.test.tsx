import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { SidebarProvider } from "@/components/ui/primitives";

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <SidebarProvider>{children}</SidebarProvider>
    </MemoryRouter>
  );
}

describe("AppSidebar", () => {
  it("renders all expected menu items", () => {
    render(<AppSidebar />, { wrapper: Wrapper });

    expect(screen.getByText("Visao Geral")).toBeInTheDocument();
    expect(screen.getByText("Componentes 1")).toBeInTheDocument();
    expect(screen.getByText("Componentes 5")).toBeInTheDocument();
    expect(screen.getByText("Tipografia")).toBeInTheDocument();
    expect(screen.getByText("Configuracoes")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
