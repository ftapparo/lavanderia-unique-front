import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import ComponentsShowcase from "@/pages/dashboard/ComponentsShowcase";
import ComponentsShowcaseTwo from "@/pages/dashboard/ComponentsShowcaseTwo";
import ComponentsShowcaseThree from "@/pages/dashboard/ComponentsShowcaseThree";
import ComponentsShowcaseFour from "@/pages/dashboard/ComponentsShowcaseFour";
import ComponentsShowcaseFive from "@/pages/dashboard/ComponentsShowcaseFive";
import TypographyShowcase from "@/pages/dashboard/TypographyShowcase";
import { TooltipProvider } from "@/components/ui/primitives";

const { notifyMock, toastMock } = vi.hoisted(() => ({
  notifyMock: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
  toastMock: Object.assign(vi.fn(), {
    loading: vi.fn(() => "id-1"),
    success: vi.fn(),
    promise: vi.fn(),
  }),
}));

vi.mock("@/lib/notify", () => ({ notify: notifyMock }));
vi.mock("@/components/ui/sonner", () => ({ toast: toastMock }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      name: "ADMIN",
      role: "ADMIN",
      email: "admin@unique.local",
      cpf: "00000000000",
    },
  }),
}));
vi.mock("@/services/api", () => ({
  api: {
    units: { list: vi.fn().mockResolvedValue([]) },
    memberships: { list: vi.fn().mockResolvedValue([]) },
  },
}));

describe("dashboard pages smoke", () => {
  const renderWithTooltip = (ui: ReactElement) => render(<TooltipProvider>{ui}</TooltipProvider>);

  it("renders main showcase pages", () => {
    renderWithTooltip(<DashboardHome />);
    expect(screen.getByText("Painel Inicial")).toBeInTheDocument();

    renderWithTooltip(<ComponentsShowcase />);
    expect(screen.getByText("Showcase de Componentes 1")).toBeInTheDocument();

    renderWithTooltip(<ComponentsShowcaseTwo />);
    expect(screen.getByText("Showcase de Componentes 2")).toBeInTheDocument();

    renderWithTooltip(<ComponentsShowcaseThree />);
    expect(screen.getByText("Showcase de Componentes 3")).toBeInTheDocument();

    renderWithTooltip(<TypographyShowcase />);
    expect(screen.getByText("Tipografia")).toBeInTheDocument();
  });

  it("fires toast and notify actions on ComponentsShowcaseFour", () => {
    renderWithTooltip(<ComponentsShowcaseFour />);

    fireEvent.click(screen.getByRole("button", { name: "Info" }));
    fireEvent.click(screen.getByRole("button", { name: "Sucesso" }));
    fireEvent.click(screen.getByRole("button", { name: "Alerta" }));
    fireEvent.click(screen.getByRole("button", { name: "Erro" }));

    expect(notifyMock.info).toHaveBeenCalled();
    expect(notifyMock.success).toHaveBeenCalled();
    expect(notifyMock.warning).toHaveBeenCalled();
    expect(notifyMock.error).toHaveBeenCalled();
  });

  it("renders date/time fields in ComponentsShowcaseFive", () => {
    renderWithTooltip(<ComponentsShowcaseFive />);

    expect(screen.getByText("Date Picker (Popover)")).toBeInTheDocument();
    expect(screen.getByText("Time Picker (Popover)")).toBeInTheDocument();
    expect(screen.getByText("DateTime Picker (Popover)")).toBeInTheDocument();
  });
});
