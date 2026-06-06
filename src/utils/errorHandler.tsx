import { toast } from "sonner"
import { AxiosError } from "axios"
import React from "react"

export interface ValidationErrorDetail {
  field: string
  message: string
  rejectedValue?: any
}

export interface ProblemDetail {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  code?: string
  timestamp?: string
  traceId?: string
  errors?: ValidationErrorDetail[]
  message?: string // fallback for other formats
}

export const ERROR_CODE_MAP: Record<string, { title: string; message: string }> = {
  // Common Codes
  RESOURCE_NOT_FOUND: {
    title: "Không tìm thấy",
    message: "Tài nguyên bạn yêu cầu không tồn tại hoặc đã bị xóa."
  },
  BAD_REQUEST: {
    title: "Yêu cầu không hợp lệ",
    message: "Yêu cầu gửi đi không đúng định dạng hoặc thiếu thông tin."
  },
  VALIDATION_FAILED: {
    title: "Dữ liệu không hợp lệ",
    message: "Một hoặc nhiều trường dữ liệu không đáp ứng yêu cầu kiểm tra."
  },
  UNAUTHORIZED: {
    title: "Chưa đăng nhập",
    message: "Vui lòng đăng nhập để tiếp tục."
  },
  FORBIDDEN: {
    title: "Không có quyền",
    message: "Bạn không có quyền thực hiện hành động này."
  },
  RESOURCE_ALREADY_EXISTS: {
    title: "Đã tồn tại",
    message: "Tài nguyên này đã tồn tại trên hệ thống."
  },
  INTERNAL_ERROR: {
    title: "Lỗi máy chủ",
    message: "Có lỗi xảy ra từ hệ thống. Vui lòng thử lại sau."
  },

  // Auth And User Codes
  INVALID_CREDENTIALS: {
    title: "Đăng nhập thất bại",
    message: "Email hoặc mật khẩu không chính xác."
  },
  GOOGLE_ACCOUNT_LOGIN_REQUIRED: {
    title: "Yêu cầu đăng nhập Google",
    message: "Tài khoản này được đăng ký qua Google, vui lòng chọn đăng nhập bằng Google."
  },
  EMAIL_NOT_VERIFIED: {
    title: "Chưa xác thực email",
    message: "Tài khoản của bạn chưa được xác thực email. Vui lòng kiểm tra hộp thư."
  },
  USER_ACCOUNT_BANNED: {
    title: "Tài khoản bị khóa",
    message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
  },
  INSTRUCTOR_NOT_VERIFIED: {
    title: "Giảng viên chưa xác minh",
    message: "Tài khoản giảng viên của bạn đang chờ quản trị viên phê duyệt."
  },
  REFRESH_TOKEN_INVALID: {
    title: "Phiên đăng nhập hết hạn",
    message: "Vui lòng đăng nhập lại để tiếp tục."
  },
  INVALID_OTP: {
    title: "OTP không hợp lệ",
    message: "Mã xác thực OTP không chính xác."
  },
  OTP_EXPIRED: {
    title: "OTP hết hạn",
    message: "Mã xác thực OTP của bạn đã hết hiệu lực."
  },
  INVALID_OLD_PASSWORD: {
    title: "Mật khẩu cũ sai",
    message: "Mật khẩu cũ bạn nhập không chính xác."
  },
  BAN_DURATION_REQUIRED: {
    title: "Thiếu thời gian khóa",
    message: "Cần cung cấp thời hạn khóa tài khoản cho lý do này."
  },
  BAN_DURATION_EXCEEDED: {
    title: "Vượt giới hạn thời gian khóa",
    message: "Thời hạn khóa tài khoản vượt quá giới hạn tối đa cho phép."
  },

  // Query And Statistics Codes
  DATE_RANGE_INVALID: {
    title: "Khoảng thời gian sai",
    message: "Ngày bắt đầu không thể lớn hơn ngày kết thúc."
  },
  STATISTICS_RANGE_TOO_LARGE: {
    title: "Phạm vi thống kê quá lớn",
    message: "Khoảng thời gian thống kê vượt quá giới hạn tối đa."
  },
  INVALID_PAGINATION: {
    title: "Lỗi phân trang",
    message: "Tham số phân trang không hợp lệ."
  },
  INVALID_SORT: {
    title: "Lỗi sắp xếp",
    message: "Tiêu chí sắp xếp không được hỗ trợ."
  },

  // Course And Enrollment Access Codes
  COURSE_ARCHIVED: {
    title: "Khóa học đã lưu trữ",
    message: "Không thể thao tác trên khóa học đã được lưu trữ."
  },
  COURSE_WAITING_APPROVAL: {
    title: "Khóa học đang chờ duyệt",
    message: "Không thể chỉnh sửa khóa học trong khi chờ Admin phê duyệt."
  },
  COURSE_STATUS_INVALID: {
    title: "Trạng thái không hợp lệ",
    message: "Không thể chuyển trạng thái khóa học theo cách này."
  },
  COURSE_DRAFT_MISSING: {
    title: "Thiếu bản nháp khóa học",
    message: "Phải tạo bản nháp trước khi thực hiện hành động này."
  },
  COURSE_UNAVAILABLE_FOR_PURCHASE: {
    title: "Khóa học không mở bán",
    message: "Khóa học này hiện không có sẵn để mua hoặc đăng ký."
  },
  NOT_ENROLLED_IN_COURSE: {
    title: "Chưa tham gia khóa học",
    message: "Bạn chưa đăng ký hoặc chưa thanh toán khóa học này."
  },
  INSTRUCTOR_ACCESS_REQUIRED: {
    title: "Yêu cầu quyền giảng viên",
    message: "Chỉ giảng viên của khóa học mới có quyền thực hiện."
  },

  // Order, Voucher, Payment Codes
  ORDER_ITEMS_REQUIRED: {
    title: "Giỏ hàng trống",
    message: "Đơn hàng phải chứa ít nhất một khóa học."
  },
  VOUCHER_INVALID: {
    title: "Mã giảm giá sai",
    message: "Mã giảm giá không tồn tại hoặc không hợp lệ."
  },
  VOUCHER_EXPIRED: {
    title: "Mã giảm giá hết hạn",
    message: "Mã giảm giá này đã hết hạn sử dụng."
  },
  VOUCHER_NOT_ACTIVE: {
    title: "Mã giảm giá chưa hoạt động",
    message: "Mã giảm giá chưa đến thời gian bắt đầu áp dụng."
  },
  VOUCHER_MIN_PURCHASE_NOT_MET: {
    title: "Đơn hàng chưa đạt tối thiểu",
    message: "Giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã giảm giá này."
  },
  VOUCHER_OUT_OF_STOCK: {
    title: "Mã giảm giá đã hết",
    message: "Số lượng mã giảm giá này đã được sử dụng hết."
  },
  PAYMENT_ALREADY_PAID: {
    title: "Đơn hàng đã thanh toán",
    message: "Giao dịch này đã được thanh toán hoàn tất trước đó."
  },

  // Cart, Social, Certificate, Learning Path Codes
  CART_ITEM_ALREADY_EXISTS: {
    title: "Đã có trong giỏ hàng",
    message: "Khóa học này đã nằm trong giỏ hàng của bạn."
  },
  ALREADY_UPVOTED: {
    title: "Đã bình chọn",
    message: "Bạn đã thích hoặc bình chọn cho mục này rồi."
  },
  ASSIGNMENT_ALREADY_SUBMITTED: {
    title: "Bài tập đã nộp",
    message: "Bài tập này đã được nộp và không thể thay đổi."
  },
  CERTIFICATE_ALREADY_APPLIED: {
    title: "Đã đăng ký chứng chỉ",
    message: "Yêu cầu cấp chứng chỉ này đã được gửi trước đó."
  },
  CERTIFICATE_NOT_AVAILABLE: {
    title: "Chứng chỉ chưa sẵn sàng",
    message: "Chưa đủ điều kiện để nhận chứng chỉ khóa học."
  },
  COURSE_NOT_COMPLETED: {
    title: "Chưa hoàn thành khóa học",
    message: "Bạn cần hoàn thành tất cả các bài học trước khi đăng ký chứng chỉ."
  },
  CERTIFICATE_REQUEST_NOT_PENDING: {
    title: "Yêu cầu không ở trạng thái chờ",
    message: "Yêu cầu cấp chứng chỉ này đã được phê duyệt hoặc từ chối."
  },
  LEARNING_PATH_ALREADY_ACTIVE: {
    title: "Lộ trình đã kích hoạt",
    message: "Lộ trình học tập này hiện đã được kích hoạt."
  },

  // Quiz Codes
  QUIZ_REVIEW_NOT_ALLOWED: {
    title: "Không được xem lại",
    message: "Cấu hình trắc nghiệm không cho phép xem lại bài làm."
  },
  QUIZ_SESSION_ALREADY_IN_PROGRESS: {
    title: "Đang làm bài trắc nghiệm",
    message: "Bạn có một phiên làm bài trắc nghiệm đang diễn ra."
  },
  QUIZ_ATTEMPT_LIMIT_REACHED: {
    title: "Hết lượt làm bài",
    message: "Bạn đã vượt quá số lần làm bài trắc nghiệm tối đa cho phép."
  },
  QUIZ_SESSION_NOT_IN_PROGRESS: {
    title: "Không có phiên làm bài",
    message: "Không có phiên làm bài trắc nghiệm nào đang chạy."
  },
  QUIZ_SESSION_EXPIRED: {
    title: "Bài trắc nghiệm hết giờ",
    message: "Thời gian làm bài đã hết, không thể nộp bài tiếp."
  },
  QUIZ_SESSION_NOT_PENDING_GRADING: {
    title: "Lỗi chấm điểm",
    message: "Bài trắc nghiệm không ở trạng thái chờ chấm điểm thủ công."
  },
  QUIZ_ANSWER_INVALID: {
    title: "Đáp án không hợp lệ",
    message: "Câu trả lời trắc nghiệm không đúng cấu trúc yêu cầu."
  },
  QUIZ_ESSAY_SCORE_INVALID: {
    title: "Điểm tự luận sai",
    message: "Điểm chấm cho câu tự luận nằm ngoài thang điểm cho phép."
  },
  QUIZ_CONFIGURATION_INVALID: {
    title: "Cấu hình trắc nghiệm lỗi",
    message: "Thiết lập bài trắc nghiệm chưa đầy đủ hoặc không hợp lệ."
  },

  // Lesson, Video, Subtitle Codes
  LESSON_ORDER_INVALID: {
    title: "Thứ tự bài học sai",
    message: "Thứ tự các bài học trong chương không hợp lệ."
  },
  LESSON_PREREQUISITE_INVALID: {
    title: "Điều kiện bài học sai",
    message: "Bài học điều kiện tiên quyết không tồn tại hoặc không hợp lệ."
  },
  LESSON_PREREQUISITE_CYCLE: {
    title: "Lỗi vòng lặp bài học",
    message: "Phát hiện vòng lặp vô hạn trong điều kiện tiên quyết các bài học."
  },
  LESSON_TYPE_INVALID: {
    title: "Loại bài học sai",
    message: "Loại bài học được cấu hình không hợp lệ."
  },
  VIDEO_POSITION_INVALID: {
    title: "Vị trí video sai",
    message: "Thời lượng video đã xem không đúng định dạng."
  },
  VIDEO_QUESTION_ANSWER_INCORRECT: {
    title: "Đáp án video sai",
    message: "Câu trả lời cho câu hỏi trong video chưa chính xác."
  },
  VIDEO_QUESTION_TIMESTAMP_INVALID: {
    title: "Thời gian câu hỏi video sai",
    message: "Vị trí đặt câu hỏi vượt quá tổng thời lượng video."
  },
  SUBTITLE_INVALID: {
    title: "Phụ đề không hợp lệ",
    message: "Thông tin metadata của phụ đề không đúng cấu trúc."
  },
  SUBTITLE_FILE_UNSUPPORTED: {
    title: "Định dạng phụ đề sai",
    message: "File phụ đề tải lên không được hỗ trợ (chỉ chấp nhận .vtt, .srt)."
  },
  SUBTITLE_FILE_INVALID: {
    title: "File phụ đề lỗi",
    message: "Đọc file phụ đề thất bại hoặc dữ liệu bên trong bị lỗi."
  },
  SUBTITLE_FILE_TOO_LARGE: {
    title: "File phụ đề quá lớn",
    message: "Kích thước file phụ đề vượt quá dung lượng cho phép."
  },

  // Ownership Codes
  NOT_RESOURCE_OWNER: {
    title: "Không phải chủ sở hữu",
    message: "Bạn không thể sửa đổi tài nguyên do người khác sở hữu."
  }
}

