import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from "@/components/ui/primitives";
import { api, type UnitPayload } from "@/services/api";
import { notify } from "@/lib/notify";

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

      <Card>
        <CardHeader>
          <CardTitle>Parametros de Geracao</CardTitle>
          <CardDescription>Informe primeiro andar, ultimo andar e quantidade de unidades por andar.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="start-floor">Primeiro andar</Label>
            <Input id="start-floor" value={startFloor} onChange={(e) => setStartFloor(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-floor">Ultimo andar</Label>
            <Input id="end-floor" value={endFloor} onChange={(e) => setEndFloor(e.target.value)} inputMode="numeric" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="units-per-floor">Unidades por andar</Label>
            <Input id="units-per-floor" value={unitsPerFloor} onChange={(e) => setUnitsPerFloor(e.target.value)} inputMode="numeric" />
          </div>
          <Button disabled={createUnit.isPending} onClick={() => void createRange()}>
            {createUnit.isPending ? "Gerando..." : "Gerar unidades"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabela de Unidades</CardTitle>
          <CardDescription>Use ocultar para retirar da operacao sem apagar historico. Excluir remove permanentemente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 border-b pb-2 typo-caption text-muted-foreground">
            <div>Codigo</div>
            <div>Andar</div>
            <div>Unidade</div>
            <div>Nome</div>
            <div>Status</div>
            <div>Acoes</div>
          </div>

          {units.map((unit: UnitPayload) => (
            <div key={unit.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-center gap-2 rounded-md border p-3">
              <p className="typo-label text-primary">{unit.code}</p>
              <p className="typo-caption">{unit.floor ?? "-"}</p>
              <p className="typo-caption">{unit.unitNumber ?? "-"}</p>
              <p className="typo-caption">{unit.name}</p>
              <p className="typo-caption">{unit.active ? "Ativa" : "Oculta"}</p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateUnit.mutate({ id: unit.id, active: !unit.active })}
                  disabled={updateUnit.isPending}
                >
                  {unit.active ? "Ocultar" : "Mostrar"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => removeUnit.mutate(unit.id)} disabled={removeUnit.isPending}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}

          {units.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhuma unidade cadastrada.</p> : null}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
