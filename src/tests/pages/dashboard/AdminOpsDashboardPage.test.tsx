import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import AdminOpsDashboardPage from "@/pages/dashboard/AdminOpsDashboardPage";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";

vi.mock("@/services/api", () => ({
  api: {
    admin: {
      dashboard: vi.fn(),
      opsHealth: vi.fn(),
      activeSessions: vi.fn(),
      reconcileSession: vi.fn(),
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

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("AdminOpsDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza indicadores e permite reconciliar sessao ativa", async () => {
    vi.mocked(api.admin.dashboard).mockResolvedValue({
      reservationsTotal: 12,
      sessionsTotal: 8,
      incidentsTotal: 2,
      invoicesTotal: 4,
      activeSessionsTotal: 1,
      tuyaErrorsLast24h: 0,
      jobs: {
        enabled: true,
        started: true,
        retry: { attempts: 3, baseDelayMs: 400 },
        jobs: {
          noShowDetector: {
            lastStartedAt: "2026-03-03T10:00:00.000Z",
            lastFinishedAt: "2026-03-03T10:00:02.000Z",
            lastStatus: "SUCCESS",
            lastError: null,
            runCount: 2,
            successCount: 2,
            errorCount: 0,
          },
        },
      },
      generatedAt: "2026-03-03T10:00:03.000Z",
    });
    vi.mocked(api.admin.opsHealth).mockResolvedValue({
      db: "ok",
      tuya: "ok",
      tuyaDetails: null,
      jobs: {
        enabled: true,
        started: true,
        retry: { attempts: 3, baseDelayMs: 400 },
        jobs: {},
      },
      checkedAt: "2026-03-03T10:00:03.000Z",
    });
    vi.mocked(api.admin.activeSessions).mockResolvedValue([
      {
        id: "session-1",
        reservationId: "reservation-1",
        userName: "Morador A",
        unitName: "21",
        machinePairName: "Par 01",
        startedAt: "2026-03-03T09:00:00.000Z",
        overtimeStartedAt: null,
      },
    ]);
    vi.mocked(api.admin.reconcileSession).mockResolvedValue({
      id: "session-1",
      reservationId: "reservation-1",
      reservationStartAt: "2026-03-03T08:00:00.000Z",
      reservationEndAt: "2026-03-03T10:00:00.000Z",
      unitId: "unit-1",
      unitName: "21",
      unitCode: "21",
      machinePairId: "pair-1",
      machinePairName: "Par 01",
      userId: "user-1",
      userName: "Morador A",
      checkinAt: "2026-03-03T08:10:00.000Z",
      startedAt: "2026-03-03T08:10:00.000Z",
      finishedAt: "2026-03-03T10:05:00.000Z",
      status: "FINISHED",
      overtimeStartedAt: null,
      overtimeEndedAt: null,
    });

    render(<AdminOpsDashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Sessoes ativas")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText(/Banco:/)).toBeInTheDocument();
      expect(screen.getByText("Par 01 - Unidade 21")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Reconciliar sessao" }));

    await waitFor(() => {
      expect(api.admin.reconcileSession).toHaveBeenCalledWith("session-1");
      expect(notify.success).toHaveBeenCalledWith("Sessao reconciliada com sucesso.");
    });
  });

  it("renderiza erro quando falha ao carregar dashboard", async () => {
    vi.mocked(api.admin.dashboard).mockRejectedValue(new Error("Falha dashboard"));
    vi.mocked(api.admin.opsHealth).mockResolvedValue({
      db: "ok",
      tuya: "ok",
      tuyaDetails: null,
      jobs: {
        enabled: true,
        started: true,
        retry: { attempts: 3, baseDelayMs: 400 },
        jobs: {},
      },
      checkedAt: "2026-03-03T10:00:03.000Z",
    });
    vi.mocked(api.admin.activeSessions).mockResolvedValue([]);

    render(<AdminOpsDashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("Falha dashboard")).toBeInTheDocument();
    });
  });
});

