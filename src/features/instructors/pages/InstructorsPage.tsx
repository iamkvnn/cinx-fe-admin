import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Eye, Lock, Unlock, UserX } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { UserService, AuthService } from "@/services"
import type { UserDto, PaginatedApiResponse } from "@/types"
import { InstructorDetailDialog } from "../components/InstructorDetailDialog"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BanUserDialog } from "@/features/users/components/BanUserDialog"
import { TerminatePartnershipDialog } from "../components/TerminatePartnershipDialog"

const BASE_COLUMNS: Column<UserDto>[] = [
  { key: "userId", title: "Mã GV", hideable: true, render: (u) => <span className="font-mono text-xs text-muted-foreground">{u.userId?.substring(0, 8)}...</span> },
  { key: "name", title: "Họ Tên", sortable: true },
  { key: "email", title: "Email", hideable: true },
  {
    key: "isInstructorVerified",
    title: "Trạng thái hồ sơ",
    render: (u) => {
      if (u.isPartnershipTerminated) {
        return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">Chấm dứt hợp tác</Badge>
      }
      return u.isInstructorVerified ? (
        <Badge className="bg-green-500 hover:bg-green-600">Đã duyệt</Badge>
      ) : (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">Chờ duyệt</Badge>
      )
    }
  },
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
  const [isBanDialogOpen, setIsBanDialogOpen] = React.useState(false)
  const [isUnbanConfirmOpen, setIsUnbanConfirmOpen] = React.useState(false)
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = React.useState(false)

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => AuthService.unbanUser({ userId }),
    onSuccess: () => {
      toast.success("Mở khóa tài khoản thành công")
      queryClient.invalidateQueries({ queryKey: ["instructors"] })
      setIsUnbanConfirmOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi mở khóa tài khoản")
    },
  })

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
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedInstructor(instructor)
              setIsDetailOpen(true)
            }}
            title="Xem hồ sơ / Phê duyệt"
          >
            <Eye className="h-4 w-4 text-primary" />
          </Button>

          {instructor.status === 'BANNED' ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
              onClick={() => {
                setSelectedInstructor(instructor)
                setIsUnbanConfirmOpen(true)
              }}
              title="Mở khóa tài khoản"
            >
              <Unlock className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setSelectedInstructor(instructor)
                setIsBanDialogOpen(true)
              }}
              title="Khóa tài khoản"
            >
              <Lock className="h-4 w-4" />
            </Button>
          )}

          {instructor.isInstructorVerified && !instructor.isPartnershipTerminated && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => {
                setSelectedInstructor(instructor)
                setIsTerminateDialogOpen(true)
              }}
              title="Chấm dứt hợp tác"
            >
              <UserX className="h-4 w-4" />
            </Button>
          )}
        </div>
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

      {selectedInstructor && (
        <BanUserDialog
          isOpen={isBanDialogOpen}
          onOpenChange={setIsBanDialogOpen}
          userId={selectedInstructor.userId || ""}
          userName={selectedInstructor.name || ""}
          userRole="INSTRUCTOR"
        />
      )}

      {selectedInstructor && (
        <Dialog open={isUnbanConfirmOpen} onOpenChange={setIsUnbanConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Mở khóa tài khoản</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn mở khóa cho tài khoản của giảng viên <span className="font-semibold text-foreground">{selectedInstructor.name}</span>? Giảng viên này sẽ khôi phục quyền truy cập vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUnbanConfirmOpen(false)} disabled={unbanMutation.isPending}>
                Hủy
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => selectedInstructor.userId && unbanMutation.mutate(selectedInstructor.userId)}
                disabled={unbanMutation.isPending}
              >
                {unbanMutation.isPending ? "Đang xử lý..." : "Mở khóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {selectedInstructor && (
        <TerminatePartnershipDialog
          isOpen={isTerminateDialogOpen}
          onOpenChange={setIsTerminateDialogOpen}
          instructorId={selectedInstructor.userId || ""}
          instructorName={selectedInstructor.name || ""}
        />
      )}
    </div>
  )
}
