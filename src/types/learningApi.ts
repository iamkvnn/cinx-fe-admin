export interface UpdateVideoNoteRequest {
    content: string;
    videoTimestamp: number;
}

export interface VideoNoteDto {
    id?: string;
    userId?: string;
    courseId?: string;
    lessonId?: string;
    content?: string;
    videoTimestamp?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface SetDailyGoalRequest {
    goalType: "XP" | "LEARNING_ITEMS_COMPLETED" | "VIDEOS_COMPLETED" | "QUIZZES_PASSED" | "ASSIGNMENTS_SUBMITTED" | "SPECIFIC_LESSON_COMPLETED";
    targetValue?: number;
    goalDate?: string;
    targetItemId?: string;
}

export interface DailyGoalResponse {
    id?: string;
    userId?: string;
    goalType?: "XP" | "LEARNING_ITEMS_COMPLETED" | "VIDEOS_COMPLETED" | "QUIZZES_PASSED" | "ASSIGNMENTS_SUBMITTED" | "SPECIFIC_LESSON_COMPLETED";
    targetValue?: number;
    currentValue?: number;
    goalDate?: string;
    targetItemId?: string;
    isCompleted?: boolean;
}

export interface CertificateRequestResponse {
    id?: string;
    userId?: string;
    courseId?: string;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    certificateUrl?: string;
    requestedAt?: string;
    approvedAt?: string;
}

export interface EssayQuestionScore {
    questionId: string;
    score: number;
}

export interface GradeEssayRequest {
    scores: EssayQuestionScore[];
}

export interface QuizSessionResponse {
    id?: string;
    quizLessonId?: string;
    startTime?: string;
    endTime?: string;
    status?: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "PENDING_GRADE" | "NOT_ATTEMPTED";
    isReviewAllowed?: boolean;
    isShowAnswersOnReview?: boolean;
    quizSessionSubmission?: QuizSessionSubmissionResponse;
}

export interface QuizSessionSubmissionResponse {
    id?: string;
    userId?: string;
    submissionTime?: string;
    quizSessionId?: string;
    totalCorrectAnswers?: number;
    score?: number;
}

export interface ChooseQuizAnswerRequest {
    questionId: string;
    userAnswer: string;
}

export interface SubmitQuizSessionRequest {
    answers?: ChooseQuizAnswerRequest[];
}

export interface TrackingVideoLessonRequest {
    currentPosition: number;
}

export interface SubmitVideoQuestionRequest {
    videoAssessmentId: string;
    userAnswer: string;
}

export interface CreateVideoNoteRequest {
    content: string;
    videoTimestamp: number;
}

export interface AttachmentRequest {
    fileKey: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

export interface CreateAssignmentSubmissionRequest {
    content: string;
    attachments: AttachmentRequest[];
}

export interface LearningActivityRequest {
    courseId: string;
    itemId?: string;
    activeSeconds: number;
}

export interface LearningPathItemRequest {
    courseId?: string;
    lessonId?: string;
    orderIndex?: number;
    isSuggested?: boolean;
}

export interface LearningPathRequest {
    title?: string;
    description?: string;
    items?: LearningPathItemRequest[];
}

export interface LearningPathItemResponse {
    id?: string;
    courseId?: string;
    lessonId?: string;
    orderIndex?: number;
    isSuggested?: boolean;
    isCompleted?: boolean;
}

export interface LearningPathResponse {
    id?: string;
    userId?: string;
    title?: string;
    description?: string;
    status?: "PENDING_PAYMENT" | "ACTIVE" | "COMPLETED" | "DROPPED";
    currentProgress?: number;
    totalItems?: number;
    completedItems?: number;
    items?: LearningPathItemResponse[];
}

export interface UserStreakResponse {
    userId?: string;
    currentStreak?: number;
    highestStreak?: number;
    lastActivityDate?: string;
}

export interface QuizSessionOptionResponse {
    id?: string;
    optionText?: string;
    side?: string;
}

export interface QuizSessionQuestionResponse {
    id?: string;
    quizSessionId?: string;
    questionId?: string;
    questionType?: "SINGLE_CHOICE" | "MULTI_CHOICE" | "SHORT_TEXT" | "ORDERING" | "MATCHING" | "ESSAY";
    scoringMethod?: "ALL_OR_NOTHING" | "PARTIAL_CREDIT" | "NEGATIVE_MARK";
    questionOrder?: number;
    questionText?: string;
    userAnswer?: string;
    correctAnswer?: string;
    score?: number;
    options?: QuizSessionOptionResponse[];
}

export interface VideoLessonTrackingHistoryResponse {
    userId?: string;
    videoLessonId?: string;
    currentPosition?: number;
    lastTrackingTime?: string;
}

export interface InVideoAssessmentSubmissionResponse {
    videoLessonId?: string;
    videoAssessmentId?: string;
    userAnswer?: string;
    submissionTime?: string;
}

export interface QuizQuestionAnalyticsResponse {
    questionId?: string;
    totalAttempts?: number;
    correctAttempts?: number;
    accuracy?: number;
}

export interface CourseProgressResponse {
    id?: string;
    userId?: string;
    courseId?: string;
    isCompleted?: boolean;
    isPassed?: boolean;
    avgScore?: number;
    totalItems?: number;
    completedItems?: number;
    completionTime?: string;
}

export interface LearningItemProgressResponse {
    itemId?: string;
    isCompleted?: boolean;
    isPassed?: boolean;
    score?: number;
}

export interface AssignmentSubmissionAttachmentResponse {
    id?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    attachmentUrl?: string;
}

export interface AssignmentSubmissionResponse {
    id?: string;
    userId?: string;
    submissionTime?: string;
    assignmentId?: string;
    content?: string;
    score?: number;
    feedback?: string;
    attachments?: AssignmentSubmissionAttachmentResponse[];
}

export interface UserLearningSummaryResponse {
    completedCourseCount?: number;
    averageProgressPercent?: number;
    totalLearningSeconds?: number;
}

export interface LearningActivityByMonthResponse {
    month?: string;
    activeSeconds?: number;
}

export interface CourseProgressSummaryResponse {
    courseId?: string;
    studentCount?: number;
    completedStudentCount?: number;
    averageProgressPercent?: number;
    completionRate?: number;
}

export interface CoursesProgressSummaryResponse {
    totalStudentProgressCount?: number;
    completedStudentProgressCount?: number;
    completionRate?: number;
    courses?: CourseProgressSummaryResponse[];
}
