import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, MoreVertical, Plus, Search, UserCheck, X } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  api,
  type MembershipSlotPayload,
  type SaveMembershipSlotPayload,
  type UserListItemPayload,
} from "@/services/api";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";
import { todayIso } from "@/lib/units";

type SlotPosition = 1 | 2 | 3;
type MembershipProfile = "PROPRIETARIO" | "LOCATARIO" | "HOSPEDE" | "ADMINISTRADOR" | "SUPER";

type SlotDraft = {
  slotPosition: SlotPosition;
  userId: string | null;
  userName: string | null;
  userCpf: string | null;
  profile: MembershipProfile | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
};

type SelectorState = {
  open: boolean;
  slotPosition: SlotPosition;
  mode: "add" | "replace_owner";
};

const PROFILE_OPTIONS: MembershipProfile[] = ["PROPRIETARIO", "LOCATARIO", "HOSPEDE", "ADMINISTRADOR", "SUPER"];
const CONTENT_STACK_BREAKPOINT = 1280;
const RULES_AUTO_COLLAPSE_BREAKPOINT = 1420;
const RULES_LIST: string[] = [
  "Toda unidade precisa ter um titular na posição 1.",
  "O titular não pode ser removido, apenas substituído por outro.",
  "Para trocar o titular, as posições 2 e 3 precisam estar vazias.",
  "Você pode vincular um administrador na posição 2.",
  "A posição 3 não aceita administradores.",
  "Se houver um administrador na posição 2, a posição 3 só pode ser usada por locatário ou hóspede.",
  "A mesma pessoa não pode ocupar mais de uma posição na mesma unidade.",
  "Se você remover alguém da posição 2 e a posição 3 estiver ocupada, essa pessoa passa automaticamente para a posição 2.",
  "Sempre que excluir um vínculo, vamos pedir sua confirmação, o histórico será mantido.",
  "Para buscar um usuário, digite pelo menos 3 caracteres (nome, CPF ou CNPJ).",
];

const formatDocument = (value: string | null | undefined): string => {
  const d = String(value || "").replace(/\D/g, "").slice(0, 14);
  if (!d) return "-";
  if (d.length <= 11) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const slotLabel = (slotPosition: SlotPosition): string => {
  if (slotPosition === 1) return "Titular";
  if (slotPosition === 2) return "Gestão";
  return "Vínculo 3";
};

const formatDisplayDate = (value: string | null | undefined): string => {
  const iso = normalizeIsoDate(value);
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  const monthLabel = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][Number(month) - 1] ?? month;
  return `${day} ${monthLabel} ${year}`;
};

const normalizeIsoDate = (value: string | null | undefined): string | null => {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
};

const emptySlot = (slotPosition: SlotPosition): SlotDraft => ({
  slotPosition,
  userId: null,
  userName: null,
  userCpf: null,
  profile: null,
  startDate: null,
  endDate: null,
  active: true,
});

const buildSlotsState = (slots: MembershipSlotPayload[] | undefined): SlotDraft[] => {
  const mapped = new Map((slots ?? []).map((slot) => [slot.slotPosition, slot]));
  return ([1, 2, 3] as const).map((slotPosition) => {
    const current = mapped.get(slotPosition)?.current;
    if (!current) return emptySlot(slotPosition);
    return {
      slotPosition,
      userId: current.userId,
      userName: current.userName ?? null,
      userCpf: current.userCpf ?? null,
      profile: current.profile as MembershipProfile,
      startDate: normalizeIsoDate(current.startDate),
      endDate: normalizeIsoDate(current.endDate),
      active: true,
    };
  });
};

