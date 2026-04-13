import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Loader2, SkipForward } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Progress,
  CardFooter,
} from "@/components/ui/primitives";
import { StepTimeline, type StepDef, type StepState } from "@/components/ui/StepTimeline";
import { api } from "@/services/api";
import { notify } from "@/lib/notify";
import { generateUnitPositions } from "@/lib/units";

type BatchStep = 1 | 2 | 3;

const STEPS: StepDef[] = [
  {
    label: "Parametros",
    description: "Defina faixa de andares e quantidade por andar.",
  },
  {
    label: "Previa",
    description: "Veja total, novas e existentes antes de executar.",
  },
  {
    label: "Execucao",
    description: "Gere as unidades e acompanhe o progresso em tempo real.",
  },
];

type ProgressState = {
  done: number;
  total: number;
  created: number;
  skipped: number;
  errors: number;
  currentLabel: string;
};

const toNum = (v: string): number => parseInt(v, 10);
const isValidNum = (v: string): boolean => /^\d+$/.test(v.trim()) && parseInt(v, 10) >= 0;

export default function BatchUnitWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<BatchStep>(1);
  const [startFloor, setStartFloor] = useState("0");
  const [endFloor, setEndFloor] = useState("10");
  const [unitsPerFloor, setUnitsPerFloor] = useState("4");
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [finished, setFinished] = useState(false);

  const unitsQuery = useQuery({ queryKey: ["admin-units"], queryFn: api.units.list });
  const createUnit = useMutation({ mutationFn: api.units.create });

  const existingPositions = useMemo(() => {
    return new Set(
      (unitsQuery.data ?? [])
        .filter((u) => u.floor !== null && u.unitNumber !== null)
        .map((u) => `${u.floor}-${u.unitNumber}`),
    );
  }, [unitsQuery.data]);

  const previewPositions = useMemo(() => {
    if (!isValidNum(startFloor) || !isValidNum(endFloor) || !isValidNum(unitsPerFloor)) return [];
    const start = toNum(startFloor);
    const end = toNum(endFloor);
    const perFloor = toNum(unitsPerFloor);
    if (start > end || perFloor <= 0) return [];
    return generateUnitPositions(start, end, perFloor).map((p) => ({
      ...p,
      alreadyExists: existingPositions.has(`${p.floor}-${p.unitNumber}`),
    }));
  }, [startFloor, endFloor, unitsPerFloor, existingPositions]);

  const toCreate = useMemo(() => previewPositions.filter((p) => !p.alreadyExists), [previewPositions]);
  const toSkip = useMemo(() => previewPositions.filter((p) => p.alreadyExists), [previewPositions]);

  const startValid = isValidNum(startFloor);
  const endValid = isValidNum(endFloor) && startValid && toNum(startFloor) <= toNum(endFloor);
  const unitsValid = /^\d+$/.test(unitsPerFloor.trim()) && toNum(unitsPerFloor) > 0;

  const isStep1Valid = startValid && endValid && unitsValid && previewPositions.length > 0;
  const canAdvanceFromPreview = previewPositions.length > 0;

  const resetBatch = () => {
    setStep(1);
    setStartFloor("0");
    setEndFloor("10");
    setUnitsPerFloor("4");
    setProgress(null);
    setFinished(false);
  };

  const doneConfirmation = () => {
    return (
      !(step === 3 && finished && progress) ? (
        <div className="flex w-full justify-between border-t pt-6">
          {step > 1 && !isGenerating ? (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as BatchStep)}>
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as BatchStep)}
              disabled={step === 1 ? !isStep1Valid : !canAdvanceFromPreview}
            >
              Proximo
            </Button>
          ) : (
            <Button onClick={() => void handleGenerate()} disabled={toCreate.length === 0 || isGenerating}>
              {isGenerating ? "Gerando..." : "Gerar"}
            </Button>
          )}
        </div>
      ) : null
    );
  };


  const handleGenerate = async () => {
    if (!toCreate.length) {
      notify.error("Nenhuma unidade nova para criar nessa faixa.");
      return;
    }

    setProgress({
      done: 0,
      total: toCreate.length,
      created: 0,
      skipped: toSkip.length,
      errors: 0,
      currentLabel: "",
    });

    let created = 0;
    let errors = 0;

    for (const pos of toCreate) {
      const label = `Andar ${pos.floor}, unidade ${pos.unitNumber}`;
      setProgress((prev) => (prev ? { ...prev, currentLabel: label } : null));
      try {
        await createUnit.mutateAsync({ floor: pos.floor, unitNumber: pos.unitNumber });
        created++;
      } catch {
        errors++;
      }
      setProgress((prev) => (prev ? { ...prev, done: prev.done + 1, created, errors } : null));
    }

    await queryClient.invalidateQueries({ queryKey: ["admin-units"] });
    setFinished(true);
  };

  const percent = progress ? Math.round((progress.done / progress.total) * 100) : 0;
  const isGenerating = progress !== null && !finished;

  const timelineStates: Partial<Record<number, StepState>> = useMemo(() => {
    if (finished && progress) {
      if (progress.errors > 0) {
        return { 1: "success", 2: "success", 3: "error" };
      }
      return { 1: "success", 2: "success", 3: "success" };
    }
    if (isGenerating) {
      return { 1: "done", 2: "done", 3: "current" };
    }
    return {};
  }, [finished, isGenerating, progress]);

  return (
    <div className="space-y-6 min-[1420px]:grid min-[1420px]:grid-cols-3 min-[1420px]:items-start min-[1420px]:gap-6 min-[1420px]:space-y-0">
      <div className="h-auto w-full rounded-xl bg-muted/60 p-4 min-[1420px]:col-span-1 min-[1420px]:h-[600px]">
        <div className="min-[1420px]:hidden">
          <StepTimeline steps={STEPS} current={step} orientation="horizontal" stepStates={timelineStates} />
        </div>
        <div className="hidden h-full min-[1420px]:block">
          <StepTimeline steps={STEPS} current={step} orientation="vertical" stepStates={timelineStates} />
        </div>
      </div>

      <div className="space-y-6 min-[1420px]:col-span-2">
        {step === 1 && (
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle>Etapa 1: parametros da geracao</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Preencha em sequencia: primeiro andar inicial, depois andar final e por ultimo unidades por andar.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-1.5">
                <Label htmlFor="bw-start-floor">1.1 Andar inicial</Label>
                <p className="text-xs text-muted-foreground">Primeiro andar que entrara no processamento.</p>
                <Input
                  id="bw-start-floor"
                  type="number"
                  min="0"
                  value={startFloor}
                  onChange={(e) => setStartFloor(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bw-end-floor">1.2 Andar final</Label>
                <p className="text-xs text-muted-foreground">Ultimo andar da faixa. Deve ser maior ou igual ao inicial.</p>
                <Input
                  id="bw-end-floor"
                  type="number"
                  min="0"
                  value={endFloor}
                  onChange={(e) => setEndFloor(e.target.value)}
                  disabled={!startValid}
                />
                {!startValid ? (
                  <p className="text-xs text-muted-foreground">Preencha primeiro o andar inicial.</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bw-units-per-floor">1.3 Unidades por andar</Label>
                <p className="text-xs text-muted-foreground">Quantidade de unidades a gerar em cada andar da faixa.</p>
                <Input
                  id="bw-units-per-floor"
                  type="number"
                  min="1"
                  value={unitsPerFloor}
                  onChange={(e) => setUnitsPerFloor(e.target.value)}
                  disabled={!endValid}
                />
                {!endValid ? (
                  <p className="text-xs text-muted-foreground">Defina uma faixa valida de andares para liberar este campo.</p>
                ) : null}
              </div>

              {isStep1Valid && (
                <p className="text-sm text-muted-foreground">Faixa valida. {previewPositions.length} posicao(oes) calculadas.</p>
              )}
            </CardContent>
            <CardFooter className="w-full">
              {doneConfirmation()}
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle>Etapa 2: previa detalhada</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Esta etapa mostra o impacto da geracao: total previsto, criacoes novas e itens que serao ignorados.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border p-4">
                  <p className="text-3xl font-bold">{previewPositions.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Total da faixa</p>
                </div>
                <div className="rounded-lg border border-green-200 p-4 dark:border-green-800">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{toCreate.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Novas criacoes</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-3xl font-bold text-muted-foreground">{toSkip.length}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Ja existentes</p>
                </div>
              </div>

              {toSkip.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  <SkipForward className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{toSkip.length} unidade(s) ja existem e serao ignoradas automaticamente.</span>
                </div>
              )}

              {toCreate.length === 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Todas as unidades dessa faixa ja existem. Volte e ajuste os parametros.</span>
                </div>
              )}

              {previewPositions.length > 0 && (
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Andar</th>
                        <th className="px-4 py-2 text-left font-medium">Unidade</th>
                        <th className="px-4 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewPositions.slice(0, 10).map((p) => (
                        <tr key={`${p.floor}-${p.unitNumber}`} className={p.alreadyExists ? "opacity-50" : ""}>
                          <td className="px-4 py-2">{p.floor}</td>
                          <td className="px-4 py-2">{p.unitNumber}</td>
                          <td className="px-4 py-2">
                            {p.alreadyExists ? (
                              <span className="text-muted-foreground">Ja existe</span>
                            ) : (
                              <span className="font-medium text-green-600 dark:text-green-400">Nova</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {previewPositions.length > 10 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-2 text-xs italic text-muted-foreground">
                            ... e mais {previewPositions.length - 10} posicao(oes)
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="w-full">
              {doneConfirmation()}
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle>Etapa 3: execucao</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {finished && progress
                  ? (progress.errors > 0
                    ? "Processamento concluido com falhas. Veja o resumo abaixo."
                    : "Processamento concluido com sucesso.")
                  : !isGenerating
                    ? `Ao confirmar, ${toCreate.length} unidade(s) serao criadas e ${toSkip.length} serao ignoradas.`
                    : "Processamento em andamento. Acompanhe o progresso abaixo."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              {isGenerating && progress ? (
                <div className="space-y-4">
                  <Progress value={percent} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{progress.done} de {progress.total}</span>
                    </div>
                    <span className="text-muted-foreground">{percent}%</span>
                  </div>
                  {progress.currentLabel && (
                    <p className="rounded bg-muted/50 px-3 py-1.5 font-mono text-xs text-muted-foreground">
                      {progress.currentLabel}
                    </p>
                  )}
                </div>
              ) : null}

              {finished && progress ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className={progress.errors > 0
                      ? "flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10"
                      : "flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"}>
                      <CheckCircle2 className={progress.errors > 0 ? "h-5 w-5 text-destructive" : "h-5 w-5 text-green-600 dark:text-green-400"} />
                    </div>
                    <div>
                      <p className="text-base font-semibold">
                        {progress.errors > 0 ? "Geracao concluida com falhas" : "Geracao concluida com sucesso"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Resumo final da etapa 3.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progress.created}</p>
                      <p className="text-xs text-muted-foreground">Criadas</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">{progress.skipped}</p>
                      <p className="text-xs text-muted-foreground">Ignoradas</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className={progress.errors > 0 ? "text-2xl font-bold text-destructive" : "text-2xl font-bold"}>{progress.errors}</p>
                      <p className="text-xs text-muted-foreground">Erros</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="outline" onClick={() => navigate("/dashboard/admin/unidades")}>
                      Ver lista de unidades
                    </Button>
                    <Button onClick={resetBatch}>Nova geracao</Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="w-full">
              {doneConfirmation()}
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
