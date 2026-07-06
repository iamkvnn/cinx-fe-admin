import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { Layers, Users2, DollarSign } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatisticsService, UserStatisticsService, CourseStatisticsService } from "@/services"

import { DashboardFilters } from "../components/DashboardFilters"
import { KPICards } from "../components/KPICards"
import { FinancialsTab } from "../components/FinancialsTab"
import { CoursesTab } from "../components/CoursesTab"
import { UsersTab } from "../components/UsersTab"
import {
  formatDateObj, formatMonthObj, addDays, addMonths,
  getMonthDifference, getLastDayOfMonth
} from "@/lib/utils"

export function DashboardPage() {
  const [timeGroup, setTimeGroup] = React.useState<"MONTH" | "DAY">("DAY")
  const [monthRangeType, setMonthRangeType] = React.useState<"3_MONTHS" | "6_MONTHS" | "12_MONTHS" | "CUSTOM">("6_MONTHS")
  const [dayRangeType, setDayRangeType] = React.useState<"7_DAYS" | "14_DAYS" | "30_DAYS" | "CUSTOM">("30_DAYS")

  // Current Date properties
  const now = React.useMemo(() => new Date(), [])
  const todayStr = React.useMemo(() => formatDateObj(now), [now])
  const currentMonthStr = React.useMemo(() => formatMonthObj(now), [now])

  // Max Limits
  const maxDayLimit = todayStr

  // Min Limits (Furthest back they can query is 12 months)
  const minDate = React.useMemo(() => {
    const d = new Date(now)
    d.setFullYear(now.getFullYear() - 1)
    return d
  }, [now])
  const minDayLimit = React.useMemo(() => formatDateObj(minDate), [minDate])

  // Month limit is 12 months inclusive (current month + 11 past months)
  const minMonthLimit = React.useMemo(() => {
    const d = new Date(now)
    d.setMonth(now.getMonth() - 11)
    return formatMonthObj(d)
  }, [now])

  const monthOptions = React.useMemo(() => {
    const options = []
    const temp = new Date(now)
    temp.setMonth(now.getMonth() - 11) // July 2025 if current month is June 2026
    while (temp <= now) {
      options.push({
        value: formatMonthObj(temp),
        label: `Tháng ${String(temp.getMonth() + 1).padStart(2, '0')}/${temp.getFullYear()}`
      })
      temp.setMonth(temp.getMonth() + 1)
    }
    return options.reverse()
  }, [now])

  // Default values
  const initialStartMonth = React.useMemo(() => {
    const d = new Date(now)
    d.setMonth(now.getMonth() - 5) // Last 6 months
    const minM = new Date(now)
    minM.setMonth(now.getMonth() - 11)
    return d < minM ? minM : d
  }, [now])

  const initialStartDay = React.useMemo(() => {
    const d = new Date(now)
    d.setDate(now.getDate() - 29)
    return d < minDate ? minDate : d
  }, [now, minDate])

  const [startMonthStr, setStartMonthStr] = React.useState(formatMonthObj(initialStartMonth))
  const [endMonthStr, setEndMonthStr] = React.useState(currentMonthStr)

  const [startDateStr, setStartDateStr] = React.useState(formatDateObj(initialStartDay))
  const [endDateStr, setEndDateStr] = React.useState(todayStr)

  React.useEffect(() => {
    if (timeGroup === "MONTH") {
      const minM = new Date(now)
      minM.setMonth(now.getMonth() - 11)
      if (monthRangeType === "6_MONTHS") {
        const start = new Date(now)
        start.setMonth(now.getMonth() - 5)
        setStartMonthStr(formatMonthObj(start < minM ? minM : start))
        setEndMonthStr(currentMonthStr)
      } else if (monthRangeType === "12_MONTHS") {
        setStartMonthStr(formatMonthObj(minM))
        setEndMonthStr(currentMonthStr)
      } else if (monthRangeType === "3_MONTHS") {
        const start = new Date(now)
        start.setMonth(now.getMonth() - 2)
        setStartMonthStr(formatMonthObj(start < minM ? minM : start))
        setEndMonthStr(currentMonthStr)
      }
    } else {
      if (dayRangeType === "30_DAYS") {
        const start = new Date(now)
        start.setDate(now.getDate() - 29)
        setStartDateStr(formatDateObj(start < minDate ? minDate : start))
        setEndDateStr(todayStr)
      } else if (dayRangeType === "14_DAYS") {
        const start = new Date(now)
        start.setDate(now.getDate() - 14)
        setStartDateStr(formatDateObj(start < minDate ? minDate : start))
        setEndDateStr(todayStr)
      } else if (dayRangeType === "7_DAYS") {
        const start = new Date(now)
        start.setDate(now.getDate() - 7)
        setStartDateStr(formatDateObj(start < minDate ? minDate : start))
        setEndDateStr(todayStr)
      }
    }
  }, [timeGroup, monthRangeType, dayRangeType, now, minDate, todayStr, currentMonthStr])

  const handleStartMonthChange = (val: string | null) => {
    if (!val) return
    setStartMonthStr(val)

    let newEnd = endMonthStr
    const diff = getMonthDifference(val, endMonthStr)
    if (diff > 11 || diff < 0) {
      newEnd = addMonths(val, 11)
      if (newEnd > currentMonthStr) {
        newEnd = currentMonthStr
      }
      setEndMonthStr(newEnd)
    }
  }

  const handleEndMonthChange = (val: string | null) => {
    if (!val) return
    setEndMonthStr(val)

    let newStart = startMonthStr
    const diff = getMonthDifference(startMonthStr, val)
    if (diff > 11 || diff < 0) {
      newStart = addMonths(val, -11)
      if (newStart < minMonthLimit) {
        newStart = minMonthLimit
      }
      setStartMonthStr(newStart)
    }
  }

  const handleStartDateChange = (val: string) => {
    if (!val) return
    setStartDateStr(val)

    const [sYear, sMonth, sDay] = val.split("-").map(Number)
    const [eYear, eMonth, eDay] = endDateStr.split("-").map(Number)
    const s = new Date(sYear, sMonth - 1, sDay)
    const e = new Date(eYear, eMonth - 1, eDay)
    const diffTime = e.getTime() - s.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    let newEnd = endDateStr
    if (diffDays > 29 || diffDays < 0) {
      newEnd = addDays(val, 29)
      if (newEnd > todayStr) {
        newEnd = todayStr
      }
      setEndDateStr(newEnd)
    }
  }

  const handleEndDateChange = (val: string) => {
    if (!val) return
    setEndDateStr(val)

    const [sYear, sMonth, sDay] = startDateStr.split("-").map(Number)
    const [eYear, eMonth, eDay] = val.split("-").map(Number)
    const s = new Date(sYear, sMonth - 1, sDay)
    const e = new Date(eYear, eMonth - 1, eDay)
    const diffTime = e.getTime() - s.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

    let newStart = startDateStr
    if (diffDays > 29 || diffDays < 0) {
      newStart = addDays(val, -29)
      if (newStart < minDayLimit) {
        newStart = minDayLimit
      }
      setStartDateStr(newStart)
    }
  }

  const handleTimeGroupChange = (group: "MONTH" | "DAY") => {
    setTimeGroup(group)
  }

  const queryStartDate = timeGroup === "MONTH"
    ? `${startMonthStr}-01`
    : startDateStr

  const queryEndDate = timeGroup === "MONTH"
    ? getLastDayOfMonth(endMonthStr)
    : endDateStr

  // 1. Fetch Platform overview
  const { data: platformData, isLoading: isLoadingPlatform } = useQuery({
    queryKey: ["admin-platform-overview", timeGroup, queryStartDate, queryEndDate],
    queryFn: () => StatisticsService.getAdminOverview({ groupBy: timeGroup, startDate: queryStartDate, endDate: queryEndDate })
  })

  // 2. Fetch User statistics
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["admin-user-overview", timeGroup, queryStartDate, queryEndDate],
    queryFn: () => UserStatisticsService.getOverview({ groupBy: timeGroup, startDate: queryStartDate, endDate: queryEndDate })
  })

  // 3. Fetch Course statistics
  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["admin-course-overview", timeGroup, queryStartDate, queryEndDate],
    queryFn: () => CourseStatisticsService.getAdminOverview({ groupBy: timeGroup, startDate: queryStartDate, endDate: queryEndDate })
  })

  const platformOverview = platformData?.data
  const userOverview = userData?.data
  const courseOverview = courseData?.data

  const isAnyLoading = isLoadingPlatform || isLoadingUser || isLoadingCourse

  // Calculate sum of courses from status object
  const totalCourses = courseOverview?.currentCoursesByStatus
    ? Object.values(courseOverview.currentCoursesByStatus).reduce((a, b) => a + b, 0)
    : 0

  // Format revenue time series
  const revenueChartData = platformOverview?.platformRevenueByTime?.map((item) => ({
    name: item.timeLabel || "",
    "Doanh thu gộp": item.grossRevenue || 0,
    "Phí hệ thống": item.netRevenue || 0,
  })) || []

  // Format enrollment time series
  const enrollmentChartData = platformOverview?.enrollmentsByTime?.map((item) => ({
    name: item.label || "",
    "Lượt đăng ký": item.enrollmentCount || 0,
  })) || []

  // Format user time series
  const userChartData = userOverview?.newUsersByTime?.map((item) => ({
    name: item.label || "",
    "Học viên mới": item.value || 0,
  })) || []

  // Format course creation time series
  const courseChartData = courseOverview?.createdCoursesByTime?.map((item) => ({
    name: item.label || "",
    "Khóa học mới": item.value || 0,
  })) || []

  // Calculate paid order conversion rate
  const paymentRate = (platformOverview?.totalOrders && platformOverview?.paidOrdersInRange)
    ? Math.round((platformOverview.paidOrdersInRange / platformOverview.totalOrders) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <DashboardFilters
        timeGroup={timeGroup}
        monthRangeType={monthRangeType}
        setMonthRangeType={setMonthRangeType}
        dayRangeType={dayRangeType}
        setDayRangeType={setDayRangeType}
        startMonthStr={startMonthStr}
        endMonthStr={endMonthStr}
        startDateStr={startDateStr}
        endDateStr={endDateStr}
        handleStartMonthChange={handleStartMonthChange}
        handleEndMonthChange={handleEndMonthChange}
        handleStartDateChange={handleStartDateChange}
        handleEndDateChange={handleEndDateChange}
        handleTimeGroupChange={handleTimeGroupChange}
        monthOptions={monthOptions}
        minDayLimit={minDayLimit}
        maxDayLimit={maxDayLimit}
      />

      {/* Loading Skeletons */}
      {isAnyLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-40" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-10 w-96" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Skeleton className="w-full h-full" />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 Main KPI Cards */}
          <KPICards
            platformOverview={platformOverview}
            userOverview={userOverview}
            courseOverview={courseOverview}
            totalCourses={totalCourses}
          />

          {/* Tab Sections */}
          <Tabs defaultValue="financials" className="w-full space-y-4">
            <TabsList className="flex flex-wrap w-full sm:w-auto h-auto min-h-9 p-1 rounded-full bg-muted justify-start gap-1">
              <TabsTrigger value="financials" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Tài chính & Đơn hàng
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <Layers className="h-4 w-4" /> Khóa học & Đăng ký
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users2 className="h-4 w-4" /> Học viên & Giảng viên
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Financials */}
            <TabsContent value="financials" className="space-y-4 outline-none">
              <FinancialsTab
                platformOverview={platformOverview}
                revenueChartData={revenueChartData}
                paymentRate={paymentRate}
              />
            </TabsContent>

            {/* Tab 2: Courses */}
            <TabsContent value="courses" className="space-y-4 outline-none">
              <CoursesTab
                platformOverview={platformOverview}
                courseOverview={courseOverview}
                enrollmentChartData={enrollmentChartData}
                courseChartData={courseChartData}
                totalCourses={totalCourses}
              />
            </TabsContent>

            {/* Tab 3: Users */}
            <TabsContent value="users" className="space-y-4 outline-none">
              <UsersTab
                userOverview={userOverview}
                userChartData={userChartData}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
