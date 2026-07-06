import * as React from "react"
import { Eye, Check, X } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DataTableWrapper } from "@/components/shared/data-table"
import type { Column } from "@/components/shared/data-table"
import { useTableState } from "@/hooks/useTableState"
import { AdminReportService } from "@/services"
import type { AdminReportResponse, PaginatedApiResponse } from "@/types"

const COLUMNS: Column<AdminReportResponse>[] = [
  { 
    key: "id", 
    title: "Mã BC", 
    hideable: true, 
    render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> 
  },
  { 
    key: "reporterId", 
    title: "Người báo cáo", 
    render: (r) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-foreground">{r.reporter?.name ?? "Chưa rõ"}</span>
        <span className="text-xs text-muted-foreground font-mono">{r.reporterId}</span>
      </div>
    ) 
  },
  { 
    key: "type", 
    title: "Loại", 
    render: (r) => <Badge variant="outline">{r.type}</Badge> 
  },
  { 
    key: "ownerId", 
    title: "Chủ nội dung", 
    render: (r) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm text-foreground">
          {r.reportedContent?.owner?.name ?? (r.reportedContent?.ownerId ? "Chưa rõ" : "N/A")}
        </span>
        <span className="text-xs text-muted-foreground font-mono">{r.reportedContent?.ownerId ?? "N/A"}</span>
      </div>
    ) 
  },
  { 
    key: "reason", 
    title: "Lý do", 
    render: (r) => <span className="max-w-[200px] truncate block">{r.reason}</span> 
  },
  { 
    key: "createdAt", 
    title: "Ngày gửi", 
    hideable: true, 
    render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : "" 
  },
  { 
    key: "status", 
    title: "Trạng thái", 
    render: () => <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Chờ xử lý</Badge> 
  },
  { 
    key: "actions", 
    title: "Hành động", 
    className: "text-right", 
    render: () => null 
  },
]

