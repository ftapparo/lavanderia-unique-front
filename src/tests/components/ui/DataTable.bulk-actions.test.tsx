import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Eye } from "lucide-react";
import { DataTable, type DataTableBulkAction, type DataTableColumn } from "@/components/ui/DataTable";

type Row = { id: string; name: string; active: boolean };

describe("DataTable bulk actions", () => {
  it("supports disabled predicate based on selected rows", () => {
    const rows: Row[] = [{ id: "1", name: "Unidade 1", active: true }];
    const columns: DataTableColumn<Row>[] = [{ header: "Nome", cell: (row) => row.name }];
    const actions: DataTableBulkAction<Row>[] = [
      {
        label: "Ativar",
        icon: Eye,
        onClick: () => {},
        disabled: (selected) => selected.every((row) => row.active),
      },
    ];

    render(
      <DataTable
        data={rows}
        columns={columns}
        keyExtractor={(row) => row.id}
        selectable
        selectedKeys={new Set(["1"])}
        onSelectionChange={() => {}}
        bulkActions={actions}
      />,
    );

    expect(screen.getByRole("button", { name: "Ativar" })).toBeDisabled();
  });
});
