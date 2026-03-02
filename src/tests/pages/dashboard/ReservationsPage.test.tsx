import { fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import ReservationsPage from "@/pages/dashboard/ReservationsPage";

vi.mock("@/services/api", () => ({
  api: {
    machinePairs: {
      list: vi.fn(async () => [
        {
          id: "pair-1",
          unitId: "unit-1",
          unitName: "Unidade 101",
          unitCode: "101",
          name: "Par A",
          washerMachineId: "w-1",
          washerMachineName: "Lavadora 1",
          dryerMachineId: "d-1",
          dryerMachineName: "Secadora 1",
          active: true,
        },
      ]),
    },
    reservations: {
      list: vi.fn(async () => [
        {
          id: "res-1",
          unitId: "unit-1",
          unitName: "Unidade 101",
          unitCode: "101",
          machinePairId: "pair-1",
          machinePairName: "Par A",
          userId: "user-1",
          userName: "Usuario 1",
          startAt: "2026-03-10T10:00:00.000Z",
          endAt: "2026-03-10T12:00:00.000Z",
          status: "CONFIRMED",
          canceledAt: null,
        },
      ]),
      create: vi.fn(async () => ({})),
      cancel: vi.fn(async () => ({})),
    },
  },
}));

vi.mock("@/lib/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe("ReservationsPage", () => {
  it("renders monthly/weekly views and reservation list", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ReservationsPage />
      </QueryClientProvider>,
    );

    expect(screen.getByText("Reservas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Visao Mensal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Visao Semanal" })).toBeInTheDocument();

    await waitForElementToBeRemoved(() => screen.getByText("Carregando reservas..."));

    fireEvent.click(screen.getByRole("button", { name: "Visao Semanal" }));
    expect(screen.getByText("Calendario da Semana")).toBeInTheDocument();
  });
});
