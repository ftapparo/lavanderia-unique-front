import { useEffect, useMemo, useState } from "react";
import { X, Search, UserCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";
import { type MembershipPayload, type UnitPayload, type UserListItemPayload, type MembershipProfilePayload } from "@/services/api";
import { todayIso } from "@/lib/units";
import { PROFILE_LABELS, validateMembershipRules } from "@/lib/membership-rules";

type LinkUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitPayload | null;
  activeMemberships: MembershipPayload[];
  users: UserListItemPayload[];
  profiles: MembershipProfilePayload[];
  isSubmitting: boolean;
  onSubmit: (data: { userId: string; profile: string; startDate: string; endDate?: string | null }) => void;
};

export default function LinkUserDialog({
  open,
  onOpenChange,
  unit,
  activeMemberships,
  users,
  profiles,
  isSubmitting,
  onSubmit,
}: LinkUserDialogProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserListItemPayload | null>(null);
  const [profile, setProfile] = useState("PROPRIETARIO");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState("");

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setSelectedUser(null);
      setProfile("PROPRIETARIO");
      setStartDate(todayIso());
      setEndDate("");
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    if (search.length < 3) {
      setDebouncedSearch("");
      return;
    }
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const suggestions = useMemo(() => {
    if (debouncedSearch.length < 3) return [];
    const q = debouncedSearch.toLowerCase();
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.cpf.includes(debouncedSearch),
      )
      .slice(0, 8);
  }, [users, debouncedSearch]);

  const validationError = useMemo(
    () => validateMembershipRules(activeMemberships, profile, endDate),
    [activeMemberships, profile, endDate],
  );

  const canSubmit = Boolean(selectedUser && startDate && !isSubmitting && !validationError);

  const handleSubmit = () => {
    if (!selectedUser) return;
    onSubmit({ userId: selectedUser.id, profile, startDate, endDate: endDate || null });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Vincular usuário{unit ? ` — ${unit.code}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* User search */}
          <div className="space-y-1.5">
            <Label>Usuário</Label>

            {selectedUser ? (
              <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUser(null); setSearch(""); setDebouncedSearch(""); }}
                  className="rounded p-0.5 hover:bg-muted transition-colors"
                  aria-label="Remover seleção"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    placeholder="Digite ao menos 3 caracteres..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                {debouncedSearch.length >= 3 && (
                  <div className="absolute z-10 w-full mt-1 rounded-md border bg-popover shadow-md overflow-hidden">
                    {suggestions.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                    ) : (
                      <ul className="max-h-48 overflow-y-auto divide-y">
                        {suggestions.map((u) => (
                          <li key={u.id}>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                              onClick={() => { setSelectedUser(u); setSearch(""); setDebouncedSearch(""); }}
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

          {/* Profile */}
          <div className="space-y-1.5">
            <Label>Perfil</Label>
            <Select value={profile} onValueChange={setProfile}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {profiles.length > 0
                  ? profiles.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {PROFILE_LABELS[p.code] ?? p.code}
                      </SelectItem>
                    ))
                  : Object.entries(PROFILE_LABELS).map(([code, label]) => (
                      <SelectItem key={code} value={code}>{label}</SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start date */}
          <div className="space-y-1.5">
            <Label htmlFor="link-start-date">Data de início</Label>
            <Input
              id="link-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link-end-date">Data de fim da estadia</Label>
            <Input
              id="link-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {validationError ? (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? "Vinculando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
