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

    expect(screen.getByText("Visao Geral")).toBeInTheDocument();
    expect(screen.getByText("Reservas")).toBeInTheDocument();
    expect(screen.getByText("Configuracoes")).toBeInTheDocument();
    expect(screen.getByText("Admin Unidades")).toBeInTheDocument();
    expect(screen.getByText("Admin Maquinas")).toBeInTheDocument();
    expect(screen.getByText("Admin Pares")).toBeInTheDocument();
    expect(screen.getByText("Admin Vinculos")).toBeInTheDocument();
  });
});
