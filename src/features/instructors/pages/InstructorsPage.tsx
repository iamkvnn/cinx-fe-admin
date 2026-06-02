import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Eye } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { UserService } from "@/services"
import type { UserDto, PaginatedApiResponse } from "@/types"
import { InstructorDetailDialog } from "../components/InstructorDetailDialog"

const BASE_COLUMNS: Column<UserDto>[] = [
  { key: "userId", title: "Mã GV", hideable: true, render: (u) => <span className="font-mono text-xs text-muted-foreground">{u.userId?.substring(0, 8)}...</span> },
  { key: "name", title: "Họ Tên", sortable: true },
  { key: "email", title: "Email", hideable: true },
  { key: "isInstructorVerified", title: "Trạng thái hồ sơ", render: (u) => u.isInstructorVerified ? <Badge className="bg-green-500 hover:bg-green-600">Đã duyệt</Badge> : <Badge className="bg-yellow-500 hover:bg-yellow-600">Chờ duyệt</Badge> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function InstructorsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [selectedInstructor, setSelectedInstructor] = React.useState<UserDto | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(BASE_COLUMNS)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  const { data, isLoading } = useQuery({
    queryKey: ["instructors", page, pageSize, debouncedSearch, statusFilter],
    queryFn: () => UserService.getAllUsers({
      page, size: pageSize,
      query: debouncedSearch || undefined,
      role: "INSTRUCTOR",
      isInstructorVerified: statusFilter === "ALL" ? undefined : statusFilter === "approved",
    }),
  })

  const verifyMutation = useMutation({
    mutationFn: (id: string) => UserService.verifyInstructor({ id }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["instructors"] }); setIsDetailOpen(false) },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      UserService.rejectInstructor({ id, reason }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["instructors"] }); setIsDetailOpen(false) },
  })

  const paginatedData: PaginatedApiResponse<UserDto> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const columns: Column<UserDto>[] = [
    ...BASE_COLUMNS.slice(0, 4),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (instructor) => (
        <Button variant="ghost" size="icon" onClick={() => { setSelectedInstructor(instructor); setIsDetailOpen(true) }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Quản lý Giảng viên</h2>
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
        emptyMessage="Không tìm thấy giảng viên nào."
        onRowClick={(instructor) => navigate(`/instructors/${instructor.userId}`)}
        toolbarContent={
          <div className="flex items-center gap-2 w-full">
            <Input
              type="search"
              placeholder="Tìm kiếm giảng viên..."
              className="max-w-sm"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); handlePageChange(1) }}
            />
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val || "ALL"); handlePageChange(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <InstructorDetailDialog
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        instructor={selectedInstructor}
        verifyPending={verifyMutation.isPending}
        rejectPending={rejectMutation.isPending}
        onVerify={(id) => verifyMutation.mutate(id)}
        onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
      />
    </div>
  )
}
