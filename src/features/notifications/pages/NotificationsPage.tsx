import * as React from "react"
import { Check, Trash2, Mail, MailOpen, Eye, ExternalLink } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { NotificationService } from "@/services"
import type { UserNotificationResponse, PaginatedApiResponse } from "@/types"
import { getNotificationFrontendUrl, getNotificationTypeLabel } from "@/utils/notificationHelper"

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
  {
    key: "type", title: "Loại thông báo", render: (n) => {
      const typeInfo = getNotificationTypeLabel(n.type)
      return (
        <Badge className={typeInfo.color} variant="outline">
          {typeInfo.label}
        </Badge>
      )
    }
  },
  { key: "message", title: "Nội dung", hideable: true, render: (n) => <span className="text-sm text-muted-foreground line-clamp-1">{n.message}</span> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [selectedNotification, setSelectedNotification] = React.useState<UserNotificationResponse | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500)
    return () => clearTimeout(t)
  }, [searchTerm])

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(COLUMNS)

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", page, pageSize, debouncedSearch],
    queryFn: () => NotificationService.getNotifications({
      page,
      size: pageSize,
      query: debouncedSearch.trim() || undefined
    }),
  })

  const toggleReadMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationService.toggleRead({ notificationId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationService.deleteNotification({ notificationId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  })

  const handleNotificationClick = (n: UserNotificationResponse) => {
    if (n.id && !n.isRead) {
      toggleReadMutation.mutate(n.id)
    }
    setSelectedNotification(n)
  }

  const notifications: UserNotificationResponse[] = (data?.data ?? [])

  const paginatedData: PaginatedApiResponse<UserNotificationResponse> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const markAllRead = () => {
    notifications.filter((n: UserNotificationResponse) => !n.isRead).forEach((n: UserNotificationResponse) => n.id && toggleReadMutation.mutate(n.id))
  }


  const columns: Column<UserNotificationResponse>[] = [
    ...COLUMNS.slice(0, 3),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (n) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title="Xem chi tiết" onClick={(e) => { e.stopPropagation(); handleNotificationClick(n) }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={n.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"} onClick={(e) => { e.stopPropagation(); n.id && toggleReadMutation.mutate(n.id) }}>
            {n.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => { e.stopPropagation(); n.id && deleteMutation.mutate(n.id) }}>
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
        showToolbar={true}
        toolbarContent={
          <Input
            type="search"
            placeholder="Tìm kiếm thông báo..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); handlePageChange(1) }}
          />
        }
        onRowClick={handleNotificationClick}
      />

      {/* Detail Modal */}
      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedNotification && (
                <>
                  {getNotificationTypeLabel(selectedNotification.type).label && (
                    <Badge className={getNotificationTypeLabel(selectedNotification.type).color} variant="outline">
                      {getNotificationTypeLabel(selectedNotification.type).label}
                    </Badge>
                  )}
                  <Badge variant={selectedNotification.isRead ? "secondary" : "default"}>
                    {selectedNotification.isRead ? "Đã đọc" : "Mới"}
                  </Badge>
                </>
              )}
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {selectedNotification?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedNotification?.message}
            </div>

            {/* Metadata formatting */}
            {selectedNotification?.metadata && Object.keys(selectedNotification.metadata).length > 0 && (
              <div className="p-3 bg-muted/50 rounded-xl border space-y-2 text-xs">
                <h4 className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Thông tin chi tiết</h4>
                {Object.entries(selectedNotification.metadata).map(([key, value]) => {
                  if (typeof value === "object" && value !== null) {
                    return (
                      <div key={key} className="space-y-1">
                        {Object.entries(value).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4 py-0.5 border-b border-border/40 last:border-0">
                            <span className="text-muted-foreground font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                            <span className="text-foreground font-semibold text-right">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }
                  return null
                })}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setSelectedNotification(null)}>
              Đóng
            </Button>
            {selectedNotification && getNotificationFrontendUrl(selectedNotification) !== "/" && (
              <Button
                type="button"
                onClick={() => {
                  const url = getNotificationFrontendUrl(selectedNotification)
                  setSelectedNotification(null)
                  if (url.startsWith("http")) {
                    window.open(url, "_blank")
                  } else {
                    navigate(url)
                  }
                }}
              >
                <ExternalLink className="mr-1.5 h-4 w-4" /> Chuyển đến trang
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
