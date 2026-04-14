import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import SectionCardHeader from "@/components/layout/SectionCardHeader";
import { StatusBadgeGroup } from "@/components/ui/composites/status-badge-group";
import { Alert, AlertDescription, AlertTitle, Button, Card, CardContent, Input, Label, Switch, Textarea } from "@/components/ui/primitives";
import { notify } from "@/lib/notify";
import { api, type AdminJobConfigPayload, type AdminJobRuntimeStatePayload } from "@/services/api";

const MONTH_NAMES = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const WEEKDAY_NAMES = ["domingo", "segunda-feira", "terca-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sabado"];

function formatDateTime(value: string | null) {
    if (!value) return "Ainda nao executado";
    return new Date(value).toLocaleString("pt-BR");
}

function mapStatusLabel(status: AdminJobRuntimeStatePayload["lastStatus"] | undefined) {
    switch (status) {
        case "SUCCESS":
            return { label: "Ultima execucao com sucesso", variant: "default" as const };
        case "ERROR":
            return { label: "Ultima execucao com erro", variant: "destructive" as const };
        case "RUNNING":
            return { label: "Executando agora", variant: "secondary" as const };
        default:
            return { label: "Aguardando primeira execucao", variant: "outline" as const };
    }
}

function FieldHint({ children }: { children: React.ReactNode }) {
    return <p className="mt-1 text-xs text-muted-foreground">{children}</p>;
}

function pad2(value: string) {
    return value.padStart(2, "0");
}

function describeMonth(field: string) {
    if (field === "*") return "todos os meses";
    if (/^\d+$/.test(field)) {
        const monthIndex = Number(field) - 1;
        return MONTH_NAMES[monthIndex] ? `em ${MONTH_NAMES[monthIndex]}` : `no mes ${field}`;
    }
    return `nos meses ${field}`;
}

function describeWeekday(field: string) {
    if (field === "*" || field === "?") return "qualquer dia da semana";
    if (field === "1-5") return "de segunda a sexta";
    if (/^\d$/.test(field)) return `na ${WEEKDAY_NAMES[Number(field)] ?? `dia da semana ${field}`}`;
    if (/^[\d,]+$/.test(field)) {
        const days = field
            .split(",")
            .map((token) => WEEKDAY_NAMES[Number(token)] ?? `dia ${token}`);
        return `em ${days.join(", ")}`;
    }
    return `nos dias da semana ${field}`;
}

function describeDayOfMonth(field: string) {
    if (field === "*" || field === "?") return "todos os dias do mes";
    if (/^\d+$/.test(field)) return `no dia ${field}`;
    if (/^\*\/\d+$/.test(field)) return `a cada ${field.slice(2)} dias`;
    return `nos dias ${field}`;
}

