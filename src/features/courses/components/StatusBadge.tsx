import { Badge } from "@/components/ui/badge"
import type { CourseResponse } from "@/types"

interface StatusBadgeProps {
  status?: string
}

export function getCourseDisplayStatus(course: CourseResponse): string {
  if (course.status === "ARCHIVED") return "ARCHIVED";
  if (course.publishStatus === "WAITING_APPROVAL") return "WAITING_APPROVAL";
  if (course.publishStatus === "REJECTED") return "REJECTED";
  if (course.status === "PUBLISHED" || course.publishStatus === "PUBLISHED") return "PUBLISHED";
  return "DRAFT";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "WAITING_APPROVAL":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Chờ duyệt</Badge>
    case "PUBLISHED":
      return <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">Đã xuất bản</Badge>
    case "REJECTED":
      return <Badge variant="destructive">Từ chối</Badge>
    case "DRAFT":
      return <Badge variant="secondary">Bản nháp</Badge>
    case "ARCHIVED":
      return <Badge variant="outline">Lưu trữ</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

