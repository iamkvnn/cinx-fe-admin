import { Check, Trash2, Mail, MailOpen } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { notificationService } from "@/services"
import type { UserNotificationResponse, PaginatedApiResponse } from "@/types"

const COLUMNS: Column<UserNotificationResponse>[] = [
  {
    key: "title", title: "Tiêu đề", sortable: true, render: (n) => (
      <div className="flex items-center gap-2">
        {n.isRead ? <MailOpen className="h-4 w-4 text-muted-foreground shrink-0" /> : <Mail className="h-4 w-4 text-primary shrink-0" />}
        <span className={n.isRead ? "text-muted-foreground" : "font-medium"}>{n.title}</span>
        {!n.isRead && <Badge className="h-5 px-1.5 text-[10px]">Mới</Badge>}
      </div>
    )
  },
  { key: "message", title: "Nội dung", hideable: true, render: (n) => <span className="text-sm text-muted-foreground line-clamp-1">{n.message}</span> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function NotificationsPage() {
  const queryClient = useQueryClient()

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(COLUMNS)

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page, pageSize],
    queryFn: () => notificationService.getNotifications({ page, size: pageSize }),
  })

  const toggleReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.toggleRead(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.deleteNotification(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const notifications: UserNotificationResponse[] = (data?.data ?? [])

  const paginatedData: PaginatedApiResponse<UserNotificationResponse> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const markAllRead = () => {
    notifications.filter(n => !n.isRead).forEach(n => n.id && toggleReadMutation.mutate(n.id))
  }


  const columns: Column<UserNotificationResponse>[] = [
    ...COLUMNS.slice(0, 2),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (n) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={n.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"} onClick={() => n.id && toggleReadMutation.mutate(n.id)}>
            {n.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => n.id && deleteMutation.mutate(n.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Thông báo</h2>
        <Button variant="outline" onClick={markAllRead}>
          <Check className="mr-2 h-4 w-4" /> Đánh dấu tất cả đã đọc
        </Button>
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
        emptyMessage="Không có thông báo nào."
        showToolbar={false}
      />
    </div>
  )
}
