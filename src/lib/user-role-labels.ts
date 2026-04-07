export const USER_ROLE_LABELS: Record<"USER" | "ADMIN" | "SUPER", string> = {
  USER: "Usuário",
  ADMIN: "Gestão",
  SUPER: "Administração",
};

export const getUserRoleLabel = (role: string): string =>
  USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] ?? role;
