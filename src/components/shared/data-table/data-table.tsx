import * as React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  title: string;
  className?: string;
  sortable?: boolean;
  hideable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  visibleColumns?: string[];
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data: rawData,
  emptyMessage = "Không có dữ liệu",
  onRowClick,
  className,
  sortConfig,
  onSort,
  visibleColumns,
}: DataTableProps<T>) {
  // Ensure data is always an array
  const data = Array.isArray(rawData) ? rawData : [];
  // Filter columns based on visibility
  const displayColumns = visibleColumns
    ? columns.filter((col) => visibleColumns.includes(col.key))
    : columns;

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {displayColumns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.sortable && onSort ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => onSort(column.key)}
                  >
                    {column.title}
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  column.title
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={displayColumns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={index}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? "cursor-pointer" : ""}
              >
                {displayColumns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render ? column.render(item, index) : item[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
