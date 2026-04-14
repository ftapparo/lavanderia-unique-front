import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { SidebarProvider } from "@/components/ui/primitives";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ profile: { role: "ADMIN" } }),
}));

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

    expect(screen.getByRole("link", { name: "Visao Geral" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reservas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Configuracoes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Jobs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ocorrencias" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Faturamento" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sistema" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Usuarios" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Unidades" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Maquinas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Pares" })).toBeInTheDocument();
  });
});
