import type { CourseResponse } from "./courseApi";

export interface UpdateVoucherRequest {
  code?: string;
  discountAmount?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  description?: string;
  quantity?: number;
  validFrom?: string;
  validTo?: string;
}

export interface OrderDetailResponse {
  id?: string;
  userId?: string;
  items?: OrderItemResponse[];
  totalPrice?: number;
  discounted?: number;
  orderDate?: string;
  status?: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  paymentMethod?: "VN_PAY" | "MOMO";
  payment?: PaymentResponse;
  voucher?: VoucherResponse;
}

export interface OrderItemResponse {
  id?: string;
  courseId?: string;
  title?: string;
  price?: number;
  discountedPrice?: number;
}

export interface PaymentResponse {
  id?: string;
  orderId?: string;
  amount?: number;
  status?: "PROCESSING" | "PAID" | "CANCELLED" | "REFUNDED";
  paymentDate?: string;
  paymentInfo?: string;
  paymentMessage?: string;
}

export interface VoucherResponse {
  id?: string;
  code?: string;
  discountAmount?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  description?: string;
  quantity?: number;
  validFrom?: string;
  validTo?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVoucherRequest {
  code: string;
  discountAmount: number;
  minPurchaseAmount: number;
  maxDiscountAmount: number;
  description?: string;
  quantity: number;
  validFrom: string;
  validTo: string;
}

export interface CartItemDto {
  id: string;
  course: CourseResponse;
}

export interface CreateOrderRequest {
  cartItems: CartItemDto[];
  paymentMethod: "VN_PAY" | "MOMO";
  voucherCode?: string;
}

export interface OrderResponse {
  id?: string;
  userId?: string;
  items?: OrderItemResponse[];
  totalPrice?: number;
  discounted?: number;
  orderDate?: string;
  status?: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
  paymentMethod?: "VN_PAY" | "MOMO";
}

export interface CheckEnrollmentStatus {
  courseId?: string;
  isEnrolled?: boolean;
}

export interface CourseStats {
  courseId?: string;
  title?: string;
  enrollmentCount?: number;
}

export interface InstructorStatisticsResponse {
  totalGrossRevenue?: number;
  totalNetRevenue?: number;
  revenueByTime?: RevenueByTimeResponse[];
  topCourses?: CourseStats[];
}

export interface RevenueByTimeResponse {
  timeLabel?: string;
  grossRevenue?: number;
  netRevenue?: number;
}

export interface CourseStatisticsResponse {
  totalGrossRevenue?: number;
  totalNetRevenue?: number;
  revenueByTime?: RevenueByTimeResponse[];
}

export interface DashboardMetricsResponse {
  totalRevenue?: number;
  totalUsers?: number;
  newUsersThisMonth?: number;
  topEnrolledCourses?: CourseStats[];
  paidOrdersThisMonth?: number;
}

export interface AdminOverviewResponse {
  totalGrossRevenue?: number;
  totalPlatformFeeRevenue?: number;
  totalOrders?: number;
  platformRevenueByTime?: RevenueByTimeResponse[];
  topCourses?: CourseStats[];
}

export interface CourseRevenueResponse {
  courseId?: string;
  title?: string;
  enrollmentCount?: number;
  revenue?: number;
}

export interface InstructorRevenueResponse {
  totalRevenue?: number;
  revenueByMonth?: RevenueByTimeResponse[];
  courseRevenues?: CourseRevenueResponse[];
}

export interface UserEnrollmentSummaryResponse {
  enrolledCourseCount?: number;
  totalSpent?: number;
  paidOrderCount?: number;
}
