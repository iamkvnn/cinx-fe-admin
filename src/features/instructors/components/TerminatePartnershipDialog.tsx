import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { UserService } from "@/services"
import type { TerminatePartnershipRequest } from "@/types"

interface TerminatePartnershipDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  instructorId: string
  instructorName: string
  onSuccess?: () => void
}

const REASON_OPTIONS = [
  { value: "POLICY_VIOLATION", label: "Vi phạm điều khoản chính sách" },
  { value: "FRAUD_OR_MISCONDUCT", label: "Gian lận hoặc hành vi sai trái" },
  { value: "COPYRIGHT_VIOLATION", label: "Vi phạm bản quyền" },
  { value: "INACTIVE_INSTRUCTOR", label: "Giảng viên ngừng hoạt động" },
  { value: "OTHER", label: "Lý do khác" },
] as const

type TerminationReasonType = typeof REASON_OPTIONS[number]["value"]

export function TerminatePartnershipDialog({
  isOpen,
  onOpenChange,
  instructorId,
  instructorName,
  onSuccess,
}: TerminatePartnershipDialogProps) {
  const queryClient = useQueryClient()
  const [reasonType, setReasonType] = React.useState<TerminationReasonType>("POLICY_VIOLATION")
  const [reasonDetail, setReasonDetail] = React.useState("")

  const terminateMutation = useMutation({
    mutationFn: (body: TerminatePartnershipRequest) =>
      UserService.terminatePartnership({ id: instructorId, body }),
    onSuccess: () => {
      toast.success(`Đã chấm dứt hợp tác với giảng viên ${instructorName}`)
      queryClient.invalidateQueries({ queryKey: ["instructors"] })
      queryClient.invalidateQueries({ queryKey: ["instructor-detail", instructorId] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi chấm dứt hợp tác")
    },
  })

  React.useEffect(() => {
    if (isOpen) {
      setReasonType("POLICY_VIOLATION")
      setReasonDetail("")
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (reasonType === "OTHER" && !reasonDetail.trim()) {
      toast.error("Vui lòng nhập lý do cụ thể khi chọn 'Lý do khác'")
      return
    }

    terminateMutation.mutate({
      reasonType,
      reasonDetail: reasonDetail.trim() || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Chấm dứt hợp tác giảng viên
          </DialogTitle>
          <DialogDescription>
            Hành động này sẽ chấm dứt quan hệ hợp tác với giảng viên{" "}
            <span className="font-semibold text-foreground">{instructorName}</span>. Khóa học của giảng viên này sẽ không thể xuất bản mới và họ sẽ bị tước quyền giảng dạy.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason-type">Lý do chính</Label>
            <Select
              value={reasonType}
              onValueChange={(val) => setReasonType(val as TerminationReasonType)}
            >
              <SelectTrigger id="reason-type">
                <SelectValue placeholder="Chọn lý do chấm dứt" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="reason-detail">
              Chi tiết/Ghi chú thêm {reasonType === "OTHER" && <span className="text-destructive">*</span>}
            </Label>
            <textarea
              id="reason-detail"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Nhập lý do chi tiết hoặc hướng dẫn cụ thể cho giảng viên..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={terminateMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={terminateMutation.isPending}
          >
            {terminateMutation.isPending ? "Đang xử lý..." : "Xác nhận chấm dứt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
