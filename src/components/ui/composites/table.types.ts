import type { ReactNode } from "react";

export type TableColumn<Row extends Record<string, ReactNode>> = {
  key: keyof Row;
  label: string;
  align?: "left" | "right" | "center";
};

export type TableDataset<Row extends Record<string, ReactNode>> = {
  columns: TableColumn<Row>[];
  rows: Row[];
  caption?: string;
};