function describeTime(seconds: string, minutes: string, hours: string) {
    const hasSeconds = seconds !== "0";

    if (minutes === "*" && hours === "*" && !hasSeconds) {
        return "a cada minuto";
    }

    if (/^\*\/\d+$/.test(minutes) && hours === "*" && !hasSeconds) {
        return `a cada ${minutes.slice(2)} minutos`;
    }

    if (/^\d+$/.test(minutes) && hours === "*" && !hasSeconds) {
        return `no minuto ${pad2(minutes)} de toda hora`;
    }

    if (/^\d+$/.test(minutes) && /^\d+$/.test(hours) && !hasSeconds) {
        return `as ${pad2(hours)}:${pad2(minutes)}`;
    }

    if (/^\*\/\d+$/.test(hours) && minutes === "0" && !hasSeconds) {
        return `a cada ${hours.slice(2)} horas, no minuto 00`;
    }

    if (hasSeconds && /^\d+$/.test(seconds) && /^\d+$/.test(minutes) && /^\d+$/.test(hours)) {
        return `as ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
    }

    return `com horario ${hasSeconds ? `${seconds} ${minutes} ${hours}` : `${minutes} ${hours}`}`;
}

function interpretCronExpression(expression: string) {
    const trimmed = expression.trim();
    if (!trimmed) {
        return {
            tone: "muted" as const,
            text: "Digite a expressao cron para ver a interpretacao em tempo real.",
        };
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length !== 5 && parts.length !== 6) {
        return {
            tone: "destructive" as const,
            text: "Expressao incompleta. Use 5 campos no formato minuto hora dia-do-mes mes dia-da-semana.",
        };
    }

    const [seconds, minutes, hours, dayOfMonth, month, weekday] = parts.length === 6
        ? parts
        : ["0", parts[0], parts[1], parts[2], parts[3], parts[4]];

    const timeDescription = describeTime(seconds, minutes, hours);
    const dayDescription = describeDayOfMonth(dayOfMonth);
    const monthDescription = describeMonth(month);
    const weekdayDescription = describeWeekday(weekday);

    if (dayOfMonth === "*" && month === "*" && weekday === "*") {
        return {
            tone: "muted" as const,
            text: `Executa ${timeDescription}.`,
        };
    }

    if (dayOfMonth === "1" && month === "*" && weekday === "*") {
        return {
            tone: "muted" as const,
            text: `Executa ${timeDescription} no dia 1 de cada mes.`,
        };
    }

    if (dayOfMonth === "*" && month === "*" && weekday === "1-5") {
        return {
            tone: "muted" as const,
            text: `Executa ${timeDescription}, de segunda a sexta.`,
        };
    }

    return {
        tone: "muted" as const,
        text: `Executa ${timeDescription}, ${dayDescription}, ${monthDescription}, ${weekdayDescription}.`,
    };
}

function JobConfigCard({ job }: { job: AdminJobConfigPayload }) {
    const queryClient = useQueryClient();
    const [description, setDescription] = useState(job.description);
    const [cronExpression, setCronExpression] = useState(job.cron_expression);
    const [active, setActive] = useState(job.active);

    useEffect(() => {
        setDescription(job.description);
        setCronExpression(job.cron_expression);
        setActive(job.active);
    }, [job.active, job.cron_expression, job.description, job.updated_at]);

    const hasSchedulerChanges = cronExpression !== job.cron_expression || active !== job.active;

    const updateJobMutation = useMutation({
        mutationFn: () => api.admin.updateJob(job.name, {
            description,
            cronExpression,
            active,
        }),
        onSuccess: async () => {
            notify.success(
                "Configuracao do job salva.",
                hasSchedulerChanges
                    ? { description: "A atualizacao fica pendente ate o proximo ciclo de reaplicacao do scheduler." }
                    : { description: "A descricao foi atualizada imediatamente." },
            );
            await queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
            await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
            await queryClient.invalidateQueries({ queryKey: ["admin-ops-health"] });
        },
        onError: (error) => {
            notify.error("Falha ao salvar job.", {
                description: error instanceof Error ? error.message : "Erro ao atualizar configuracao.",
            });
        },
    });

    const isDirty = description !== job.description || hasSchedulerChanges;
    const runtimeState = job.runtimeState;
    const statusBadge = mapStatusLabel(runtimeState?.lastStatus);
    const cronMeaning = interpretCronExpression(cronExpression);

    return (
        <Card>
            <SectionCardHeader
                title={job.name}
                description="Ajuste a descricao funcional, a expressao cron e a ativacao do job sem reiniciar a API."
            />
            <CardContent className="space-y-5">
                <StatusBadgeGroup
                    items={[
                        statusBadge,
                        { label: active ? "Ativo" : "Inativo", variant: active ? "default" : "secondary" },
                        ...(job.need_update ? [{ label: "Pendente de reaplicacao", variant: "outline" as const }] : []),
                    ]}
                />

                <div className="space-y-1.5">
                    <Label htmlFor={`description-${job.name}`}>Descricao</Label>
                    <Textarea
                        id={`description-${job.name}`}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        placeholder="Explique rapidamente o que este job faz."
                    />
                    <FieldHint>Texto exibido para ajudar o administrador a entender a responsabilidade do job.</FieldHint>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <div className="space-y-1.5">
                        <Label htmlFor={`cron-${job.name}`}>Expressao cron</Label>
                        <Input
                            id={`cron-${job.name}`}
                            value={cronExpression}
                            onChange={(event) => setCronExpression(event.target.value)}
                            placeholder="*/5 * * * *"
                            spellCheck={false}
                        />
                        <FieldHint>Use o formato aceito pelo node-cron. Exemplo: */5 * * * * executa a cada 5 minutos.</FieldHint>
                        <p className={`text-sm ${cronMeaning.tone === "destructive" ? "text-destructive" : "text-muted-foreground"}`}>
                            {cronMeaning.text}
                        </p>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                        <div className="space-y-1">
                            <Label htmlFor={`active-${job.name}`} className="text-sm">Job habilitado</Label>
                            <p className="text-xs text-muted-foreground">Desative para impedir novos agendamentos.</p>
                        </div>
                        <Switch
                            id={`active-${job.name}`}
                            checked={active}
                            onCheckedChange={setActive}
                        />
                    </div>
                </div>

                <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <p className="typo-caption text-muted-foreground">Ultimo inicio</p>
                        <p className="text-sm text-foreground">{formatDateTime(runtimeState?.lastStartedAt ?? null)}</p>
                    </div>
                    <div>
                        <p className="typo-caption text-muted-foreground">Ultimo termino</p>
                        <p className="text-sm text-foreground">{formatDateTime(runtimeState?.lastFinishedAt ?? null)}</p>
                    </div>
                    <div>
                        <p className="typo-caption text-muted-foreground">Execucoes</p>
                        <p className="text-sm text-foreground">
                            {runtimeState?.runCount ?? 0} total | {runtimeState?.successCount ?? 0} sucesso | {runtimeState?.errorCount ?? 0} erro
                        </p>
                    </div>
                    <div>
                        <p className="typo-caption text-muted-foreground">Ultima alteracao persistida</p>
                        <p className="text-sm text-foreground">{formatDateTime(job.updated_at)}</p>
                    </div>
                </div>

                {runtimeState?.lastError ? (
                    <Alert variant="destructive">
                        <AlertTitle>Ultimo erro do job</AlertTitle>
                        <AlertDescription>{runtimeState.lastError}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                        {description !== job.description && !hasSchedulerChanges
                            ? "A descricao e atualizada imediatamente e nao exige reaplicacao do scheduler."
                            : job.need_update
                                ? "A configuracao foi salva no banco e aguarda reaplicacao automatica pelo watcher."
                                : "A configuracao atual ja foi aplicada pelo scheduler."}
                    </p>
                    <Button onClick={() => updateJobMutation.mutate()} disabled={!isDirty || updateJobMutation.isPending}>
                        {updateJobMutation.isPending ? "Salvando..." : "Salvar job"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminJobsPage() {
    const jobsQuery = useQuery({
        queryKey: ["admin-jobs"],
        queryFn: api.admin.listJobs,
        refetchInterval: 15000,
    });

    return (
        <PageContainer>
            <PageHeader
                title="Configuracao de Jobs"
                description="Gerencie os agendamentos operacionais carregados do banco e acompanhe o estado de execucao em tempo real."
            />

            <Alert>
                <AlertTitle>Aplicacao das alteracoes</AlertTitle>
                <AlertDescription>
                    Ao salvar, a nova configuracao fica registrada no banco imediatamente. O scheduler reaplica jobs pendentes automaticamente no proximo ciclo do watcher.
                </AlertDescription>
            </Alert>

            {jobsQuery.isLoading ? <p className="typo-caption text-muted-foreground">Carregando configuracoes dos jobs...</p> : null}
            {jobsQuery.isError ? (
                <p className="typo-caption text-destructive">
                    {jobsQuery.error instanceof Error ? jobsQuery.error.message : "Falha ao carregar jobs."}
                </p>
            ) : null}

            <div className="space-y-4">
                {jobsQuery.data?.map((job) => (
                    <JobConfigCard key={job.name} job={job} />
                ))}
            </div>
        </PageContainer>
    );
}