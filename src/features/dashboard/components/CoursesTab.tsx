import { BookOpen, Layers, CheckSquare } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const formatNumber = (val?: number) => {
  if (val === undefined || val === null) return "0"
  return val.toLocaleString('vi-VN')
}

interface CoursesTabProps {
  platformOverview?: {
    enrollmentsInRange?: number
    topCoursesByEnrollment?: Array<{
      courseId?: string
      title?: string
      enrollmentCount?: number
    }>
  }
  courseOverview?: {
    createdCoursesInRange?: number
    currentPublishedCount?: number
    currentCoursesByStatus?: Record<string, number>
  }
  enrollmentChartData: Array<{
    name: string
    "Lượt đăng ký": number
  }>
  courseChartData: Array<{
    name: string
    "Khóa học mới": number
  }>
  totalCourses: number
}

export function CoursesTab({
  platformOverview,
  courseOverview,
  enrollmentChartData,
  courseChartData,
  totalCourses,
}: CoursesTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/10 text-blue-600 rounded-md">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Khóa học đăng ký mới (trong kỳ)</p>
            <h4 className="text-2xl font-bold">{formatNumber(platformOverview?.enrollmentsInRange)}</h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/10 text-purple-600 rounded-md">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Khóa học tạo mới (trong kỳ)</p>
            <h4 className="text-2xl font-bold">{formatNumber(courseOverview?.createdCoursesInRange)}</h4>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-md">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Tổng khóa học hoạt động (Published)</p>
            <h4 className="text-2xl font-bold">{formatNumber(courseOverview?.currentPublishedCount)}</h4>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Lượt đăng ký khóa học</CardTitle>
            <CardDescription>Biểu đồ số lượt mua & ghi danh khóa học của học viên.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {enrollmentChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu lượt mua.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollmentChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [formatNumber(Number(val)), "Đăng ký"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="Lượt đăng ký" fill="oklch(0.685 0.169 237.323)" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Khóa học đăng ký nhiều nhất</CardTitle>
            <CardDescription>Các khóa học nhận được lượt mua cao nhất trong khoảng thời gian.</CardDescription>
          </CardHeader>
          <CardContent>
            {!platformOverview?.topCoursesByEnrollment || platformOverview.topCoursesByEnrollment.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Không có dữ liệu đăng ký.</div>
            ) : (
              <div className="space-y-4">
                {platformOverview.topCoursesByEnrollment.map((course, idx) => (
                  <div key={course.courseId || idx} className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-6 h-6 flex items-center justify-center font-bold text-xs bg-muted text-muted-foreground rounded-full">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={course.title}>
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {course.enrollmentCount} học viên đăng ký
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Khóa học tạo mới</CardTitle>
            <CardDescription>Số lượng khóa học mới do giảng viên tải lên hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {courseChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Không có dữ liệu tạo khóa học.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseChartData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.2)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [formatNumber(Number(val)), "Khóa học"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontWeight: 'bold' }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  />
                  <Bar dataKey="Khóa học mới" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Trạng thái Khóa học hiện tại</CardTitle>
            <CardDescription>Tổng quan sự phân bổ các trạng thái của khóa học trên hệ thống.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!courseOverview?.currentCoursesByStatus ? (
              <div className="py-8 text-center text-muted-foreground text-sm">Không có dữ liệu trạng thái.</div>
            ) : (
              Object.entries(courseOverview.currentCoursesByStatus).map(([status, count]) => {
                const percentage = totalCourses ? Math.round((count / totalCourses) * 100) : 0
                
                let statusLabel = status
                let progressColor = "bg-primary"
                
                switch (status) {
                  case "PUBLISHED":
                    statusLabel = "Đã xuất bản (Published)"
                    progressColor = "bg-green-500"
                    break
                  case "DRAFT":
                    statusLabel = "Bản nháp (Draft)"
                    progressColor = "bg-gray-400"
                    break
                  case "WAITING_APPROVAL":
                    statusLabel = "Chờ phê duyệt (Pending)"
                    progressColor = "bg-yellow-500"
                    break
                  case "REJECTED":
                    statusLabel = "Bị từ chối (Rejected)"
                    progressColor = "bg-red-500"
                    break
                  case "ARCHIVED":
                    statusLabel = "Đã lưu trữ (Archived)"
                    progressColor = "bg-slate-600"
                    break
                }
                
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{statusLabel}</span>
                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${progressColor}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
