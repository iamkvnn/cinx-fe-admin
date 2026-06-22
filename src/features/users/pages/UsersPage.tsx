import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, Lock, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { UserService, AuthService } from "@/services"
import type { UserDto, PaginatedApiResponse } from "@/types"
import { RoleBadge, UserStatusBadge } from "../components/UserBadges"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BanUserDialog } from "../components/BanUserDialog"

const COLUMNS: Column<UserDto>[] = [
  { key: "userId", title: "Mã ND", hideable: true, render: (u) => <span className="font-mono text-xs text-muted-foreground">{u.userId?.substring(0, 8)}...</span> },
  { key: "name", title: "Họ Tên", sortable: true },
  { key: "email", title: "Email", hideable: true },
  { key: "role", title: "Vai trò", render: (u) => <RoleBadge role={u.role} /> },
  { key: "status", title: "Trạng thái", render: (u) => <UserStatusBadge user={u} /> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]


export function UsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<UserDto | null>(null)
  const [isBanDialogOpen, setIsBanDialogOpen] = React.useState(false)
  const [isUnbanConfirmOpen, setIsUnbanConfirmOpen] = React.useState(false)

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => AuthService.unbanUser({ userId }),
    onSuccess: () => {
      toast.success("Mở khóa tài khoản thành công")
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setIsUnbanConfirmOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi mở khóa tài khoản")
    },
  })

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
    ...COLUMNS.slice(0, 5),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (u) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => navigate(`/users/${u.userId}`)} title="Xem chi tiết">
            <Eye className="h-4 w-4 text-primary" />
          </Button>
          {u.status === 'BANNED' ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
              onClick={() => {
                setSelectedUser(u)
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
                setSelectedUser(u)
                setIsBanDialogOpen(true)
              }}
              title="Khóa tài khoản"
            >
              <Lock className="h-4 w-4" />
            </Button>
          )}
        </div>
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

      {selectedUser && (
        <BanUserDialog
          isOpen={isBanDialogOpen}
          onOpenChange={setIsBanDialogOpen}
          userId={selectedUser.userId || ""}
          userName={selectedUser.name || ""}
          userRole="USER"
        />
      )}

      {selectedUser && (
        <Dialog open={isUnbanConfirmOpen} onOpenChange={setIsUnbanConfirmOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Mở khóa tài khoản</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn mở khóa cho tài khoản của <span className="font-semibold text-foreground">{selectedUser.name}</span>? Người dùng này sẽ khôi phục quyền truy cập vào hệ thống.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUnbanConfirmOpen(false)} disabled={unbanMutation.isPending}>
                Hủy
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => selectedUser.userId && unbanMutation.mutate(selectedUser.userId)}
                disabled={unbanMutation.isPending}
              >
                {unbanMutation.isPending ? "Đang xử lý..." : "Mở khóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
