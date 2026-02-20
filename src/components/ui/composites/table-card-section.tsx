import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { TableDataset } from "@/components/ui/composites/table.types";

export type TableCardSectionProps<Row extends Record<string, ReactNode>> = {
  title: string;
  description: string;
  dataset: TableDataset<Row>;
};

export function TableCardSection<Row extends Record<string, ReactNode>>({
  title,
  description,
  dataset,
}: TableCardSectionProps<Row>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
