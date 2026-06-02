// --- Types for Social & Social Admin API Docs (API Doc - Social) ---

export interface WishlistItemResponse {
  id?: string
  userId?: string
  courseId?: string
}

export interface AddToWishlistRequest {
  courseId: string
}

export interface ReviewReactionResponse {
  id?: string
  userId?: string
  reviewId?: string
  liked?: boolean
}

export interface ReviewReplyDto {
  id?: string
  reviewId?: string
  instructorId?: string
  content?: string
  createdAt?: string
  updatedAt?: string
}

export interface ReviewResponse {
  id?: string
  userId?: string
  courseId?: string
  content?: string
  rating?: number
  reply?: ReviewReplyDto
  reactions?: ReviewReactionResponse[]
}

export interface QuestionDto {
  id?: string
  courseId?: string
  lessonId?: string
  userId?: string
  title?: string
  content?: string
  upvoteCount?: number
  hasUpvoted?: boolean
  answersCount?: number
  createdAt?: string
}

export interface AnswerDto {
  id?: string
  questionId?: string
  parentAnswerId?: string
  userId?: string
  content?: string
  isInstructorAnswer?: boolean
  upvoteCount?: number
  hasUpvoted?: boolean
  depth?: number
  repliesCount?: number
  createdAt?: string
}

export interface Report {
  id?: string
  version?: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
  reporterId?: string
  refId?: string
  type?: "REVIEW" | "QUESTION" | "ANSWER"
  reason?: string
}

// --- Request DTOs ---

export interface UpdateReviewRequest {
  content: string
  rating: number
}

export interface UpdateReviewReplyRequest {
  content: string
}

export interface UpdateQuestionRequest {
  title: string
  content: string
}

export interface UpdateAnswerRequest {
  content: string
}

export interface CreateReviewRequest {
  courseId: string
  content: string
  rating: number
}

export interface CreateReportReviewRequest {
  reason: string
}

export interface CreateReviewReplyRequest {
  content: string
}

export interface CreateReviewReactionRequest {
  liked: boolean
}

export interface CreateQuestionRequest {
  courseId: string
  lessonId?: string
  title: string
  content: string
}

export interface CreateQnAReportRequest {
  reason: string
}

export interface CreateAnswerRequest {
  questionId: string
  parentAnswerId?: string
  content: string
}
