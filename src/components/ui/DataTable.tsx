import { useState, useMemo } from "react";
import { MoreVertical, ArrowUp, ArrowDown, ArrowUpDown, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives";

export type DataTableColumn<T> = {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  sortKey?: keyof T;
};

export type DataTableAction<T> = {
  label: string;
  icon: React.ElementType;
  onClick: (row: T) => void;
  destructive?: boolean;
  separator?: boolean;
  disabled?: (row: T) => boolean;
  loadingLabel?: string;
  isLoading?: (row: T) => boolean;
};

export type DataTableBulkAction<T> = {
  label: string;
  icon: React.ElementType;
  onClick: (rows: T[]) => void;
  destructive?: boolean;
  disabled?: (rows: T[]) => boolean;
};

type SortDirection = "asc" | "desc";

type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  defaultSortKey?: keyof T;
  defaultSortDirection?: SortDirection;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  bulkActions?: DataTableBulkAction<T>[];
};

const PAGE_SIZES = [25, 50, 100];

export function DataTable<T>({
  data,
  columns,
  actions,
  keyExtractor,
  isLoading,
  emptyMessage = "Nenhum registro encontrado.",
  defaultSortKey,
  defaultSortDirection = "asc",
  selectable,
  selectedKeys,
  onSelectionChange,
  bulkActions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSortKey);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSortDirection);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: keyof T | undefined) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handlePageSize = (value: string) => {
    setPageSize(Number(value));
    setPage(1);
  };

  const hasActions = actions && actions.length > 0;
  const hasSelection = selectable && selectedKeys !== undefined && onSelectionChange !== undefined;

  // Checkbox "select all" state for current page
  const pageKeys = paginated.map(keyExtractor);
  const selectedOnPage = pageKeys.filter((k) => selectedKeys?.has(k)).length;
  const allOnPageSelected = pageKeys.length > 0 && selectedOnPage === pageKeys.length;
  const someOnPageSelected = selectedOnPage > 0 && !allOnPageSelected;

  const handleSelectAll = () => {
    if (!onSelectionChange || !selectedKeys) return;
    if (allOnPageSelected) {
      const next = new Set(selectedKeys);
      for (const k of pageKeys) next.delete(k);
      onSelectionChange(next);
    } else {
      const next = new Set(selectedKeys);
      for (const k of pageKeys) next.add(k);
      onSelectionChange(next);
    }
  };

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const showBulkBar = hasSelection && (selectedKeys?.size ?? 0) > 0 && bulkActions && bulkActions.length > 0;
  const selectedRows = hasSelection
    ? data.filter((row) => selectedKeys?.has(keyExtractor(row)))
    : [];

  if (isLoading) {
    return <p className="typo-caption text-muted-foreground">Carregando...</p>;
  }

  if (data.length === 0) {
    return <p className="typo-caption text-muted-foreground">{emptyMessage}</p>;
  }

  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, sorted.length);

  return (
    <div className="space-y-3">
      {showBulkBar && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectionChange!(new Set())}
              className="rounded p-0.5 hover:bg-muted transition-colors"
              aria-label="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="font-medium">{selectedKeys!.size} selecionada(s)</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {bulkActions!.map((action) => (
              <Button
                key={action.label}
                size="sm"
                variant={action.destructive ? "destructive" : "outline"}
                onClick={() => action.onClick(selectedRows)}
                disabled={action.disabled?.(selectedRows)}
              >
                <action.icon className="mr-1.5 h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background dark:bg-muted/50 text-muted-foreground border-b">
            <tr>
              {hasSelection && (
                <th className="w-10 px-3 py-3">
                  <Checkbox
                    checked={allOnPageSelected}
                    ref={(el) => {
                      if (el) (el as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someOnPageSelected;
                    }}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = col.sortKey && sortKey === col.sortKey;
                const sortable = Boolean(col.sortKey);
                return (
                  <th
                    key={col.header}
                    className={`text-left px-4 py-3 font-medium ${col.className ?? ""} ${sortable ? "cursor-pointer select-none hover:text-foreground" : ""}`}
                    onClick={() => handleSort(col.sortKey)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {sortable && (
                        <span className="text-muted-foreground/60">
                          {isSorted
                            ? sortDir === "asc"
                              ? <ArrowUp className="h-3.5 w-3.5" />
                              : <ArrowDown className="h-3.5 w-3.5" />
                            : <ArrowUpDown className="h-3.5 w-3.5" />}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              {hasActions && <th className="w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginated.map((row) => {
              const key = keyExtractor(row);
              const isSelected = selectedKeys?.has(key) ?? false;
              return (
                <tr
                  key={key}
                  className={`group bg-card dark:bg-background hover:bg-muted/20 transition-colors ${isSelected ? "bg-muted/30 dark:bg-muted/10" : ""}`}
                >
                  {hasSelection && (
                    <td className="w-10 px-3 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(key)}
                        aria-label="Selecionar linha"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.header} className={`px-4 py-3 ${col.className ?? ""}`}>
                      {col.cell(row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="px-2 py-3 w-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 hover:bg-muted transition-opacity">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions!.map((action, i) => (
                            <span key={i}>
                              {action.separator && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => action.onClick(row)}
                                disabled={action.disabled?.(row) || action.isLoading?.(row)}
                                className={action.destructive ? "text-destructive focus:text-destructive" : ""}
                              >
                                <action.icon className="mr-2 h-4 w-4" />
                                {action.isLoading?.(row) && action.loadingLabel
                                  ? action.loadingLabel
                                  : action.label}
                              </DropdownMenuItem>
                            </span>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Linhas por pagina</span>
          <Select value={String(pageSize)} onValueChange={handlePageSize}>
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs">
            {start}–{end} de {sorted.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(1)}
            disabled={safePage === 1}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Primeira pagina"
          >
            <ChevronFirst className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Pagina anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 text-xs font-medium">
            Pagina {safePage} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Proxima pagina"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={safePage === totalPages}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Ultima pagina"
          >
            <ChevronLast className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-export Badge for convenience (used by consumers)
export { Badge };
