import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, BookOpen, Users, Star, DollarSign, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { UserService, AdminInstructorService, StatisticsService, AdminCourseService } from "@/services"
import { Skeleton } from "@/components/ui/skeleton"
import { StatusBadge, getCourseDisplayStatus } from "@/features/courses/components/StatusBadge"

export function InstructorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 1. Fetch Instructor Profile Info
  const { data: instructorData, isLoading: isLoadingInstructor } = useQuery({
    queryKey: ['instructor-detail', id],
    queryFn: () => UserService.getUserById({ id: id as string }),
    enabled: !!id
  })

  // 2. Fetch Instructor Course Summary
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['instructor-summary', id],
    queryFn: () => AdminInstructorService.getCourseSummary({ instructorId: id as string }),
    enabled: !!id
  })

  // 3. Fetch Instructor Revenue Analytics
  const { data: revenueAnalyticsData, isLoading: isLoadingRevenue } = useQuery({
    queryKey: ['instructor-revenue', id],
    queryFn: () => StatisticsService.getInstructorRevenueSeries({ instructorId: id as string, groupBy: 'MONTH' }),
    enabled: !!id
  })

  // 4. Fetch Instructor's Course List
  const { data: courseListData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['instructor-courses', id],
    queryFn: () => AdminCourseService.getAllCourses_1({ instructorId: id as string }),
    enabled: !!id
  })

  const instructor = instructorData?.data
  const courseSummary = summaryData?.data
  const revenueAnalytics = revenueAnalyticsData?.data
  const coursesList = courseListData?.data ?? []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(number)
  }

  // Format revenue chart data
  const formattedRevenueData = React.useMemo(() => {
    const last12Months: { month: string; revenue: number }[] = []
    const now = new Date()
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
      last12Months.push({ month: label, revenue: 0 })
    }

    if (revenueAnalytics?.revenueByMonth && Array.isArray(revenueAnalytics.revenueByMonth)) {
      revenueAnalytics.revenueByMonth.forEach((item: any) => {
        if (!item) return
        const rawLabel = item.timeLabel || ""
        let monthKey = ""
        if (rawLabel.includes("-")) {
          const parts = rawLabel.split("-")
          if (parts.length >= 2) {
            monthKey = `${parts[1].padStart(2, '0')}/${parts[0]}`
          }
        } else if (rawLabel.includes("/")) {
          const parts = rawLabel.split("/")
          if (parts.length >= 2) {
            monthKey = `${parts[0].padStart(2, '0')}/${parts[1]}`
          }
        }
        
        const existing = last12Months.find(m => m.month === monthKey || m.month === rawLabel)
        const revenue = item.grossRevenue || 0
        if (existing) {
          existing.revenue = revenue
        }
      })
    }
    return last12Months
  }, [revenueAnalytics])

  const isAnyLoading = isLoadingInstructor || isLoadingSummary || isLoadingRevenue || isLoadingCourses

  // Render Skeleton UI while loading
  if (isAnyLoading) {
    return (
      <div className="space-y-6 pb-12">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-md border">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Button variant="ghost" size="icon" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 w-full">
              <Skeleton className="h-14 w-14 rounded-full shrink-0" />
              <div className="space-y-2 w-48">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
          <div className="space-y-2 w-36 self-end sm:self-auto">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        {/* Bio Card Skeleton */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>

        {/* Metrics Overview Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1 w-full flex flex-col items-center">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="w-full space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
          <Card>
            <CardHeader className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center gap-3 w-1/2">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!instructor) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin giảng viên</div>

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-md border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/instructors')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center font-semibold text-lg">
              {instructor.avatarUrl ? (
                <img src={instructor.avatarUrl} alt={instructor.name} className="h-full w-full object-cover" />
              ) : (
                instructor.name?.charAt(0) || "I"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                {instructor.name}
                <Badge variant={instructor.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className={instructor.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600 text-[10px] h-5' : 'text-[10px] h-5'}>
                  {instructor.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
                </Badge>
              </h2>
              <div className="text-sm text-muted-foreground mt-0.5">
                {instructor.email} {instructor.phoneNumber ? `• ${instructor.phoneNumber}` : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground hidden sm:block">
          <p>Hợp tác từ: <span className="font-medium text-foreground">{instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString('vi-VN') : "N/A"}</span></p>
        </div>
      </div>

      {/* Bio Card */}
      {instructor.bio && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-1 text-sm text-muted-foreground">Giới thiệu:</h3>
            <p className="text-sm leading-relaxed">{instructor.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng khóa học</p>
              <h3 className="text-xl font-bold">{courseSummary?.courseCount ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Học viên</p>
              <h3 className="text-xl font-bold">
                {formatCompactNumber(coursesList.reduce((acc: number, c: any) => acc + (c.enrollmentCount || 0), 0))}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Đánh giá TB</p>
              <h3 className="text-xl font-bold flex items-center justify-center gap-1">
                {courseSummary?.averageRating ? Math.round(courseSummary.averageRating * 10) / 10 : 0}
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Khóa đã xuất bản</p>
              <h3 className="text-xl font-bold">{courseSummary?.publishedCourseCount ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1 lg:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng doanh thu</p>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-500">
                {formatCompactNumber(revenueAnalytics?.totalRevenue ?? 0)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Khóa học của Giảng viên</TabsTrigger>
          <TabsTrigger value="revenue">Phân tích Doanh thu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách khóa học</CardTitle>
              <CardDescription>Tất cả khóa học do giảng viên này phụ trách.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Học viên</TableHead>
                    <TableHead className="text-right">Đánh giá</TableHead>
                    <TableHead className="text-right">Doanh thu ước tính</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Giảng viên này chưa tạo khóa học nào.</TableCell>
                    </TableRow>
                  ) : (
                    coursesList.map((course: any) => {
                      // Lookup revenue details for this course if available
                      const courseRevenue = revenueAnalytics?.courseRevenues?.find((cr: any) => cr.courseId === course.id);
                      return (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                                {course.images && course.images.length > 0 && (
                                  <img src={course.images[0].imageUrl} alt={course.title} className="w-full h-full object-cover" />
                                )}
                              </div>
                              <span className="font-medium cursor-pointer hover:underline text-primary" onClick={() => navigate(`/courses/${course.id}`)}>
                                {course.title}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={getCourseDisplayStatus(course)} />
                          </TableCell>
                          <TableCell className="text-right">{(course.enrollmentCount ?? 0).toLocaleString('vi-VN')}</TableCell>
                          <TableCell className="text-right">
                            {course.rating > 0 ? (
                              <div className="flex items-center justify-end gap-1">
                                {Math.round(course.rating * 10) / 10} <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(courseRevenue?.revenue ?? 0)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ Doanh thu (12 tháng gần nhất)</CardTitle>
              <CardDescription>Biến động doanh thu đem lại từ các khóa học của giảng viên.</CardDescription>
            </CardHeader>
            <CardContent>
              {!revenueAnalytics?.revenueByMonth || revenueAnalytics.revenueByMonth.length === 0 ? (
                <div className="text-center py-3 bg-muted/40 rounded-md border border-dashed text-sm text-muted-foreground mb-4">
                  Giảng viên chưa phát sinh doanh thu. Dưới đây là biểu đồ doanh thu mặc định (0 ₫).
                </div>
              ) : null}
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedRevenueData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value / 1000000}M`}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]}
                      cursor={{ stroke: 'rgba(0, 0, 0, 0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                      itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
