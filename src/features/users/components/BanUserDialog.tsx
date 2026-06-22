import * as React from "react"
import { AlertOctagon } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AuthService } from "@/services"
import type { BanUserRequest } from "@/types"

interface BanUserDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
  userRole?: "USER" | "INSTRUCTOR" | "ADMIN"
  onSuccess?: () => void
}

const REASON_OPTIONS = [
  { value: "SPAM", label: "Spam / Tin nhắn rác" },
  { value: "NEGATIVE_WORDS", label: "Sử dụng từ ngữ tiêu cực" },
  { value: "INSULT", label: "Xúc phạm / Phỉ báng người khác" },
  { value: "POLICY_ABUSE", label: "Lạm dụng chính sách" },
] as const

type BanReasonType = typeof REASON_OPTIONS[number]["value"]

export function BanUserDialog({
  isOpen,
  onOpenChange,
  userId,
  userName,
  userRole = "USER",
  onSuccess,
}: BanUserDialogProps) {
  const queryClient = useQueryClient()
  const [reasonType, setReasonType] = React.useState<BanReasonType>("SPAM")
  const [details, setDetails] = React.useState("")
  const [durationDays, setDurationDays] = React.useState<string>("")

  const banMutation = useMutation({
    mutationFn: (body: BanUserRequest) =>
      AuthService.banUser({ userId, body }),
    onSuccess: () => {
      toast.success(`Đã khóa tài khoản người dùng ${userName}`)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["user-detail", userId] })
      queryClient.invalidateQueries({ queryKey: ["instructors"] })
      queryClient.invalidateQueries({ queryKey: ["instructor-detail", userId] })
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi khóa tài khoản")
    },
  })

  React.useEffect(() => {
    if (isOpen) {
      setReasonType("SPAM")
      setDetails("")
      setDurationDays("")
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (!details.trim()) {
      toast.error("Vui lòng nhập lý do cụ thể để khóa tài khoản")
      return
    }

    const duration = durationDays.trim() ? parseInt(durationDays.trim(), 10) : undefined
    if (duration !== undefined && (isNaN(duration) || duration <= 0)) {
      toast.error("Thời hạn khóa phải là một số nguyên dương hợp lệ")
      return
    }

    banMutation.mutate({
      reasonType,
      details: details.trim(),
      durationDays: duration,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertOctagon className="h-5 w-5" />
            Khóa tài khoản người dùng
          </DialogTitle>
          <DialogDescription>
            Tài khoản của <span className="font-semibold text-foreground">{userName}</span> ({userRole === "INSTRUCTOR" ? "Giảng viên" : "Học viên"}) sẽ tạm thời hoặc vĩnh viễn bị chặn quyền truy cập vào hệ thống.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="ban-reason-type">Lý do khóa chính</Label>
            <Select
              value={reasonType}
              onValueChange={(val) => setReasonType(val as BanReasonType)}
            >
              <SelectTrigger id="ban-reason-type">
                <SelectValue placeholder="Chọn lý do khóa tài khoản" />
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
            <Label htmlFor="ban-duration">Thời hạn khóa (số ngày, để trống nếu khóa vĩnh viễn)</Label>
            <Input
              id="ban-duration"
              type="number"
              min="1"
              placeholder="VD: 7, 30..."
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ban-details">
              Chi tiết vi phạm <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="ban-details"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Nhập chi tiết hành vi vi phạm hoặc bằng chứng khóa tài khoản..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={banMutation.isPending}>
            Hủy bỏ
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={banMutation.isPending}
          >
            {banMutation.isPending ? "Đang xử lý..." : "Khóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