export function ReportsPage() {
  const queryClient = useQueryClient()
  const [selectedReport, setSelectedReport] = React.useState<AdminReportResponse | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(COLUMNS)

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page, pageSize],
    queryFn: async () => {
      const res = await AdminReportService.getReports({ page, size: pageSize })
      const raw = res as any
      return {
        success: raw.success,
        message: raw.message,
        data: raw.data || [],
        meta: {
          page: raw.page ?? 1,
          limit: raw.size ?? 10,
          totalElements: raw.totalElements ?? 0,
          totalPages: raw.totalPages ?? 0,
        }
      } as PaginatedApiResponse<AdminReportResponse>
    },
  })

  const dismissMutation = useMutation({
    mutationFn: (reportId: string) => AdminReportService.dismissReport({ reportId }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setIsDetailOpen(false) 
    },
  })

  const deleteContentMutation = useMutation({
    mutationFn: (reportId: string) => AdminReportService.deleteReportedContent({ reportId }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["reports"] })
      setIsDetailOpen(false) 
    },
  })

  const paginatedData: PaginatedApiResponse<AdminReportResponse> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }

  const columns: Column<AdminReportResponse>[] = [
    ...COLUMNS.slice(0, COLUMNS.length - 1),
    {
      key: "actions",
      title: "Hành động",
      className: "text-right",
      render: (report) => (
        <Button variant="ghost" size="icon" onClick={() => { setSelectedReport(report); setIsDetailOpen(true) }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Xử lý Báo cáo Vi phạm</h2>
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
        emptyMessage="Không có báo cáo nào."
        showToolbar={false}
      />

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Chi tiết báo cáo vi phạm</DialogTitle>
            <DialogDescription>
              Xem chi tiết báo cáo và đưa ra quyết định xử lý.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6 my-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Report Meta Info */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Mã báo cáo</span>
                  <span className="font-mono text-sm">{selectedReport.id}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Thời gian gửi</span>
                  <span className="text-sm text-foreground">
                    {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString("vi-VN") : "N/A"}
                  </span>
                </div>
              </div>

              {/* Reporter and Reason */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Thông tin báo cáo</h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {selectedReport.reporter?.avatarUrl ? (
                      <img src={selectedReport.reporter.avatarUrl} alt={selectedReport.reporter.name} className="h-10 w-10 rounded-full object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {(selectedReport.reporter?.name || selectedReport.reporterId || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-sm">
                        {selectedReport.reporter?.name ?? selectedReport.reporterId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedReport.reporter?.email ?? "N/A"} &bull; {selectedReport.reporter?.role ?? "STUDENT"}
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <span className="text-xs text-muted-foreground block font-medium mb-1">Lý do báo cáo:</span>
                    <p className="text-sm text-foreground italic bg-background p-2.5 rounded border border-dashed">
                      "{selectedReport.reason}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Reported Content */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nội dung bị báo cáo</h4>
                  <Badge variant={selectedReport.reportedContent?.content === null ? "destructive" : "secondary"}>
                    {selectedReport.type}
                  </Badge>
                </div>

                <div className="border rounded-lg p-4 space-y-4 bg-card">
                  {/* Content Owner Info */}
                  <div className="flex items-center gap-3 border-b pb-3">
                    {selectedReport.reportedContent?.owner?.avatarUrl ? (
                      <img src={selectedReport.reportedContent.owner.avatarUrl} alt={selectedReport.reportedContent.owner.name} className="h-8 w-8 rounded-full object-cover border" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs">
                        {(selectedReport.reportedContent?.owner?.name || selectedReport.reportedContent?.ownerId || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-xs">
                        Chủ nội dung: {selectedReport.reportedContent?.owner?.name ?? selectedReport.reportedContent?.ownerId}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ID: {selectedReport.reportedContent?.ownerId ?? "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Actual Content Body */}
                  {selectedReport.reportedContent?.content === null ? (
                    <div className="text-center py-6 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                      <span className="text-sm font-medium block">Nội dung đã bị xóa trước đó.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedReport.type === "REVIEW" && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Đánh giá:</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < (selectedReport.reportedContent?.rating ?? 0) ? "text-yellow-500 text-sm" : "text-gray-300 text-sm"}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-semibold">({selectedReport.reportedContent?.rating}/5)</span>
                        </div>
                      )}

                      {selectedReport.type === "QUESTION" && selectedReport.reportedContent?.title && (
                        <div>
                          <span className="text-xs text-muted-foreground block">Tiêu đề:</span>
                          <h5 className="font-semibold text-sm text-foreground">{selectedReport.reportedContent.title}</h5>
                        </div>
                      )}

                      <div>
                        <span className="text-xs text-muted-foreground block mb-1">Nội dung:</span>
                        <div className="bg-muted/30 p-3 rounded text-sm text-foreground whitespace-pre-wrap border font-sans leading-relaxed">
                          {selectedReport.reportedContent?.content}
                        </div>
                      </div>

                      {/* References details */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t text-[11px] text-muted-foreground font-mono">
                        {selectedReport.reportedContent?.courseId && (
                          <div>Khoá học ID: {selectedReport.reportedContent.courseId}</div>
                        )}
                        {selectedReport.reportedContent?.lessonId && (
                          <div>Bài học ID: {selectedReport.reportedContent.lessonId}</div>
                        )}
                        {selectedReport.reportedContent?.questionId && (
                          <div>Câu hỏi ID: {selectedReport.reportedContent.questionId}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => selectedReport?.id && dismissMutation.mutate(selectedReport.id)}
              disabled={dismissMutation.isPending || deleteContentMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Bỏ qua báo cáo
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => selectedReport?.id && deleteContentMutation.mutate(selectedReport.id)}
              disabled={
                deleteContentMutation.isPending || 
                dismissMutation.isPending || 
                selectedReport?.reportedContent?.content === null
              }
            >
              <Check className="mr-2 h-4 w-4" /> Xóa nội dung vi phạm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