export function parseApiError(error: unknown): { title: string; message: string; details?: React.ReactNode } {
  let title = "Có lỗi xảy ra"
  let message = "Vui lòng liên hệ quản trị viên hoặc thử lại sau."
  let details: React.ReactNode = undefined

  if (error instanceof AxiosError) {
    const data = error.response?.data as ProblemDetail | undefined

    if (data) {
      // 1. If it has a specific CINX error code
      if (data.code && ERROR_CODE_MAP[data.code]) {
        const mapped = ERROR_CODE_MAP[data.code]
        title = mapped.title
        // Use backend detail if it's a specific message, otherwise use mapped description
        message = data.detail && data.detail !== data.code ? data.detail : mapped.message
      } else if (data.title || data.detail) {
        // 2. Standard ProblemDetail fallback
        title = data.title || title
        message = data.detail || message
      } else if (data.message) {
        message = data.message
      }

      // 3. Special handling for VALIDATION_FAILED and fields list
      if (data.code === "VALIDATION_FAILED" && data.errors && data.errors.length > 0) {
        details = (
          <ul className="mt-1.5 list-disc list-inside space-y-0.5 text-xs text-muted-foreground opacity-90 pl-1">
            {data.errors.map((err, index) => (
              <li key={index}>
                <span className="font-semibold text-foreground">{err.field}</span>: {err.message}
              </li>
            ))}
          </ul>
        )
      }
    } else {
      // Network error or standard HTTP response
      if (error.response?.status) {
        const status = error.response.status
        if (status === 400) {
          title = ERROR_CODE_MAP.BAD_REQUEST.title
          message = ERROR_CODE_MAP.BAD_REQUEST.message
        } else if (status === 403) {
          title = ERROR_CODE_MAP.FORBIDDEN.title
          message = ERROR_CODE_MAP.FORBIDDEN.message
        } else if (status === 404) {
          title = ERROR_CODE_MAP.RESOURCE_NOT_FOUND.title
          message = ERROR_CODE_MAP.RESOURCE_NOT_FOUND.message
        } else if (status >= 500) {
          title = ERROR_CODE_MAP.INTERNAL_ERROR.title
          message = ERROR_CODE_MAP.INTERNAL_ERROR.message
        }
      } else {
        message = error.message || message
      }
    }
  } else if (error instanceof Error) {
    message = error.message
  } else if (typeof error === "string") {
    message = error
  }

  return { title, message, details }
}

export function showErrorToast(error: unknown) {
  const { title, message, details } = parseApiError(error)

  toast.error(title, {
    description: (
      <div>
        <p className="text-sm font-normal text-muted-foreground">{message}</p>
        {details}
      </div>
    ),
    duration: 5000,
    position: "top-right"
  })
}
