import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedApiResponse, UserNotificationResponse } from "@/types"

// ==========================================
// Notification Services (notification-controller)
// ==========================================
export const notificationService = {
  toggleRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/api/v1/notifications/${notificationId}/toggle-read`)
    return response.data
  },
  testPushNotification: async (params: { title: string; body: string }): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>("/api/v1/notifications/test-push", null, { params })
    return response.data
  },
  testInAppNotification: async (params: {
    userId: string
    title: string
    body: string
  }): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>("/api/v1/notifications/test-in-app", null, { params })
    return response.data
  },
  getNotifications: async (params?: {
    page?: number
    size?: number
    query?: string
    sort?: string
  }): Promise<PaginatedApiResponse<UserNotificationResponse>> => {
    const response = await api.get<PaginatedApiResponse<UserNotificationResponse>>("/api/v1/notifications", { params })
    return response.data
  },
  countUnreadNotifications: async (): Promise<ApiResponse<number>> => {
    const response = await api.get<ApiResponse<number>>("/api/v1/notifications/unread-count")
    return response.data
  },
  deleteNotification: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/api/v1/notifications/${notificationId}`)
    return response.data
  },
}
