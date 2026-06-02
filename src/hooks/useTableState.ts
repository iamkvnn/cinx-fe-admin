import * as React from "react"
import type { PaginatedApiResponse } from "@/types/api"
import type { Column } from "@/components/shared/data-table"

interface UseTableStateOptions {
  defaultPageSize?: number
}

/**
 * Hook đơn giản quản lý state chung của bảng dữ liệu:
 * page, pageSize, sort, visibleColumns
 */
export function useTableState<T>(
  allColumns: Column<T>[],
  options: UseTableStateOptions = {}
) {
  const { defaultPageSize = 10 } = options

  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: "asc" | "desc" } | undefined>()
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(
    allColumns.map((c) => c.key)
  )

  const handleSort = (key: string) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    )
    setPage(1)
  }

  const handleToggleColumn = (key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  /** Tạo empty PaginatedApiResponse để tránh lỗi khi data undefined */
  const emptyResponse = React.useMemo<PaginatedApiResponse<T>>(() => ({
    success: true,
    message: "",
    data: [],
    meta: {
      page,
      limit: pageSize,
      totalElements: 0,
      totalPages: 0,
    }
  }), [page, pageSize])

  return {
    page,
    pageSize,
    sortConfig,
    visibleColumns,
    handleSort,
    handleToggleColumn,
    handlePageChange,
    handlePageSizeChange,
    emptyResponse,
  }
}
