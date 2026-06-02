export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedMetadata {
  page: number
  limit: number
  totalElements: number
  totalPages: number
}

export interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta: PaginatedMetadata
}
