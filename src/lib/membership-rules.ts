import { todayIso } from "@/lib/units";

export const PROFILE_LABELS: Record<string, string> = {
  PROPRIETARIO: "Proprietário",
  LOCATARIO: "Locatário",
  HOSPEDE: "Hóspede",
  ADMINISTRADOR: "Administrador",
  SUPER: "Super Admin",
};

const PROFILE_PRIORITY: Record<string, number> = {
  PROPRIETARIO: 1,
  ADMINISTRADOR: 2,
  LOCATARIO: 3,
  HOSPEDE: 4,
  SUPER: 5,
};

export type MembershipRuleInput = {
  userId: string;
  profile: string;
  startDate: string;
  endDate: string | null;
  active: boolean;
};

const normalizeProfile = (profile: string): string => profile.trim().toUpperCase();

export const isMembershipActiveNow = (membership: Pick<MembershipRuleInput, "active" | "startDate" | "endDate">): boolean => {
  if (!membership.active) return false;
  const today = todayIso();
  if (membership.startDate && membership.startDate > today) return false;
  if (membership.endDate && membership.endDate < today) return false;
  return true;
};

export const sortMembershipsForColumns = <T extends MembershipRuleInput>(memberships: T[]): T[] => {
  return [...memberships].sort((a, b) => {
    const pa = PROFILE_PRIORITY[normalizeProfile(a.profile)] ?? 999;
    const pb = PROFILE_PRIORITY[normalizeProfile(b.profile)] ?? 999;
    if (pa !== pb) return pa - pb;
    return a.startDate.localeCompare(b.startDate);
  });
};

export const validateMembershipRules = (
  existingActiveMemberships: MembershipRuleInput[],
  nextProfileRaw: string,
  nextEndDateRaw: string | null,
): string | null => {
  const nextProfile = normalizeProfile(nextProfileRaw);
  const nextEndDate = nextEndDateRaw?.trim() || null;

  if (existingActiveMemberships.length >= 3) {
    return "A unidade já possui o máximo de 3 vínculos ativos.";
  }

  const hasOwner = existingActiveMemberships.some((m) => normalizeProfile(m.profile) === "PROPRIETARIO");
  const hasLocatario = existingActiveMemberships.some((m) => normalizeProfile(m.profile) === "LOCATARIO");

  if (nextProfile === "LOCATARIO" || nextProfile === "ADMINISTRADOR" || nextProfile === "HOSPEDE") {
    if (!hasOwner) {
      return "Para este perfil, a unidade precisa ter ao menos 1 proprietário ativo.";
    }
  }

  if (nextProfile === "HOSPEDE" && hasLocatario) {
    return "Não é permitido vincular hóspede quando há locatário ativo na unidade.";
  }

  if (nextProfile === "HOSPEDE" && !nextEndDate) {
    return "Hóspede exige data de fim da estadia.";
  }

  return null;
};
