import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";
import type { UnitPayload } from "@/services/api";

type UnitsTableCardProps = {
  units: UnitPayload[];
  isUpdating: boolean;
  isRemoving: boolean;
  onToggleActive: (unit: UnitPayload) => void;
  onRemove: (unit: UnitPayload) => void;
};

export default function UnitsTableCard({
  units,
  isUpdating,
  isRemoving,
  onToggleActive,
  onRemove,
}: UnitsTableCardProps) {
  return (
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

        {units.map((unit) => (
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
                onClick={() => onToggleActive(unit)}
                disabled={isUpdating}
              >
                {unit.active ? "Ocultar" : "Mostrar"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemove(unit)}
                disabled={isRemoving}
              >
                Excluir
              </Button>
            </div>
          </div>
        ))}

        {units.length === 0 ? <p className="typo-caption text-muted-foreground">Nenhuma unidade cadastrada.</p> : null}
      </CardContent>
    </Card>
  );
}
