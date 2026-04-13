import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import ReservationsPage from "@/pages/dashboard/ReservationsPage";

vi.mock("@/components/ui/primitives", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/ui/primitives")>();
  return {
    ...actual,
    useSidebar: () => ({ state: "expanded" as const }),
  };
});

vi.mock("@/services/api", () => ({
  getEstimatedServerNow: vi.fn(() => new Date("2026-03-10T12:00:00.000Z")),
  api: {
    units: {
      list: vi.fn(async () => [
        {
          id: "unit-1",
          name: "11",
          code: "1",
          floor: 1,
          unitNumber: 1,
          active: true,
        },
      ]),
    },
    machinePairs: {
      list: vi.fn(async () => [
        {
          id: "pair-1",
          name: "Par A",
          washerMachineId: "w-1",
          washerMachineName: "Lavadora 1",
          dryerMachineId: "d-1",
          dryerMachineName: "Secadora 1",
          active: true,
        },
      ]),
    },
    memberships: {
      list: vi.fn(async () => [
        {
          id: "membership-1",
          userId: "user-1",
          unitId: "unit-1",
          role: "RESIDENT",
          active: true,
          startDate: "2026-01-01",
          endDate: null,
        },
      ]),
    },
    users: {
      list: vi.fn(async () => []),
    },
    settings: {
      get: vi.fn(async () => ({
        checkinWindowBeforeMinutes: 15,
        checkinWindowAfterMinutes: 30,
        reservationDurationHours: 2,
        reservationStartMode: "FULL_HOUR",
        overtimeThresholdWatts: 15,
        consumptionPollSeconds: 30,
        billingMode: "PER_USE",
        pricePerUse: 0,
        pricePerKwh: 0,
        updatedByUserId: null,
        updatedAt: "2026-03-10T12:00:00.000Z",
      })),
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
      listBusy: vi.fn(async () => []),
      create: vi.fn(async () => ({})),
      cancel: vi.fn(async () => ({})),
      checkIn: vi.fn(async () => ({})),
    },
    sessions: {
      getById: vi.fn(async () => ({})),
      getByReservationId: vi.fn(async () => ({})),
      finish: vi.fn(async () => ({})),
    },
  },
}));

afterEach(() => {
  vi.useRealTimers();
});

const setDesktopViewport = () => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: 1920,
  });
  window.dispatchEvent(new Event("resize"));
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    profile: {
      id: "user-1",
      role: "USER",
      name: "Usuario 1",
      email: "user1@example.com",
    },
  }),
}));

vi.mock("@/contexts/ActiveUnitContext", () => ({
  useActiveUnit: () => ({
    activeUnit: { id: "unit-1", name: "11", code: "1", floor: 1, unitNumber: 1, active: true },
    activeUnitId: "unit-1",
    availableUnits: [{ id: "unit-1", name: "11", code: "1", floor: 1, unitNumber: 1, active: true }],
    setActiveUnitId: vi.fn(),
  }),
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
  it("renders teams-like weekly calendar layout", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00.000Z"));
    setDesktopViewport();

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

    expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    expect(screen.getByText(/Unidade:/)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(screen.getByText("Hora")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "New meeting" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: ">" }));
    expect(screen.getByText(/Unidade:/)).toBeInTheDocument();
  });

  it("blocks booking creation for past slots and keeps future slots available", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00.000Z"));
    setDesktopViewport();

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

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    const calendarDayColumns = screen.getAllByRole("button").filter((element) => element.getAttribute("tabindex") === "0");
    expect(calendarDayColumns).toHaveLength(7);

    fireEvent.click(calendarDayColumns[2]);
    expect(screen.queryByText("Nova Reserva")).not.toBeInTheDocument();

    fireEvent.click(calendarDayColumns[6]);
    expect(screen.getByText("Nova Reserva")).toBeInTheDocument();
  });
});
