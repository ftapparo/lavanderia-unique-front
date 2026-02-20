import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertVariantSwitcher } from "@/components/ui/composites/alert-variant-switcher";
import { StatusBadgeGroup } from "@/components/ui/composites/status-badge-group";
import { TableCardSection } from "@/components/ui/composites/table-card-section";
import { TablePagePanel } from "@/components/ui/composites/table-page-panel";

const dataset = {
  columns: [
    { key: "name" as const, label: "Nome" },
    { key: "status" as const, label: "Status" },
  ],
  rows: [
    { name: "API", status: "Online" },
    { name: "Worker", status: "Online" },
  ],
  caption: "Tabela de teste",
};

describe("composites: status/alert/table", () => {
  it("renders status badges and alert variant switcher", () => {
    const onChange = vi.fn();
    render(
      <>
        <StatusBadgeGroup items={[{ label: "Info", variant: "info" }, { label: "Sucesso", variant: "success" }]} />
        <AlertVariantSwitcher value="info" onChange={onChange} />
      </>,
    );

    expect(screen.getAllByText("Info").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Sucesso" }));
    expect(onChange).toHaveBeenCalledWith("success");
  });

  it("renders table composites and action", () => {
    const action = vi.fn();
    render(
      <>
        <TableCardSection title="Tabela em card" description="desc" dataset={dataset} />
        <TablePagePanel title="Tabela em pagina" description="desc" dataset={dataset} actionLabel="Atualizar" onActionClick={action} />
      </>,
    );

    expect(screen.getAllByText("API").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Atualizar" }));
    expect(action).toHaveBeenCalledTimes(1);
  });
});
