import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type UnitPayload } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

type ActiveUnitContextType = {
  activeUnitId: string | null;
  activeUnit: UnitPayload | null;
  availableUnits: UnitPayload[];
  setActiveUnitId: (unitId: string) => void;
};

const STORAGE_KEY = "active_unit_id";
const ActiveUnitContext = createContext<ActiveUnitContextType | null>(null);

const todayIso = (): string => new Date().toISOString().slice(0, 10);

export function ActiveUnitProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, profile } = useAuth();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER";
  const [activeUnitId, setActiveUnitIdState] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));

  const membershipsQuery = useQuery({
    queryKey: ["unit-memberships"],
    queryFn: api.memberships.list,
    enabled: isAuthenticated && !isAdmin,
  });

  const unitsQuery = useQuery({
    queryKey: ["units"],
    queryFn: api.units.list,
    enabled: isAuthenticated && !isAdmin,
  });

  const availableUnits = useMemo(() => {
    if (isAdmin) return [];
    const units = unitsQuery.data || [];
    const memberships = membershipsQuery.data || [];
    const today = todayIso();
    const unitIds = new Set(
      memberships
        .filter((membership) =>
          membership.active
          && membership.startDate <= today
          && (!membership.endDate || membership.endDate >= today))
        .map((membership) => membership.unitId),
    );
    return units.filter((unit) => unit.active && unitIds.has(unit.id));
  }, [isAdmin, membershipsQuery.data, unitsQuery.data]);

  useEffect(() => {
    if (isAdmin) {
      setActiveUnitIdState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    if (availableUnits.length === 0) {
      setActiveUnitIdState(null);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const currentExists = activeUnitId && availableUnits.some((unit) => unit.id === activeUnitId);
    if (!currentExists) {
      const fallbackId = availableUnits[0].id;
      setActiveUnitIdState(fallbackId);
      localStorage.setItem(STORAGE_KEY, fallbackId);
    }
  }, [activeUnitId, availableUnits, isAdmin]);

  const setActiveUnitId = (unitId: string) => {
    setActiveUnitIdState(unitId);
    localStorage.setItem(STORAGE_KEY, unitId);
  };

  const activeUnit = useMemo(
    () => availableUnits.find((unit) => unit.id === activeUnitId) || null,
    [availableUnits, activeUnitId],
  );

  return (
    <ActiveUnitContext.Provider value={{ activeUnitId, activeUnit, availableUnits, setActiveUnitId }}>
      {children}
    </ActiveUnitContext.Provider>
  );
}

export function useActiveUnit() {
  const ctx = useContext(ActiveUnitContext);
  if (!ctx) throw new Error("useActiveUnit must be used within ActiveUnitProvider");
  return ctx;
}
