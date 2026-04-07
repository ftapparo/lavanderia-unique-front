import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/primitives";
import { DataTable, type DataTableColumn, type DataTableAction } from "@/components/ui/DataTable";
import type { UnitPayload } from "@/services/api";

type UnitsTableCardProps = {
  units: UnitPayload[];
  isUpdating: boolean;
  isRemoving: boolean;
  onToggleActive: (unit: UnitPayload) => void;
  onRemove: (unit: UnitPayload) => void;
};

const columns: DataTableColumn<UnitPayload>[] = [
  {
    header: "Codigo",
    cell: (u) => <span className="font-medium text-primary">{u.code}</span>,
  },
  {
    header: "Andar",
    className: "hidden sm:table-cell text-muted-foreground",
    cell: (u) => u.floor ?? "—",
  },
  {
    header: "Unidade",
    className: "hidden sm:table-cell text-muted-foreground",
    cell: (u) => u.unitNumber ?? "—",
  },
  {
    header: "Nome",
    className: "hidden md:table-cell text-muted-foreground",
    cell: (u) => u.name,
  },
  {
    header: "Status",
    cell: (u) => (
      <span className={u.active ? "text-green-600 dark:text-green-400 text-xs font-medium" : "text-muted-foreground text-xs"}>
        {u.active ? "Ativa" : "Oculta"}
      </span>
    ),
  },
];

export default function UnitsTableCard({
  units,
  isUpdating,
  isRemoving,
  onToggleActive,
  onRemove,
}: UnitsTableCardProps) {
  const actions: DataTableAction<UnitPayload>[] = [
    {
      label: "Ocultar",
      icon: EyeOff,
      onClick: onToggleActive,
      disabled: (u) => !u.active || isUpdating,
    },
    {
      label: "Mostrar",
      icon: Eye,
      onClick: onToggleActive,
      disabled: (u) => u.active || isUpdating,
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: onRemove,
      destructive: true,
      separator: true,
      disabled: () => isRemoving,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabela de Unidades</CardTitle>
        <CardDescription>Use ocultar para retirar da operacao sem apagar historico. Excluir remove permanentemente.</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={units}
          keyExtractor={(u) => u.id}
          columns={columns}
          actions={actions}
          emptyMessage="Nenhuma unidade cadastrada."
        />
      </CardContent>
    </Card>
  );
}
