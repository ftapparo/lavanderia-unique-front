import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import HealthDashboard from "@/pages/dashboard/HealthDashboard";
import { api } from "@/services/api";

vi.mock("@/services/api", () => ({
  api: {
    health: vi.fn(),
  },
}));

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("HealthDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders health data on success", async () => {
    vi.mocked(api.health).mockResolvedValue({
      status: "API Funcionando!",
      environment: "development",
    });

    render(<HealthDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("API Funcionando!")).toBeInTheDocument();
      expect(screen.getByText("Ambiente: development")).toBeInTheDocument();
    });
  });

  it("renders error state when request fails", async () => {
    vi.mocked(api.health).mockRejectedValue(new Error("Erro 500"));

    render(<HealthDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Erro 500")).toBeInTheDocument();
    });
  });

  it("refetches when clicking update", async () => {
    vi.mocked(api.health).mockResolvedValue({
      status: "API Funcionando!",
      environment: "development",
    });

    render(<HealthDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("API Funcionando!")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Atualizar/i }));

    await waitFor(() => {
      expect(api.health).toHaveBeenCalledTimes(2);
    });
  });
});

