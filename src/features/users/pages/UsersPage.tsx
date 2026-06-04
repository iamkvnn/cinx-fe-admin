import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { UserService } from "@/services"
import type { UserDto, PaginatedApiResponse } from "@/types"
import { RoleBadge, UserStatusBadge } from "../components/UserBadges"

const COLUMNS: Column<UserDto>[] = [
  { key: "userId", title: "Mã ND", hideable: true, render: (u) => <span className="font-mono text-xs text-muted-foreground">{u.userId?.substring(0, 8)}...</span> },
  { key: "name", title: "Họ Tên", sortable: true },
  { key: "email", title: "Email", hideable: true },
  { key: "role", title: "Vai trò", render: (u) => <RoleBadge role={u.role} /> },
  { key: "status", title: "Trạng thái", render: (u) => <UserStatusBadge user={u} /> },
]


export function UsersPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange,
  } = useTableState(COLUMNS)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, pageSize, debouncedSearch],
    queryFn: () => UserService.getAllUsers({
      page,
      size: pageSize,
      query: debouncedSearch || undefined,
      role: "USER",
    }),
  })

  const paginatedData: PaginatedApiResponse<UserDto> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const columns: Column<UserDto>[] = [
    ...COLUMNS,
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (u) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); navigate(`/users/${u.userId}`) }} title="Xem chi tiết">
          <Eye className="h-4 w-4 text-primary" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Học viên</h2>
      </div>

      <DataTableWrapper
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortConfig={sortConfig}
        onSort={handleSort}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        emptyMessage="Không tìm thấy học viên nào."
        onRowClick={(user) => navigate(`/users/${user.userId}`)}
        toolbarContent={
          <div className="flex items-center gap-2 w-full">
            <Input
              type="search"
              placeholder="Tìm kiếm học viên..."
              className="max-w-sm"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handlePageChange(1) }}
            />
          </div>
        }
      />
    </div>
  )
}