export default function AdminManageUnitLinksPage() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const unitsQuery = useQuery({ queryKey: ["admin-units"], queryFn: api.units.list });
  const slotsQuery = useQuery({
    queryKey: ["admin-unit-membership-slots", id],
    queryFn: () => api.units.getMembershipSlots(id),
    enabled: Boolean(id),
  });

  const [slots, setSlots] = useState<SlotDraft[]>(buildSlotsState(undefined));
  const [selector, setSelector] = useState<SelectorState>({ open: false, slotPosition: 1, mode: "add" });
  const [deleteTarget, setDeleteTarget] = useState<SlotPosition | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedProfile, setSelectedProfile] = useState<MembershipProfile>("PROPRIETARIO");
  const [selectedStartDate, setSelectedStartDate] = useState(todayIso());
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [isRulesCollapsed, setIsRulesCollapsed] = useState<boolean>(false);
  const [manualRulesCollapsed, setManualRulesCollapsed] = useState<boolean>(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState<boolean>(false);
  const [isDesktopRulesLayout, setIsDesktopRulesLayout] = useState<boolean>(true);

  const unit = useMemo(() => (unitsQuery.data ?? []).find((u) => u.id === id) ?? null, [unitsQuery.data, id]);

  useEffect(() => {
    if (!slotsQuery.data) return;
    setSlots(buildSlotsState(slotsQuery.data));
  }, [slotsQuery.data]);

  useEffect(() => {
    if (!selector.open) return;
    const timeoutId = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timeoutId);
  }, [search, selector.open]);

  useEffect(() => {
    if (!selector.open) return;
    setSearch("");
    setDebouncedSearch("");
    setSelectedUserId("");
    setSelectedStartDate(todayIso());
    setSelectedEndDate("");
    setSelectedProfile(selector.slotPosition === 1 ? "PROPRIETARIO" : "LOCATARIO");
  }, [selector.open, selector.slotPosition]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncRulesPanel = () => {
      const isDesktop = window.innerWidth >= CONTENT_STACK_BREAKPOINT;
      const narrow = window.innerWidth < RULES_AUTO_COLLAPSE_BREAKPOINT;
      setIsDesktopRulesLayout(isDesktop);
      setIsNarrowViewport(narrow);
      if (!isDesktop) {
        setIsRulesCollapsed(true);
        return;
      }
      if (narrow) {
        setIsRulesCollapsed(true);
      } else {
        setIsRulesCollapsed(manualRulesCollapsed);
      }
    };

    syncRulesPanel();
    window.addEventListener("resize", syncRulesPanel);
    return () => window.removeEventListener("resize", syncRulesPanel);
  }, [manualRulesCollapsed]);

  const usersQuery = useQuery({
    queryKey: ["admin-users", "slot-selector", id, selector.slotPosition, selectedProfile, debouncedSearch],
    queryFn: () => api.users.list({
      q: debouncedSearch || undefined,
      unitId: id,
      slotPosition: selector.slotPosition,
      profile: selector.slotPosition === 1 ? "PROPRIETARIO" : selectedProfile,
    }),
    enabled: selector.open && Boolean(id) && debouncedSearch.length >= 3,
  });

  const slotByPosition = (slotPosition: SlotPosition): SlotDraft =>
    slots.find((slot) => slot.slotPosition === slotPosition) ?? emptySlot(slotPosition);

  const isSlotFilled = (slotPosition: SlotPosition): boolean => Boolean(slotByPosition(slotPosition).userId);

  const canSwapOwner = !isSlotFilled(2) && !isSlotFilled(3);

  const occupiedUserIds = useMemo(() => {
    const occupied = new Set<string>();
    for (const slot of slots) {
      if (!slot.userId) continue;
      if (slot.slotPosition === selector.slotPosition) continue;
      occupied.add(slot.userId);
    }
    return occupied;
  }, [slots, selector.slotPosition]);

  const availableUsers = useMemo(() => {
    const list = usersQuery.data ?? [];
    return list.filter((user) => !occupiedUserIds.has(user.id));
  }, [usersQuery.data, occupiedUserIds]);

  const filteredUsers = useMemo(() => {
    if (debouncedSearch.length < 3) return [];
    const q = normalizeText(debouncedSearch.trim());
    const qDigits = debouncedSearch.replace(/\D/g, "");

    return availableUsers.filter((user) => {
      const name = normalizeText(user.name);
      const cpfDigits = user.cpf.replace(/\D/g, "");
      const words = name.split(/\s+/).filter(Boolean);
      const nameMatch = words.some((word) => word.startsWith(q));
      const cpfMatch = qDigits.length > 0 && cpfDigits.includes(qDigits);
      return nameMatch || cpfMatch;
    });
  }, [availableUsers, debouncedSearch]);

  const selectedUser = useMemo<UserListItemPayload | null>(() => {
    if (!selectedUserId) return null;
    return availableUsers.find((u) => u.id === selectedUserId) ?? null;
  }, [availableUsers, selectedUserId]);

  const saveMutation = useMutation({
    mutationFn: (payload: SaveMembershipSlotPayload[]) => api.units.saveMembershipSlots(id, payload),
    onSuccess: async (updatedSlots) => {
      setSlots(buildSlotsState(updatedSlots));
      setSelector((prev) => ({ ...prev, open: false }));
      setDeleteTarget(null);
      notify.success("Vínculos atualizados com sucesso.");
      await Promise.all([
        slotsQuery.refetch(),
        queryClient.invalidateQueries({ queryKey: ["admin-memberships"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-units"] }),
        queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
      ]);
    },
    onError: (error) => {
      notify.error("Falha ao salvar vínculos.", {
        description: error instanceof Error ? error.message : "Erro ao atualizar vínculos.",
      });
    },
  });

  const persistSlots = (nextSlots: SlotDraft[]) => {
    const normalized = nextSlots.map((slot) => ({
      ...slot,
      startDate: normalizeIsoDate(slot.startDate),
      endDate: normalizeIsoDate(slot.endDate),
    }));

    for (const slot of normalized) {
      if (slot.userId && !slot.startDate) {
        notify.error("Data inválida para vínculo.", {
          description: `Informe a data de início no formato YYYY-MM-DD para o slot ${slot.slotPosition}.`,
        });
        return;
      }
    }

    const payload: SaveMembershipSlotPayload[] = nextSlots.map((slot) => ({
      slotPosition: slot.slotPosition,
      userId: slot.userId,
      profile: slot.profile,
      startDate: normalizeIsoDate(slot.startDate),
      endDate: normalizeIsoDate(slot.endDate),
      active: true,
    }));

    saveMutation.mutate(payload);
  };

  const openSlotSelector = (slotPosition: SlotPosition, mode: "add" | "replace_owner" = "add") => {
    if (slotPosition === 1 && mode === "replace_owner" && !canSwapOwner) {
      notify.error("Não é possível trocar o titular.", {
        description: "Para trocar titular, os slots 2 e 3 devem estar vazios.",
      });
      return;
    }

    setSelector({ open: true, slotPosition, mode });
  };

  const handleConfirmSelection = () => {
    const targetSlot = selector.slotPosition;

    if (!selectedUser || !selectedProfile || !selectedStartDate) {
      notify.error("Preencha os dados do vínculo.", {
        description: "Selecione usuário, perfil e data de início.",
      });
      return;
    }

    if (targetSlot === 1 && selectedProfile !== "PROPRIETARIO") {
      notify.error("Perfil inválido para o slot 1.", {
        description: "A posição 1 aceita somente PROPRIETARIO.",
      });
      return;
    }

    if (targetSlot === 3 && selectedProfile === "ADMINISTRADOR") {
      notify.error("Perfil inválido para o slot 3.", {
        description: "Usuário de gestão (ADMINISTRADOR) deve ficar no slot 2.",
      });
      return;
    }

    if (targetSlot === 3 && slotByPosition(2).profile === "ADMINISTRADOR" && !["LOCATARIO", "HOSPEDE"].includes(selectedProfile)) {
      notify.error("Perfil inválido para o slot 3.", {
        description: "Com ADMINISTRADOR no slot 2, o slot 3 só aceita LOCATARIO ou HOSPEDE.",
      });
      return;
    }

    if (occupiedUserIds.has(selectedUser.id)) {
      notify.error("Usuário já vinculado na unidade.", {
        description: "O mesmo usuário não pode ocupar dois slots ativos.",
      });
      return;
    }

    const nextSlots = slots.map((slot) => {
      if (slot.slotPosition !== targetSlot) return slot;
      return {
        slotPosition: targetSlot,
        userId: selectedUser.id,
        userName: selectedUser.name,
        userCpf: selectedUser.cpf,
        profile: targetSlot === 1 ? "PROPRIETARIO" : selectedProfile,
        startDate: selectedStartDate,
        endDate: selectedEndDate || null,
        active: true,
      } satisfies SlotDraft;
    });

    persistSlots(nextSlots);
  };

  const requestDelete = (slotPosition: SlotPosition) => {
    if (slotPosition === 1) return;
    setDeleteTarget(slotPosition);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    let nextSlots: SlotDraft[];
    if (deleteTarget === 2 && isSlotFilled(3)) {
      const slot3 = slotByPosition(3);
      nextSlots = slots.map((slot) => {
        if (slot.slotPosition === 2) {
          return {
            ...slot3,
            slotPosition: 2,
          };
        }
        if (slot.slotPosition === 3) {
          return emptySlot(3);
        }
        return slot;
      });
      notify.success("Vínculo do slot 3 movido para o slot 2.");
    } else {
      nextSlots = slots.map((slot) => (slot.slotPosition === deleteTarget ? emptySlot(deleteTarget) : slot));
    }

    persistSlots(nextSlots);
  };

  const handleToggleRulesPanel = () => {
    const next = !isRulesCollapsed;
    setIsRulesCollapsed(next);
    if (!isNarrowViewport) {
      setManualRulesCollapsed(next);
    }
  };

  const profileOptionsForSlot = (slotPosition: SlotPosition): MembershipProfile[] => {
    if (slotPosition === 1) return ["PROPRIETARIO"];
    if (slotPosition === 3) {
      const slot2 = slotByPosition(2);
      if (slot2.profile === "ADMINISTRADOR") {
        return ["LOCATARIO", "HOSPEDE"];
      }
      return PROFILE_OPTIONS.filter((profile) => profile !== "ADMINISTRADOR");
    }
    return PROFILE_OPTIONS;
  };

  const selectorProfileOptions = profileOptionsForSlot(selector.slotPosition);
  const showSearchDropdown = selector.open && !selectedUser && debouncedSearch.length >= 3;

  useEffect(() => {
    if (!selector.open) return;
    if (!selectorProfileOptions.includes(selectedProfile)) {
      setSelectedProfile(selectorProfileOptions[0]);
    }
  }, [selector.open, selectorProfileOptions, selectedProfile]);

  return (
    <PageContainer>
      <PageHeader
        title={`Gestão de Vínculos${unit ? ` — Unidade ${unit.code}` : ""}`}
        description="A unidade possui 3 slots fixos de vínculo. O slot 1 é sempre o titular proprietário."
        actions={(
          <div
            className={cn(
              "transition-[margin-right] duration-200",
              isDesktopRulesLayout ? (isRulesCollapsed ? "mr-16" : "mr-[27rem]") : "mr-0",
            )}
          >
            <Button variant="outline" onClick={() => navigate("/dashboard/admin/unidades")}>Voltar</Button>
          </div>
        )}
      />

      <div
        className={cn(
          "min-w-0 transition-[padding-right] duration-200",
          isDesktopRulesLayout ? (isRulesCollapsed ? "pr-16" : "pr-[27rem]") : "pr-0",
        )}
      >
        <div className="grid gap-4 grid-cols-1 [@media(min-width:1280px)]:grid-cols-2 [@media(min-width:1840px)]:grid-cols-3">
          {(slots.length ? slots : buildSlotsState(undefined)).map((slot) => {
            const slotHistory = slotsQuery.data?.find((s) => s.slotPosition === slot.slotPosition)?.history ?? [];
            const filled = Boolean(slot.userId);
            const canDelete = slot.slotPosition !== 1;

            if (!filled) {
              return (
                <button
                  key={slot.slotPosition}
                  type="button"
                  className="group flex min-h-[280px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:translate-y-0 active:scale-[0.995] active:border-primary/70 active:bg-muted/80"
                  onClick={() => openSlotSelector(slot.slotPosition, "add")}
                >
                  <Plus className="mb-2 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  <p className="text-sm font-medium transition-colors group-hover:text-foreground">{slotLabel(slot.slotPosition)} vazio</p>
                  <p className="text-xs text-muted-foreground transition-colors group-hover:text-foreground/80">Clique para pesquisar por nome ou CPF/CNPJ</p>
                </button>
              );
            }

            return (
              <div
                key={slot.slotPosition}
                className="w-full rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{slotLabel(slot.slotPosition)}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Slot {slot.slotPosition} • Histórico {slotHistory.length}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        aria-label="Ações do slot"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="12" cy="5" r="1.8" />
                          <circle cx="12" cy="12" r="1.8" />
                          <circle cx="12" cy="19" r="1.8" />
                        </svg>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {slot.slotPosition === 1 ? (
                        <DropdownMenuItem onClick={() => openSlotSelector(1, "replace_owner")}>Trocar titular</DropdownMenuItem>
                      ) : null}
                      {canDelete ? (
                        <DropdownMenuItem
                          onClick={() => requestDelete(slot.slotPosition)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          Excluir vínculo
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-foreground">{slot.userName || "-"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      CPF/CNPJ{" "}
                      <span className="font-medium text-foreground/80">{formatDocument(slot.userCpf)}</span>
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold tracking-wide text-foreground/80">
                    {slot.profile || "-"}
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Início
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatDisplayDate(slot.startDate)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Fim
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatDisplayDate(slot.endDate)}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      ID Usuário
                    </p>
                    <p className="mt-1 break-all font-mono text-xs text-foreground/80">{slot.userId}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isDesktopRulesLayout ? (
          <section className="mt-6 border-t border-border pt-4">
            <h2 className="text-sm font-semibold text-foreground">Regras de Vínculo</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              {RULES_LIST.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      {isDesktopRulesLayout ? (
        <aside
          className={cn(
            "fixed right-0 top-[calc(3.5rem+1.5rem)] z-20 h-[calc(100vh-3.5rem-1.5rem)] border-l border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-all duration-200",
            isRulesCollapsed ? "w-14" : "w-[24rem]",
          )}
        >
          <div className="flex h-full flex-col px-3 py-4">
            <div className="mb-3 flex items-center justify-between">
              {!isRulesCollapsed ? <h2 className="text-sm font-semibold text-foreground">Regras de Vínculo</h2> : <span />}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleToggleRulesPanel}
                aria-label={isRulesCollapsed ? "Expandir regras" : "Recolher regras"}
                title={isNarrowViewport ? "Recolhido automaticamente abaixo de 1420px" : undefined}
              >
                {isRulesCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            {!isRulesCollapsed ? (
              <ol className="list-decimal space-y-2 overflow-auto pl-5 text-sm text-muted-foreground">
                {RULES_LIST.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ol>
            ) : (
              <div className="mt-2 flex-1 text-center text-[10px] uppercase tracking-wide text-muted-foreground [writing-mode:vertical-rl] [text-orientation:mixed]">
                Regras
              </div>
            )}
          </div>
        </aside>
      ) : null}

      <Dialog open={selector.open} onOpenChange={(open) => setSelector((prev) => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{selector.mode === "replace_owner" ? "Trocar titular" : "Adicionar vínculo"}</DialogTitle>
            <DialogDescription>
              Slot {selector.slotPosition}: pesquise por nome ou CPF/CNPJ e selecione o tipo de vínculo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Pesquisar usuário</Label>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedUser.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDocument(selectedUser.cpf)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Limpar usuário selecionado"
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      setSelectedUserId("");
                      setSearch("");
                      setDebouncedSearch("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Digite nome, CPF ou CNPJ"
                    className="pl-9"
                  />
                  {showSearchDropdown ? (
                    <div className="absolute z-20 mt-1 max-h-[220px] w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                      {usersQuery.isLoading ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Buscando usuários...</p>
                      ) : filteredUsers.length === 0 ? (
                        <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                      ) : (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setSearch(user.name);
                              setDebouncedSearch("");
                            }}
                            className={`w-full border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 ${selectedUserId === user.id ? "bg-muted" : "hover:bg-muted/60"
                              }`}
                          >
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDocument(user.cpf)}</p>
                          </button>
                        ))
                      )}
                    </div>
                  ) : null}
                </div>
              )}
              <div className="min-h-5">
                {search.trim().length > 0 && search.trim().length < 3 && !selectedUser ? (
                  <p className="text-xs text-muted-foreground">Digite ao menos 3 caracteres para buscar.</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Tipo de vínculo</Label>
              <Select
                value={selectedProfile}
                onValueChange={(value) => setSelectedProfile(value as MembershipProfile)}
                disabled={selector.slotPosition === 1}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  {selectorProfileOptions.map((profile) => (
                    <SelectItem key={profile} value={profile}>{profile}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Data de início</Label>
                <Input type="date" value={selectedStartDate} onChange={(event) => setSelectedStartDate(event.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Data de fim</Label>
                <Input type="date" value={selectedEndDate} onChange={(event) => setSelectedEndDate(event.target.value)} />
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelector((prev) => ({ ...prev, open: false }))}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSelection} disabled={saveMutation.isPending || !selectedUser || !selectedStartDate}>
              {saveMutation.isPending ? "Salvando..." : selector.mode === "replace_owner" ? "Trocar titular" : "Vincular usuário"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o vínculo deste slot? O histórico será preservado e o vínculo ativo será encerrado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full sm:justify-between">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir vínculo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
