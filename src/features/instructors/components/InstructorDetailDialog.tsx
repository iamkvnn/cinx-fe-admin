import * as React from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { UserDto } from "@/types"

interface InstructorDetailDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  instructor: UserDto | null
  verifyPending: boolean
  rejectPending: boolean
  onVerify: (id: string) => void
  onReject: (id: string, reason: string) => void
}

export function InstructorDetailDialog({
  isOpen,
  onOpenChange,
  instructor,
  verifyPending,
  rejectPending,
  onVerify,
  onReject,
}: InstructorDetailDialogProps) {
  const [rejectReason, setRejectReason] = React.useState("")
  const [isRejectOpen, setIsRejectOpen] = React.useState(false)

  if (!instructor) return null

  const handleConfirmReject = () => {
    if (instructor.userId && rejectReason.trim()) {
      onReject(instructor.userId, rejectReason.trim())
      setIsRejectOpen(false)
      setRejectReason("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hồ sơ giảng viên</DialogTitle>
          <DialogDescription>Xem thông tin và đưa ra quyết định phê duyệt.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Họ Tên:</span>
            <span className="col-span-3">{instructor.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Email:</span>
            <span className="col-span-3">{instructor.email}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-medium">Trạng thái:</span>
            <span className="col-span-3">
              {instructor.isInstructorVerified ? (
                <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">Đã duyệt</Badge>
              ) : (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Chờ duyệt</Badge>
              )}
            </span>
          </div>
        </div>

        {!instructor.isInstructorVerified && (
          <DialogFooter className="flex gap-2">
            {isRejectOpen ? (
              <div className="flex flex-col gap-2 w-full mt-2">
                <textarea
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Lý do từ chối hồ sơ..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsRejectOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmReject}
                    disabled={rejectPending}
                  >
                    {rejectPending ? "Đang xử lý..." : "Xác nhận từ chối"}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button variant="destructive" onClick={() => setIsRejectOpen(true)}>
                  <XCircle className="mr-2 h-4 w-4" /> Từ chối
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => instructor.userId && onVerify(instructor.userId)}
                  disabled={verifyPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Phê duyệt
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
