import type { UserNotificationResponse } from "@/types"

export function getNotificationFrontendUrl(n: UserNotificationResponse): string {
  const type = n.type
  const refId = n.referenceId
  const metadata = n.metadata || {}

  switch (type) {
    case "COURSE_PUBLISHED":
    case "COURSE_CONTENT_PUBLISHED":
    case "COURSE_COMPLETED":
    case "COURSE_REVIEW_CREATED":
      return refId ? `/courses/${refId}` : "/courses"
      
    case "COURSE_APPROVAL_REQUESTED":
      return refId ? `/courses/${refId}` : "/courses"

    case "CERTIFICATE_REQUESTED":
      return "/"

    case "CERTIFICATE_APPROVED": {
      const certMetadata = metadata.Certificate as Record<string, unknown> | undefined
      const certUrl = certMetadata?.certificateUrl || n.actionUrl || "/"
      return String(certUrl)
    }

    case "DAILY_LEARNING_REMINDER":
      return "/"

    case "PAYMENT_SUCCEEDED":
    case "ORDER_CREATED":
    case "ORDER_CANCELLED":
      return "/"

    case "COURSE_QUESTION_CREATED":
    case "COURSE_ANSWER_CREATED": {
      const qnaMetadata = metadata.QnA as Record<string, unknown> | undefined
      const qnaCourseId = qnaMetadata?.courseId || refId
      return qnaCourseId ? `/courses/${qnaCourseId}` : "/courses"
    }

    default:
      if (n.actionUrl && n.actionUrl.startsWith("/")) {
        let url = n.actionUrl
        if (url.startsWith("/admin/courses/")) {
          url = url.replace("/admin/courses/", "/courses/")
        }
        return url
      }
      return "/"
  }
}

export function getNotificationTypeLabel(type?: string): { label: string; color: string } {
  switch (type) {
    case "COURSE_PUBLISHED":
      return { label: "Xuất bản khóa học", color: "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300" }
    case "COURSE_CONTENT_PUBLISHED":
      return { label: "Nội dung mới", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300" }
    case "COURSE_APPROVAL_REQUESTED":
      return { label: "Chờ duyệt khóa học", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 animate-pulse" }
    case "CERTIFICATE_REQUESTED":
      return { label: "Yêu cầu chứng chỉ", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300" }
    case "CERTIFICATE_APPROVED":
      return { label: "Duyệt chứng chỉ", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300" }
    case "COURSE_COMPLETED":
      return { label: "Hoàn thành khóa học", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300" }
    case "DAILY_LEARNING_REMINDER":
      return { label: "Nhắc nhở học tập", color: "bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300" }
    case "PAYMENT_SUCCEEDED":
      return { label: "Thanh toán thành công", color: "bg-teal-100 text-teal-800 dark:bg-teal-950/30 dark:text-teal-300" }
    case "ORDER_CREATED":
      return { label: "Đơn hàng mới", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300" }
    case "ORDER_CANCELLED":
      return { label: "Hủy đơn hàng", color: "bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300" }
    case "COURSE_REVIEW_CREATED":
      return { label: "Đánh giá mới", color: "bg-pink-100 text-pink-800 dark:bg-pink-950/30 dark:text-pink-300" }
    case "COURSE_QUESTION_CREATED":
      return { label: "Q&A câu hỏi", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300" }
    case "COURSE_ANSWER_CREATED":
      return { label: "Q&A phản hồi", color: "bg-sky-100 text-sky-800 dark:bg-sky-950/30 dark:text-sky-300" }
    default:
      return { label: "Thông báo", color: "bg-slate-100 text-slate-800 dark:bg-slate-950/30 dark:text-slate-300" }
  }
}
