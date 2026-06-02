import { api } from "@/lib/axios"
import type {
  ApiResponse,
  PaginatedApiResponse,
  ReviewResponse,
  UpdateReviewRequest,
  UpdateReviewReplyRequest,
  CreateReviewRequest,
  CreateReportReviewRequest,
  CreateReviewReplyRequest,
  CreateReviewReactionRequest,
  QuestionDto,
  AnswerDto,
  UpdateQuestionRequest,
  UpdateAnswerRequest,
  CreateQuestionRequest,
  CreateQnAReportRequest,
  CreateAnswerRequest,
  WishlistItemResponse,
  AddToWishlistRequest,
  Report,
} from "@/types"

// ==========================================
// 1. Review Services (review-controller)
// ==========================================
export const reviewService = {
  updateReview: async (reviewId: string, data: UpdateReviewRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.put<ApiResponse<unknown>>(`/api/v1/reviews/${reviewId}`, data)
    return response.data
  },
  deleteReview: async (reviewId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.delete<ApiResponse<unknown>>(`/api/v1/reviews/${reviewId}`)
    return response.data
  },
  updateReviewReply: async (replyId: string, data: UpdateReviewReplyRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.put<ApiResponse<unknown>>(`/api/v1/reviews/replies/${replyId}`, data)
    return response.data
  },
  deleteReviewReply: async (replyId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.delete<ApiResponse<unknown>>(`/api/v1/reviews/replies/${replyId}`)
    return response.data
  },
  getReviewsByCourseId: async (params: {
    courseId: string
    page?: number
    size?: number
    sort?: string
  }): Promise<PaginatedApiResponse<ReviewResponse>> => {
    const response = await api.get<PaginatedApiResponse<ReviewResponse>>("/api/v1/reviews", { params })
    return response.data
  },
  createReview: async (data: CreateReviewRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>("/api/v1/reviews", data)
    return response.data
  },
  reportReview: async (reviewId: string, data: CreateReportReviewRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>(`/api/v1/reviews/${reviewId}/report`, data)
    return response.data
  },
  createReviewReply: async (reviewId: string, data: CreateReviewReplyRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>(`/api/v1/reviews/${reviewId}/replies`, data)
    return response.data
  },
  reactReview: async (reviewId: string, data: CreateReviewReactionRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>(`/api/v1/reviews/${reviewId}/react`, data)
    return response.data
  },
}

// ==========================================
// 2. QnA Services (course-qn-a-controller)
// ==========================================
export const courseQnaService = {
  getQuestionById: async (questionId: string): Promise<ApiResponse<QuestionDto>> => {
    const response = await api.get<ApiResponse<QuestionDto>>(`/api/v1/course-qna/questions/${questionId}`)
    return response.data
  },
  updateQuestion: async (questionId: string, data: UpdateQuestionRequest): Promise<ApiResponse<QuestionDto>> => {
    const response = await api.put<ApiResponse<QuestionDto>>(`/api/v1/course-qna/questions/${questionId}`, data)
    return response.data
  },
  deleteQuestion: async (questionId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/course-qna/questions/${questionId}`)
    return response.data
  },
  updateAnswer: async (answerId: string, data: UpdateAnswerRequest): Promise<ApiResponse<AnswerDto>> => {
    const response = await api.put<ApiResponse<AnswerDto>>(`/api/v1/course-qna/answers/${answerId}`, data)
    return response.data
  },
  deleteAnswer: async (answerId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/course-qna/answers/${answerId}`)
    return response.data
  },
  getQuestions: async (params: {
    courseId: string
    lessonId?: string
    page?: number
    size?: number
    sort?: string
  }): Promise<PaginatedApiResponse<QuestionDto>> => {
    const response = await api.get<PaginatedApiResponse<QuestionDto>>("/api/v1/course-qna/questions", { params })
    return response.data
  },
  createQuestion: async (data: CreateQuestionRequest): Promise<ApiResponse<QuestionDto>> => {
    const response = await api.post<ApiResponse<QuestionDto>>("/api/v1/course-qna/questions", data)
    return response.data
  },
  upvoteQuestion: async (questionId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/api/v1/course-qna/questions/${questionId}/upvote`)
    return response.data
  },
  reportQuestion: async (questionId: string, data: CreateQnAReportRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/api/v1/course-qna/questions/${questionId}/report`, data)
    return response.data
  },
  createAnswer: async (data: CreateAnswerRequest): Promise<ApiResponse<AnswerDto>> => {
    const response = await api.post<ApiResponse<AnswerDto>>("/api/v1/course-qna/answers", data)
    return response.data
  },
  upvoteAnswer: async (answerId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/api/v1/course-qna/answers/${answerId}/upvote`)
    return response.data
  },
  reportAnswer: async (answerId: string, data: CreateQnAReportRequest): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/api/v1/course-qna/answers/${answerId}/report`, data)
    return response.data
  },
  getAnswersForQuestion: async (
    questionId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<PaginatedApiResponse<AnswerDto>> => {
    const response = await api.get<PaginatedApiResponse<AnswerDto>>(`/api/v1/course-qna/questions/${questionId}/answers`, { params })
    return response.data
  },
  getReplies: async (
    answerId: string,
    params?: { page?: number; size?: number; sort?: string }
  ): Promise<PaginatedApiResponse<AnswerDto>> => {
    const response = await api.get<PaginatedApiResponse<AnswerDto>>(`/api/v1/course-qna/answers/${answerId}/replies`, { params })
    return response.data
  },
}

// ==========================================
// 3. Wishlist Services (wishlist-controller)
// ==========================================
export const wishlistService = {
  getWishlist: async (): Promise<ApiResponse<WishlistItemResponse[]>> => {
    const response = await api.get<ApiResponse<WishlistItemResponse[]>>("/api/v1/wishlist")
    return response.data
  },
  addToWishlist: async (data: AddToWishlistRequest): Promise<ApiResponse<unknown>> => {
    const response = await api.post<ApiResponse<unknown>>("/api/v1/wishlist", data)
    return response.data
  },
  removeFromWishlist: async (courseId: string): Promise<ApiResponse<unknown>> => {
    const response = await api.delete<ApiResponse<unknown>>("/api/v1/wishlist", {
      params: { courseId },
    })
    return response.data
  },
}

// ==========================================
// 4. Admin Report Services (admin-report-controller)
// ==========================================
export const adminReportService = {
  getReports: async (params?: {
    type?: "REVIEW" | "QUESTION" | "ANSWER"
    page?: number
    size?: number
    sort?: string
  }): Promise<PaginatedApiResponse<Report>> => {
    const response = await api.get<PaginatedApiResponse<Report>>("/api/v1/reports", { params })
    return response.data
  },
  dismissReport: async (reportId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/reports/${reportId}/dismiss`)
    return response.data
  },
  deleteReportedContent: async (reportId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/reports/${reportId}/content`)
    return response.data
  },
}
