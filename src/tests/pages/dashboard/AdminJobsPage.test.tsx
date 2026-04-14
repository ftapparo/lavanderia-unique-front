import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import AdminJobsPage from "@/pages/dashboard/AdminJobsPage";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";

vi.mock("@/services/api", () => ({
    api: {
        admin: {
            listJobs: vi.fn(),
            updateJob: vi.fn(),
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

describe("AdminJobsPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renderiza jobs e permite salvar nova configuracao", async () => {
        vi.mocked(api.admin.listJobs).mockResolvedValue([
            {
                name: "no-show-detector",
                description: "Encerra automaticamente reservas sem check-in dentro da janela permitida.",
                cron_expression: "*/2 * * * *",
                active: true,
                need_update: false,
                updated_by_user_id: "user-1",
                updated_at: "2026-04-13T12:00:00.000Z",
                runtimeState: {
                    lastStartedAt: "2026-04-13T12:00:00.000Z",
                    lastFinishedAt: "2026-04-13T12:00:03.000Z",
                    lastStatus: "SUCCESS",
                    lastError: null,
                    runCount: 12,
                    successCount: 12,
                    errorCount: 0,
                    cronExpression: "*/2 * * * *",
                    active: true,
                },
            },
        ]);
        vi.mocked(api.admin.updateJob).mockResolvedValue({
            name: "no-show-detector",
            description: "Encerra automaticamente reservas sem check-in dentro da janela permitida.",
            cron_expression: "*/5 * * * *",
            active: false,
            need_update: true,
            updated_by_user_id: "user-1",
            updated_at: "2026-04-13T12:05:00.000Z",
            runtimeState: {
                lastStartedAt: "2026-04-13T12:00:00.000Z",
                lastFinishedAt: "2026-04-13T12:00:03.000Z",
                lastStatus: "SUCCESS",
                lastError: null,
                runCount: 12,
                successCount: 12,
                errorCount: 0,
                cronExpression: "*/2 * * * *",
                active: true,
            },
        });

        render(<AdminJobsPage />, { wrapper: createWrapper() });

        const descriptionInput = await screen.findByLabelText("Descricao");
        const cronInput = await screen.findByLabelText("Expressao cron");
        const saveButton = screen.getByRole("button", { name: "Salvar job" });
        const activeSwitch = screen.getByRole("switch", { name: "Job habilitado" });

        expect(screen.getByText("no-show-detector")).toBeInTheDocument();
        expect(descriptionInput).toHaveValue("Encerra automaticamente reservas sem check-in dentro da janela permitida.");
        expect(screen.getByText("Executa a cada 2 minutos.")).toBeInTheDocument();
        expect(saveButton).toBeDisabled();

        fireEvent.change(descriptionInput, { target: { value: "Encerra reservas sem check-in e registra a ocorrencia automaticamente." } });
        fireEvent.change(cronInput, { target: { value: "*/5 * * * *" } });
        fireEvent.click(activeSwitch);

        expect(screen.getByText("Executa a cada 5 minutos.")).toBeInTheDocument();
        expect(saveButton).toBeEnabled();

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.admin.updateJob).toHaveBeenCalledWith("no-show-detector", {
                description: "Encerra reservas sem check-in e registra a ocorrencia automaticamente.",
                cronExpression: "*/5 * * * *",
                active: false,
            });
            expect(notify.success).toHaveBeenCalledWith("Configuracao do job salva.", {
                description: "A atualizacao fica pendente ate o proximo ciclo de reaplicacao do scheduler.",
            });
        });
    });

    it("renderiza erro quando a consulta falha", async () => {
        vi.mocked(api.admin.listJobs).mockRejectedValue(new Error("Falha ao carregar jobs"));

        render(<AdminJobsPage />, { wrapper: createWrapper() });

        await waitFor(() => {
            expect(screen.getByText("Falha ao carregar jobs")).toBeInTheDocument();
        });
    });

    it("mostra mensagem de cron incompleto enquanto o usuario digita", async () => {
        vi.mocked(api.admin.listJobs).mockResolvedValue([
            {
                name: "monthly-billing-generator",
                description: "Gera o faturamento mensal com base nas regras e consumos registrados no sistema.",
                cron_expression: "5 0 1 * *",
                active: true,
                need_update: false,
                updated_by_user_id: "user-1",
                updated_at: "2026-04-13T12:00:00.000Z",
                runtimeState: {
                    lastStartedAt: null,
                    lastFinishedAt: null,
                    lastStatus: "IDLE",
                    lastError: null,
                    runCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    cronExpression: "5 0 1 * *",
                    active: true,
                },
            },
        ]);

        render(<AdminJobsPage />, { wrapper: createWrapper() });

        const cronInput = await screen.findByLabelText("Expressao cron");
        expect(screen.getByText("Executa as 00:05 no dia 1 de cada mes.")).toBeInTheDocument();

        fireEvent.change(cronInput, { target: { value: "*/5 * *" } });

        expect(screen.getByText("Expressao incompleta. Use 5 campos no formato minuto hora dia-do-mes mes dia-da-semana.")).toBeInTheDocument();
    });
    it("permite salvar apenas a descricao sem sinalizar reaplicacao do scheduler", async () => {
        vi.mocked(api.admin.listJobs).mockResolvedValue([
            {
                name: "overtime-monitor",
                description: "Monitora sessoes em overtime para desligar maquinas e encerrar a sessao quando o consumo cair.",
                cron_expression: "* * * * *",
                active: true,
                need_update: false,
                updated_by_user_id: "user-1",
                updated_at: "2026-04-13T12:00:00.000Z",
                runtimeState: {
                    lastStartedAt: null,
                    lastFinishedAt: null,
                    lastStatus: "IDLE",
                    lastError: null,
                    runCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    cronExpression: "* * * * *",
                    active: true,
                },
            },
        ]);
        vi.mocked(api.admin.updateJob).mockResolvedValue({
            name: "overtime-monitor",
            description: "Monitora sessoes em overtime e finaliza automaticamente quando o consumo estiver abaixo do limite.",
            cron_expression: "* * * * *",
            active: true,
            need_update: false,
            updated_by_user_id: "user-1",
            updated_at: "2026-04-13T12:05:00.000Z",
            runtimeState: {
                lastStartedAt: null,
                lastFinishedAt: null,
                lastStatus: "IDLE",
                lastError: null,
                runCount: 0,
                successCount: 0,
                errorCount: 0,
                cronExpression: "* * * * *",
                active: true,
            },
        });

        render(<AdminJobsPage />, { wrapper: createWrapper() });

        const descriptionInput = await screen.findByLabelText("Descricao");
        const saveButton = screen.getByRole("button", { name: "Salvar job" });

        fireEvent.change(descriptionInput, { target: { value: "Monitora sessoes em overtime e finaliza automaticamente quando o consumo estiver abaixo do limite." } });

        expect(screen.getByText("A descricao e atualizada imediatamente e nao exige reaplicacao do scheduler.")).toBeInTheDocument();

        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(api.admin.updateJob).toHaveBeenCalledWith("overtime-monitor", {
                description: "Monitora sessoes em overtime e finaliza automaticamente quando o consumo estiver abaixo do limite.",
                cronExpression: "* * * * *",
                active: true,
            });
            expect(notify.success).toHaveBeenCalledWith("Configuracao do job salva.", {
                description: "A descricao foi atualizada imediatamente.",
            });
        });
    });
});
