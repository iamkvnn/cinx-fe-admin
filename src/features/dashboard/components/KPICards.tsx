import { DollarSign, TrendingUp, Users, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "0 ₫"
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return "0"
  return val.toLocaleString('vi-VN')
}

interface KPICardsProps {
  platformOverview?: {
    totalGrossRevenue?: number
    totalPlatformFeeRevenue?: number
  }
  userOverview?: {
    currentTotalUsers?: number
  }
  courseOverview?: {
    currentPublishedCount?: number
  }
  totalCourses: number
}

export function KPICards({
  platformOverview,
  userOverview,
  courseOverview,
  totalCourses,
}: KPICardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu gộp</CardTitle>
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-md">
            <DollarSign className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(platformOverview?.totalGrossRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Tổng giá trị tất cả giao dịch học viên mua</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Phí nền tảng thu về</CardTitle>
          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-md">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(platformOverview?.totalPlatformFeeRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">Lợi nhuận ròng của hệ thống (phí trung gian)</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tổng số người dùng</CardTitle>
          <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-md">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(userOverview?.currentTotalUsers)}</div>
          <p className="text-xs text-muted-foreground mt-1">Học viên, giảng viên và admin hiện có</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Khóa học xuất bản</CardTitle>
          <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-md">
            <BookOpen className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(courseOverview?.currentPublishedCount)}</div>
          <p className="text-xs text-muted-foreground mt-1">Trên tổng số {formatNumber(totalCourses)} khóa học đã tạo</p>
        </CardContent>
      </Card>
    </div>
  )
}
