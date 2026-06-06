import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/features/auth/store/useAuthStore'
import { showErrorToast } from '@/utils/errorHandler'

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipToast?: boolean
  }
}

const BASE_URL = import.meta.env.VITE_API_URL || 'https://api.shiny.id.vn'

// ─── Main axios instance ────────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Separate instance for refresh (avoids interceptor loop) ────────────────
const refreshApi = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Queue management for concurrent requests during refresh ────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token as string)
    }
  })
  failedQueue = []
}

// ─── Request interceptor: attach access token ───────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: handle 401 → refresh token ──────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (error.response?.status !== 401 || originalRequest?._retry) {
      if (!originalRequest?.skipToast) {
        showErrorToast(error)
      }
      return Promise.reject(error)
    }

    const { refreshToken, setTokens, clearTokens } = useAuthStore.getState()

    // Nếu không có refresh token → logout ngay
    if (!refreshToken) {
      clearTokens()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Nếu đang trong quá trình refresh → xếp hàng chờ
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`
          }
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    // Bắt đầu refresh
    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await refreshApi.post<{
        data: { accessToken: string; refreshToken: string }
      }>('/api/v1/auth/refresh-token', { token: refreshToken })

      const newTokens = response.data.data
      setTokens(newTokens)
      processQueue(null, newTokens.accessToken)

      if (originalRequest.headers) {
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`
      }
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearTokens()
      if (!originalRequest?.skipToast) {
        showErrorToast(refreshError)
      }
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
