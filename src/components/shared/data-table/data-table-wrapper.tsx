import * as React from "react";
import { Card } from "@/components/ui/card";
import { DataTable, type Column, DataTablePagination, DataTableToolbar } from "@/components/shared/data-table";
import { Spinner } from "@/components/ui/spinner";
import type { PaginatedApiResponse } from "@/types";


interface DataTableWrapperProps<T> {
  data: PaginatedApiResponse<T>;
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  sortConfig?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string) => void;
  visibleColumns: string[];
  onToggleColumn: (columnKey: string) => void;
  isLoading?: boolean;
  toolbarContent?: React.ReactNode;
  showToolbar?: boolean;
}

export function DataTableWrapper<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  emptyMessage = "Không có dữ liệu",
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  sortConfig,
  onSort,
  visibleColumns,
  onToggleColumn,
  isLoading = false,
  toolbarContent,
  showToolbar = true,
}: DataTableWrapperProps<T>) {
  return (
    <Card
      className="py-2"
    >
      <div className="relative">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-lg">
            <Spinner />
          </div>
        )}

        {/* Toolbar */}
        {showToolbar && (
          <DataTableToolbar
            columns={columns}
            visibleColumns={visibleColumns}
            onToggleColumn={onToggleColumn}
          >
            {toolbarContent}
          </DataTableToolbar>
        )}

        {/* Table */}
        <div>
          <DataTable
            columns={columns}
            data={data.data}
            emptyMessage={emptyMessage}
            onRowClick={onRowClick}
            sortConfig={sortConfig}
            onSort={onSort}
            visibleColumns={visibleColumns}
          />
        </div>

        {/* Pagination */}
        {data.meta.totalPages > 0 && (
          <div className="p-4 border-t">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={data.meta.totalPages}
              totalItems={data.meta.totalElements}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
