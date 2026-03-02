import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { api, type UnitPayload } from "@/services/api";
import { notify } from "@/lib/notify";
import UnitsGenerationCard from "@/components/dashboard/units/UnitsGenerationCard";
import UnitsTableCard from "@/components/dashboard/units/UnitsTableCard";

const toNumber = (value: string): number => Number.parseInt(value, 10);

const generateUnitPositions = (start: number, end: number, unitsPerFloor: number): Array<{ floor: number; unitNumber: number }> => {
  const positions: Array<{ floor: number; unitNumber: number }> = [];
  const step = Math.max(unitsPerFloor, 1);

  for (let floor = start; floor <= end; floor += 1) {
    for (let index = 1; index <= step; index += 1) {
      positions.push({ floor, unitNumber: index });
    }
  }

  return positions;
};

export default function AdminUnitsPage() {
  const queryClient = useQueryClient();
  const [startFloor, setStartFloor] = useState("0");
  const [endFloor, setEndFloor] = useState("10");
  const [unitsPerFloor, setUnitsPerFloor] = useState("4");

  const unitsQuery = useQuery({
    queryKey: ["admin-units"],
    queryFn: api.units.list,
  });

  const units = useMemo(() => unitsQuery.data || [], [unitsQuery.data]);

  const reload = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-units"] });
  };

  const createUnit = useMutation({
    mutationFn: (input: { floor: number; unitNumber: number }) => api.units.create(input),
  });

  const updateUnit = useMutation({
    mutationFn: (params: { id: string; active: boolean }) => api.units.update(params.id, { active: params.active }),
    onSuccess: async () => {
      await reload();
    },
    onError: (error) => notify.error("Falha ao atualizar unidade.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const removeUnit = useMutation({
    mutationFn: (id: string) => api.units.remove(id),
    onSuccess: async () => {
      notify.success("Unidade excluida.");
      await reload();
    },
    onError: (error) => notify.error("Falha ao excluir unidade.", { description: error instanceof Error ? error.message : "Erro." }),
  });

  const createRange = async () => {
    const start = toNumber(startFloor);
    const end = toNumber(endFloor);
    const perFloor = toNumber(unitsPerFloor);

    if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(perFloor)) {
      notify.error("Preencha os campos com numeros inteiros.");
      return;
    }

    if (start < 0 || end < 0) {
      notify.error("Primeiro e ultimo andar nao podem ser negativos.");
      return;
    }

    if (perFloor <= 0) {
      notify.error("Unidades por andar deve ser maior que zero.");
      return;
    }

    if (start > end) {
      notify.error("O primeiro andar nao pode ser maior que o ultimo andar.");
      return;
    }

    const existingPositions = new Set(
      units
        .filter((unit) => unit.floor !== null && unit.unitNumber !== null)
        .map((unit) => `${unit.floor}-${unit.unitNumber}`),
    );
    const positions = generateUnitPositions(start, end, perFloor).filter(
      (position) => !existingPositions.has(`${position.floor}-${position.unitNumber}`),
    );

    if (positions.length === 0) {
      notify.error("Nenhuma unidade nova para criar nessa faixa.");
      return;
    }

    let created = 0;
    for (const position of positions) {
      try {
        await createUnit.mutateAsync(position);
        created += 1;
      } catch {
        // Continua a criacao das demais unidades.
      }
    }

    await reload();
    if (created > 0) {
      notify.success(`${created} unidade(s) criada(s).`);
    } else {
      notify.error("Nenhuma unidade foi criada.");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Configuracao de Unidades"
        description="Defina intervalo de andares e unidades por andar para gerar codigos automaticamente."
      />

      <UnitsGenerationCard
        startFloor={startFloor}
        endFloor={endFloor}
        unitsPerFloor={unitsPerFloor}
        isSubmitting={createUnit.isPending}
        onStartFloorChange={setStartFloor}
        onEndFloorChange={setEndFloor}
        onUnitsPerFloorChange={setUnitsPerFloor}
        onGenerate={() => void createRange()}
      />

      <UnitsTableCard
        units={units}
        isUpdating={updateUnit.isPending}
        isRemoving={removeUnit.isPending}
        onToggleActive={(unit) => updateUnit.mutate({ id: unit.id, active: !unit.active })}
        onRemove={(unit) => removeUnit.mutate(unit.id)}
      />
    </PageContainer>
  );
}
