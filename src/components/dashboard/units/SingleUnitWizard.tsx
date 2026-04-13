import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Search, UserCheck, X } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@/components/ui/primitives";
import { StepTimeline, type StepDef } from "@/components/ui/StepTimeline";
import { api, type UserListItemPayload } from "@/services/api";
import { notify } from "@/lib/notify";
import { todayIso } from "@/lib/units";
import { PROFILE_LABELS, validateMembershipRules } from "@/lib/membership-rules";

type Step = 1 | 2 | 3;
type Validation = "idle" | "exists" | "available";

const STEPS: StepDef[] = [
  {
    label: "Dados da unidade",
    description: "Informe posicao da unidade e valide disponibilidade antes de continuar.",
  },
  {
    label: "Vinculo opcional",
    description: "Decida se deseja associar usuario agora e preencha somente se ativar.",
  },
  {
    label: "Revisao e confirmacao",
    description: "Confira o resumo final e confirme a criacao.",
  },
];

export default function SingleUnitWizard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [createdCode, setCreatedCode] = useState<string>("");

  // Step 1
  const [floor, setFloor] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [debouncedFloor, setDebouncedFloor] = useState("");
  const [debouncedNumber, setDebouncedNumber] = useState("");

  // Step 2
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItemPayload | null>(null);
  const [profile, setProfile] = useState("PROPRIETARIO");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");

  const unitsQuery = useQuery({ queryKey: ["admin-units"], queryFn: api.units.list });
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => api.users.list() });
  const profilesQuery = useQuery({ queryKey: ["membership-profiles"], queryFn: api.memberships.listProfiles });

  const createUnit = useMutation({ mutationFn: api.units.create });
  const createMembership = useMutation({ mutationFn: api.memberships.create });

  useEffect(() => {
    const id = setTimeout(() => setDebouncedFloor(floor), 250);
    return () => clearTimeout(id);
  }, [floor]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedNumber(unitNumber), 250);
    return () => clearTimeout(id);
  }, [unitNumber]);

  useEffect(() => {
    if (userSearch.length < 3) {
      setDebouncedSearch("");
      return;
    }
    const id = setTimeout(() => setDebouncedSearch(userSearch), 300);
    return () => clearTimeout(id);
  }, [userSearch]);

  const unitValidation = useMemo((): Validation => {
    const f = parseInt(debouncedFloor, 10);
    const n = parseInt(debouncedNumber, 10);
    if (isNaN(f) || isNaN(n) || !debouncedFloor || !debouncedNumber) return "idle";
    const exists = (unitsQuery.data ?? []).some((u) => u.floor === f && u.unitNumber === n);
    return exists ? "exists" : "available";
  }, [debouncedFloor, debouncedNumber, unitsQuery.data]);

  const userSuggestions = useMemo(() => {
    if (debouncedSearch.length < 3) return [];
    const q = debouncedSearch.toLowerCase();
    return (usersQuery.data ?? [])
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.cpf.includes(debouncedSearch),
      )
      .slice(0, 8);
  }, [usersQuery.data, debouncedSearch]);

  const floorValue = parseInt(floor, 10);
  const numberValue = parseInt(unitNumber, 10);

  const isFloorReady = floor.trim() !== "" && !isNaN(floorValue) && floorValue >= 0;
  const isUnitReady = unitNumber.trim() !== "" && !isNaN(numberValue) && numberValue > 0;

  const resetForm = () => {
    setStep(1);
    setDone(false);
    setCreatedCode("");
    setFloor("");
    setUnitNumber("");
    setDebouncedFloor("");
    setDebouncedNumber("");
    setLinkEnabled(false);
    setUserSearch("");
    setDebouncedSearch("");
    setSelectedUser(null);
    setProfile("PROPRIETARIO");
    setStartDate(todayIso());
    setEndDate("");
  };

  const linkValidationError = useMemo(() => {
    if (!linkEnabled || !selectedUser) return null;
    return validateMembershipRules([], profile, endDate);
  }, [endDate, linkEnabled, profile, selectedUser]);

  const canAdvanceFromDataStep = isFloorReady && isUnitReady && unitValidation === "available";
  const canAdvanceFromLinkStep = !linkEnabled || (!!selectedUser && !linkValidationError);

  const doneConfirmation = () => {
    return (
      !done ? (
        <div className="flex w-full justify-between border-t pt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} disabled={isSubmitting}>
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={step === 1 ? !canAdvanceFromDataStep : !canAdvanceFromLinkStep}
            >
              Proximo
            </Button>
          ) : (
            <Button onClick={() => void handleConfirm()} disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Confirmar"}
            </Button>
          )}
        </div>
      ) : null
    );
  };

  const handleConfirm = async () => {
    if (linkEnabled && selectedUser && linkValidationError) {
      notify.error("Nao foi possivel criar o vinculo.", { description: linkValidationError });
      return;
    }

    try {
      const unit = await createUnit.mutateAsync({
        floor: parseInt(floor, 10),
        unitNumber: parseInt(unitNumber, 10),
      });
      if (linkEnabled && selectedUser) {
        await createMembership.mutateAsync({
          userId: selectedUser.id,
          unitId: unit.id,
          profile,
          startDate,
          endDate: endDate || null,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["admin-units"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-memberships"] });
      setCreatedCode(unit.code);
      setDone(true);
    } catch (error) {
      notify.error("Falha ao criar unidade.", {
        description: error instanceof Error ? error.message : "Erro.",
      });
    }
  };

  const isSubmitting = createUnit.isPending || createMembership.isPending;

  return (
    <div className="space-y-6 min-[1420px]:grid min-[1420px]:grid-cols-3 min-[1420px]:items-start min-[1420px]:gap-6 min-[1420px]:space-y-0">
      <div className="h-auto w-full rounded-xl bg-muted/60 p-4 min-[1420px]:col-span-1 min-[1420px]:h-[600px]">
        <div className="min-[1420px]:hidden">
          <StepTimeline steps={STEPS} current={step} orientation="horizontal" />
        </div>
        <div className="hidden h-full min-[1420px]:block">
          <StepTimeline steps={STEPS} current={step} orientation="vertical" />
        </div>
      </div>

      <div className="space-y-6 min-[1420px]:col-span-2">
        {step === 1 && (
          <Card className="min-h-[380px] flex flex-col">
            <CardHeader>
              <CardTitle>Etapa 1: dados da unidade</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Informe o andar e numero da unidade. O sistema verifica se a unidade ja existe para evitar duplicatas.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="space-y-1.5">
                <Label htmlFor="su-floor">1.1 Andar</Label>
                <p className="text-xs text-muted-foreground">Define a localizacao vertical da unidade no predio.</p>
                <Input
                  id="su-floor"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="su-unit">1.2 Numero da unidade</Label>
                <p className="text-xs text-muted-foreground">Numero identificador da unidade dentro do andar.</p>
                <Input
                  id="su-unit"
                  type="number"
                  min="1"
                  placeholder="1"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  disabled={!isFloorReady}
                />
                {!isFloorReady ? (
                  <p className="text-xs text-muted-foreground">Preencha primeiro o andar para liberar o proximo campo.</p>
                ) : null}
              </div>

              {unitValidation === "available" && (
                <div className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Unidade disponivel para criacao.
                </div>
              )}
              {unitValidation === "exists" && (
                <div className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Esta unidade ja existe no sistema.
                </div>
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
              <CardTitle>Etapa 2: vinculo opcional</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Decida se deseja vincular usuario agora. Se nao, a unidade sera criada sem vinculo.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium">2.1 Vincular usuario agora?</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Quando ativo, o wizard passa a pedir usuario, perfil e periodo de vigencia.
                  </p>
                </div>
                <Switch checked={linkEnabled} onCheckedChange={setLinkEnabled} />
              </div>

              {linkEnabled && (
                <div className="animate-in slide-in-from-top-2 fade-in-0 space-y-4 duration-200">
                  <div className="space-y-1.5">
                    <Label>2.2 Usuario</Label>
                    <p className="text-xs text-muted-foreground">Pesquise por nome, e-mail ou CPF para escolher o titular do vinculo.</p>
                    {selectedUser ? (
                      <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{selectedUser.name}</p>
                            <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null);
                            setUserSearch("");
                            setDebouncedSearch("");
                          }}
                          className="rounded p-0.5 transition-colors hover:bg-muted"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="pl-9"
                            placeholder="Digite ao menos 3 caracteres..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            autoComplete="off"
                          />
                        </div>
                        {debouncedSearch.length >= 3 && (
                          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-md">
                            {userSuggestions.length === 0 ? (
                              <p className="px-3 py-2.5 text-sm text-muted-foreground">Nenhum usuario encontrado.</p>
                            ) : (
                              <ul className="max-h-48 divide-y overflow-y-auto">
                                {userSuggestions.map((u) => (
                                  <li key={u.id}>
                                    <button
                                      type="button"
                                      className="w-full px-3 py-2.5 text-left transition-colors hover:bg-muted"
                                      onClick={() => {
                                        setSelectedUser(u);
                                        setUserSearch("");
                                        setDebouncedSearch("");
                                      }}
                                    >
                                      <p className="text-sm font-medium">{u.name}</p>
                                      <p className="text-xs text-muted-foreground">{u.email}</p>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>2.3 Perfil</Label>
                    <p className="text-xs text-muted-foreground">Define o tipo de relacao do usuario com a unidade.</p>
                    <Select value={profile} onValueChange={setProfile} disabled={!selectedUser}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(profilesQuery.data ?? []).length > 0
                          ? profilesQuery.data!.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                              {PROFILE_LABELS[p.code] ?? p.code}
                            </SelectItem>
                          ))
                          : Object.entries(PROFILE_LABELS).map(([code, label]) => (
                            <SelectItem key={code} value={code}>
                              {label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="su-start-date">2.4 Inicio do vinculo</Label>
                      <p className="text-xs text-muted-foreground">Data inicial em que o usuario passa a usar a unidade.</p>
                      <Input
                        id="su-start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={!selectedUser}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="su-end-date">2.5 Fim da estadia</Label>
                      <p className="text-xs text-muted-foreground">Opcional. Use quando o vinculo tiver data para terminar.</p>
                      <Input
                        id="su-end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={!selectedUser}
                      />
                    </div>
                  </div>

                  {linkValidationError ? (
                    <Alert variant="destructive">
                      <AlertDescription>{linkValidationError}</AlertDescription>
                    </Alert>
                  ) : null}
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
              <CardTitle>Etapa 3: {done ? "execucao" : "revisao"}</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {done
                  ? "Processamento concluido com sucesso."
                  : "Confira os dados abaixo. A unidade sera criada com essas informacoes e nao podera haver outra unidade com mesmo andar e numero."}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 flex-1">
              {done ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-base font-semibold">Geracao concluida com sucesso</p>
                      <p className="text-xs text-muted-foreground">Resumo final da etapa 3.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">1</p>
                      <p className="text-xs text-muted-foreground">Criadas</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">{linkEnabled && selectedUser ? 1 : 0}</p>
                      <p className="text-xs text-muted-foreground">Vinculos criados</p>
                    </div>
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">0</p>
                      <p className="text-xs text-muted-foreground">Erros</p>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Codigo da unidade criada</p>
                    <p className="mt-1 font-mono text-sm font-semibold">{createdCode}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button variant="outline" onClick={() => navigate("/dashboard/admin/unidades")}>
                      Ver lista de unidades
                    </Button>
                    <Button onClick={resetForm}>Adicionar outra</Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vinculo inicial</p>
                    {linkEnabled && selectedUser ? (
                      <div className="space-y-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-muted-foreground">Perfil</span>
                          <Badge variant="secondary">{PROFILE_LABELS[profile] ?? profile}</Badge>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Usuario selecionado</p>
                          <p className="mt-1 text-base font-semibold">{selectedUser.name}</p>
                          <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-muted-foreground">Inicio</p>
                            <p className="mt-1 font-mono text-xs font-semibold">{startDate}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Fim</p>
                            <p className="mt-1 font-mono text-xs font-semibold">{endDate || "-"}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem vinculo inicial. A unidade sera criada sem usuario vinculado.</p>
                    )}
                  </section>

                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unidade</p>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Andar</p>
                        <p className="mt-1 text-xl font-semibold">{floor}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Numero</p>
                        <p className="mt-1 text-xl font-semibold">{unitNumber}</p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
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