import type { ReactNode } from "react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { TableDataset } from "@/components/ui/composites/table.types";

export type TablePagePanelProps<Row extends Record<string, ReactNode>> = {
  title: string;
  description: string;
  updatedAt?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  dataset: TableDataset<Row>;
};

export function TablePagePanel<Row extends Record<string, ReactNode>>({
  title,
  description,
  updatedAt,
  actionLabel,
  onActionClick,
  dataset,
}: TablePagePanelProps<Row>) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="typo-section-title">{title}</h2>
        <p className="typo-section-subtitle">{description}</p>
      </div>

      {(updatedAt || actionLabel) && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
          <p className="text-sm text-muted-foreground">{updatedAt || ""}</p>
          {actionLabel ? (
            <Button variant="outline" onClick={onActionClick}>
              {actionLabel}
            </Button>
          ) : null}
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          {dataset.caption ? <TableCaption>{dataset.caption}</TableCaption> : null}
          <TableHeader>
            <TableRow>
              {dataset.columns.map((column) => (
                <TableHead
                  key={String(column.key)}
                  className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataset.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {dataset.columns.map((column) => (
                  <TableCell
                    key={`${rowIndex}-${String(column.key)}`}
                    className={column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}
                  >
                    {row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
