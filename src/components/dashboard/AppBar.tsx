import { useAuth } from "@/contexts/AuthContext";
import { useActiveUnit } from "@/contexts/ActiveUnitContext";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/primitives";
import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export default function AppBar({ children }: Props) {
  const { user, logout, profile } = useAuth();
  const { activeUnit, activeUnitId, availableUnits, setActiveUnitId } = useActiveUnit();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER";
  const initials = (user || "U").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-[1] flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 lg:px-8">
      {children}
      <div className="flex flex-1 items-center justify-end gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-2 py-1 text-left hover:bg-muted/50"
              aria-label="Abrir menu do perfil"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline typo-label text-muted-foreground uppercase">{user}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[260px]">
            <DropdownMenuLabel>Perfil</DropdownMenuLabel>
            {!isAdmin ? (
              <>
                <DropdownMenuItem className="cursor-default focus:bg-transparent">
                  Unidade ativa: {activeUnit?.name || "Nao definida"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Trocar unidade</DropdownMenuLabel>
                {availableUnits.map((unit) => (
                  <DropdownMenuItem
                    key={unit.id}
                    onSelect={() => setActiveUnitId(unit.id)}
                    className="flex items-center justify-between"
                  >
                    <span>{unit.name}</span>
                    {activeUnitId === unit.id ? <span className="text-xs text-muted-foreground">Ativa</span> : null}
                  </DropdownMenuItem>
                ))}
              </>
            ) : (
              <DropdownMenuItem className="cursor-default focus:bg-transparent">
                Perfil administrador
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { void handleLogout(); }}
          className="text-primary hover:bg-primary/10 hover:text-primary active:bg-primary/15"
        >
          <LogOut className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
