import * as React from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface CourseApprovalActionsProps {
  courseId: string
  instructorName?: string
  approvePending: boolean
  rejectPending: boolean
  onApprove: () => void
  onReject: (reason: string) => void
}

export function CourseApprovalActions({
  instructorName,
  approvePending,
  rejectPending,
  onApprove,
  onReject,
}: CourseApprovalActionsProps) {
  const [rejectReason, setRejectReason] = React.useState("")
  const [isRejectOpen, setIsRejectOpen] = React.useState(false)

  const handleConfirmReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason.trim())
      setIsRejectOpen(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogTrigger
          render={
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" /> Từ chối
            </Button>
          }
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối khóa học</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối khóa học này. Hệ thống sẽ gửi email thông báo cho giảng viên {instructorName}.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Nhập lý do từ chối chi tiết..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={rejectPending}>
              {rejectPending ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={onApprove}
        disabled={approvePending}
      >
        <CheckCircle className="mr-2 h-4 w-4" />{" "}
        {approvePending ? "Đang duyệt..." : "Phê duyệt"}
      </Button>
    </div>
  )
}
