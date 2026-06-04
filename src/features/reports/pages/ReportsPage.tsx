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
import type { Report, PaginatedApiResponse } from "@/types"

const COLUMNS: Column<Report>[] = [
  { key: "id", title: "Mã BC", hideable: true, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.id?.substring(0, 8)}...</span> },
  { key: "reporterId", title: "Người báo cáo", render: (r) => <span className="text-xs text-muted-foreground">{r.reporterId?.substring(0, 8)}</span> },
  { key: "type", title: "Loại", render: (r) => <Badge variant="outline">{r.type}</Badge> },
  { key: "reason", title: "Lý do", render: (r) => <span className="max-w-[200px] truncate block">{r.reason}</span> },
  { key: "createdAt", title: "Ngày gửi", hideable: true, render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "" },
  { key: "status", title: "Trạng thái", render: () => <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Chờ xử lý</Badge> },
  { key: "actions", title: "Hành động", className: "text-right", render: () => null },
]

export function ReportsPage() {
  const queryClient = useQueryClient()
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  const {
    page, pageSize, sortConfig, visibleColumns,
    handleSort, handleToggleColumn, handlePageChange, handlePageSizeChange
  } = useTableState(COLUMNS)

  const { data, isLoading } = useQuery({
    queryKey: ["reports", page, pageSize],
    queryFn: () => AdminReportService.getReports({ page, size: pageSize }),
  })

  const dismissMutation = useMutation({
    mutationFn: (reportId: string) => AdminReportService.dismissReport({ reportId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reports"] }); setIsDetailOpen(false) },
  })

  const deleteContentMutation = useMutation({
    mutationFn: (reportId: string) => AdminReportService.deleteReportedContent({ reportId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reports"] }); setIsDetailOpen(false) },
  })

  const paginatedData: PaginatedApiResponse<Report> = data || {
    success: true,
    message: "",
    data: [],
    meta: { page: 1, limit: 10, totalElements: 0, totalPages: 0 }
  }


  const columns: Column<Report>[] = [
    ...COLUMNS.slice(0, 6),
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết báo cáo</DialogTitle>
            <DialogDescription>Xem chi tiết báo cáo và đưa ra quyết định.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="font-medium">Người báo cáo:</span>
              <span className="col-span-3 text-sm break-all">{selectedReport?.reporterId}</span>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="font-medium">Đối tượng (Ref):</span>
              <span className="col-span-3 text-sm break-all">{selectedReport?.refId}</span>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <span className="font-medium">Lý do:</span>
              <span className="col-span-3 text-sm text-muted-foreground">{selectedReport?.reason}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => selectedReport?.id && dismissMutation.mutate(selectedReport.id)}
              disabled={dismissMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" /> Bỏ qua
            </Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => selectedReport?.id && deleteContentMutation.mutate(selectedReport.id)}
              disabled={deleteContentMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" /> Xóa nội dung vi phạm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
