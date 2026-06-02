import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, BookOpen, Clock, CreditCard, Award, TrendingUp, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { UserService, AdminEnrollmentService, AdminLearningService, OrderService } from "@/services"
import { Skeleton } from "@/components/ui/skeleton"
import * as React from "react"

export function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 1. Fetch User Profile
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-detail', id],
    queryFn: () => UserService.getUserById({ id: id as string }),
    enabled: !!id
  })

  // 2. Fetch User Enrollment Summary
  const { data: enrollmentSummaryData, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: ['user-enrollment-summary', id],
    queryFn: () => AdminEnrollmentService.getUserSummary({ userId: id as string }),
    enabled: !!id
  })

  // 3. Fetch User Learning Summary
  const { data: learningSummaryData, isLoading: isLoadingLearning } = useQuery({
    queryKey: ['user-learning-summary', id],
    queryFn: () => AdminLearningService.getUserSummary({ userId: id as string }),
    enabled: !!id
  })

  // 4. Fetch User Activity (for chart)
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['user-activity', id],
    queryFn: () => AdminLearningService.getUserActivity({ userId: id as string, months: 6 }),
    enabled: !!id
  })

  // 5. Fetch User Orders (to extract real courses)
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['user-orders', id],
    queryFn: () => OrderService.getOrders({ size: 1000 }),
    enabled: !!id
  })

  // Extract real courses from user's orders
  const userCourses = React.useMemo(() => {
    if (!ordersData?.data || !Array.isArray(ordersData.data)) return []
    
    const coursesMap = new Map<string, any>()
    ordersData.data.forEach((order: any) => {
      // Check if order belongs to the user and is PAID
      if (order.userId === id && order.status === "PAID") {
        order.items?.forEach((item: any) => {
          if (item.courseId && !coursesMap.has(item.courseId)) {
            coursesMap.set(item.courseId, {
              id: item.courseId,
              title: item.title || "Khóa học không rõ tên",
              price: item.price,
              discountedPrice: item.discountedPrice,
              orderDate: order.orderDate
            })
          }
        })
      }
    })
    return Array.from(coursesMap.values())
  }, [ordersData, id])

  const user = userData?.data
  const enrollmentSummary = enrollmentSummaryData?.data
  const learningSummary = learningSummaryData?.data

  // Format activity chart data
  const formattedActivity = activityData?.data && Array.isArray(activityData.data)
    ? activityData.data.map((item: any) => ({
        month: item.month || "",
        hours: Math.round((item.activeSeconds || 0) / 3600 * 10) / 10
      }))
    : []

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa từng truy cập"
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const isAnyLoading = isLoadingUser || isLoadingEnrollment || isLoadingLearning || isLoadingActivity || isLoadingOrders

  // Render Skeleton Screen
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
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="space-y-2 w-48">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
          <div className="space-y-2 w-36 self-end sm:self-auto">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>

        {/* Metrics Overview Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
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

  if (!user) return <div className="p-8 text-center text-muted-foreground">Không tìm thấy thông tin học viên</div>

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-md border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center text-foreground font-semibold">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                user.name?.charAt(0) || "U"
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                {user.name}
                <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'} 
                  className={user.status === 'ACTIVE' ? 'bg-green-500 hover:bg-green-600 text-[10px] h-5' : user.status === 'BANNED' ? 'bg-red-500 hover:bg-red-600 text-[10px] h-5' : 'text-[10px] h-5'}>
                  {user.status === 'ACTIVE' ? 'Hoạt động' : user.status === 'BANNED' ? 'Đã khóa' : user.status}
                </Badge>
              </h2>
              <div className="text-sm text-muted-foreground mt-0.5">
                {user.email} {user.phoneNumber ? `• ${user.phoneNumber}` : ""}
              </div>
            </div>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Tham gia: <span className="font-medium text-foreground">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : "N/A"}</span></p>
          <p>Lần cuối truy cập: <span className="font-medium text-foreground">{formatDate(user.lastAccessAt)}</span></p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Khóa đã tham gia</p>
              <h3 className="text-xl font-bold">{enrollmentSummary?.enrolledCourseCount ?? 0}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Khóa hoàn thành</p>
              <h3 className="text-xl font-bold">{learningSummary?.completedCourseCount ?? 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng giờ học</p>
              <h3 className="text-xl font-bold">{Math.round((learningSummary?.totalLearningSeconds ?? 0) / 3600)}h</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tiến độ TB</p>
              <h3 className="text-xl font-bold">{learningSummary?.averageProgressPercent ?? 0}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1 lg:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
              <h3 className="text-xl font-bold">{formatCurrency(enrollmentSummary?.totalSpent ?? 0)}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1 lg:col-span-1">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Điểm XP</p>
              <h3 className="text-xl font-bold text-orange-600">{user.xp ?? 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">Khóa học đã mua</TabsTrigger>
          <TabsTrigger value="activity">Hoạt động học tập</TabsTrigger>
        </TabsList>
        
        <TabsContent value="courses" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách khóa học đã mua</CardTitle>
              <CardDescription>Các khóa học học viên đã mua thông qua hóa đơn thành công.</CardDescription>
            </CardHeader>
            <CardContent>
              {userCourses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Học viên này chưa đăng ký khóa học nào.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Khóa học</TableHead>
                      <TableHead className="text-right">Giá gốc</TableHead>
                      <TableHead className="text-right">Giá đã mua</TableHead>
                      <TableHead className="text-right">Ngày mua</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="font-medium hover:underline text-primary cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                              {course.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatCurrency(course.price ?? 0)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(course.discountedPrice ?? course.price ?? 0)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground text-sm">
                          {formatDate(course.orderDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="outline-none">
          <Card>
            <CardHeader>
              <CardTitle>Biểu đồ thời gian học tập</CardTitle>
              <CardDescription>Tổng số giờ học viên đã dành ra để học trong 6 tháng qua.</CardDescription>
            </CardHeader>
            <CardContent>
              {formattedActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">Không có dữ liệu hoạt động học tập.</div>
              ) : (
                <div className="h-[350px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="hours" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                        name="Giờ học"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
