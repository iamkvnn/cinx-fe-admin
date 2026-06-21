import { ShoppingBag, Award, Activity, Users } from "lucide-react"
import {
  Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "0 ₫"
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return "0"
  return val.toLocaleString('vi-VN')
}

interface FinancialsTabProps {
  platformOverview?: {
    totalOrders?: number
    paidOrdersInRange?: number
    distinctLearnersInRange?: number
    topCoursesByRevenue?: Array<{
      courseId?: string
      title?: string
      revenue?: number
    }>
  }
  revenueChartData: Array<{
    name: string
    "Doanh thu gộp": number
    "Phí hệ thống": number
  }>
  paymentRate: number
}

export function FinancialsTab({
  platformOverview,
  revenueChartData,
  paymentRate,
}: FinancialsTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tổng số đơn hàng</p>
              <h4 className="text-xl font-bold mt-1">{formatNumber(platformOverview?.totalOrders)}</h4>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-full">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Đơn hàng thành công</p>
              <h4 className="text-xl font-bold mt-1">{formatNumber(platformOverview?.paidOrdersInRange)}</h4>
            </div>
            <div className="p-2 bg-green-50 dark:bg-green-900/10 text-green-600 rounded-full">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Tỷ lệ thanh toán</p>
              <h4 className="text-xl font-bold mt-1">{paymentRate}%</h4>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/10 text-amber-600 rounded-full">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Học viên mua học</p>
              <h4 className="text-xl font-bold mt-1">{formatNumber(platformOverview?.distinctLearnersInRange)}</h4>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-full">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biến động Doanh thu hệ thống</CardTitle>
            <CardDescription>Doanh thu gộp (tất cả khóa học) và doanh thu thực từ phí nền tảng.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {revenueChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu thời gian.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="grossColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.685 0.169 237.323)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.685 0.169 237.323)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val)), ""]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="Doanh thu gộp" stroke="var(--primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#grossColor)" />
                  <Area type="monotone" dataKey="Phí hệ thống" stroke="oklch(0.685 0.169 237.323)" strokeWidth={2.5} fillOpacity={1} fill="url(#netColor)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Khóa học theo Doanh thu</CardTitle>
            <CardDescription>Các khóa học đem lại giá trị doanh thu cao nhất cho nền tảng.</CardDescription>
          </CardHeader>
          <CardContent>
            {!platformOverview?.topCoursesByRevenue || platformOverview.topCoursesByRevenue.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Chưa ghi nhận doanh thu khóa học.</div>
            ) : (
              <div className="space-y-4">
                {platformOverview.topCoursesByRevenue.map((course, idx) => (
                  <div key={course.courseId || idx} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-6 h-6 flex items-center justify-center font-bold text-xs bg-muted text-muted-foreground rounded-full">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={course.title}>
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(Number(course.revenue))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
