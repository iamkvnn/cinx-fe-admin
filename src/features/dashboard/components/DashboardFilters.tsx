import * as React from "react"
import { Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { addDays, getMonthDifference } from "@/lib/utils"

const monthRangeLabels = {
  "3_MONTHS": "3 tháng qua",
  "6_MONTHS": "6 tháng qua",
  "12_MONTHS": "12 tháng qua",
  "CUSTOM": "Tùy chỉnh...",
}

const dayRangeLabels = {
  "7_DAYS": "7 ngày qua",
  "14_DAYS": "14 ngày qua",
  "30_DAYS": "30 ngày qua",
  "CUSTOM": "Tùy chỉnh...",
}

const formatMonthLabel = (val: string) => {
  if (!val) return ""
  const [year, month] = val.split("-").map(Number)
  return `Tháng ${String(month).padStart(2, '0')}/${year}`
}

interface DashboardFiltersProps {
  timeGroup: "MONTH" | "DAY"
  monthRangeType: "3_MONTHS" | "6_MONTHS" | "12_MONTHS" | "CUSTOM"
  setMonthRangeType: (val: "3_MONTHS" | "6_MONTHS" | "12_MONTHS" | "CUSTOM") => void
  dayRangeType: "7_DAYS" | "14_DAYS" | "30_DAYS" | "CUSTOM"
  setDayRangeType: (val: "7_DAYS" | "14_DAYS" | "30_DAYS" | "CUSTOM") => void
  startMonthStr: string
  endMonthStr: string
  startDateStr: string
  endDateStr: string
  handleStartMonthChange: (val: string | null) => void
  handleEndMonthChange: (val: string | null) => void
  handleStartDateChange: (val: string) => void
  handleEndDateChange: (val: string) => void
  handleTimeGroupChange: (group: "MONTH" | "DAY") => void
  monthOptions: Array<{ value: string; label: string }>
  minDayLimit: string
  maxDayLimit: string
}

export function DashboardFilters({
  timeGroup,
  monthRangeType,
  setMonthRangeType,
  dayRangeType,
  setDayRangeType,
  startMonthStr,
  endMonthStr,
  startDateStr,
  endDateStr,
  handleStartMonthChange,
  handleEndMonthChange,
  handleStartDateChange,
  handleEndDateChange,
  handleTimeGroupChange,
  monthOptions,
  minDayLimit,
  maxDayLimit,
}: DashboardFiltersProps) {
  // Dynamically calculate min start date to restrict range to max 30 days
  const calculatedMinStartDate = React.useMemo(() => {
    const limitDate = addDays(endDateStr, -29)
    return limitDate > minDayLimit ? limitDate : minDayLimit
  }, [endDateStr, minDayLimit])

  // Dynamically calculate max end date to restrict range to max 30 days
  const calculatedMaxEndDate = React.useMemo(() => {
    const limitDate = addDays(startDateStr, 29)
    return limitDate < maxDayLimit ? limitDate : maxDayLimit
  }, [startDateStr, maxDayLimit])

  return (
    <div className="space-y-4">
      {/* Top Filter Header Card */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card p-4 rounded-xl border">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">Tổng quan hệ thống</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Báo cáo chi tiết về doanh thu, học viên, giảng viên và khóa học.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Group Selector */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-full text-sm">
            <button
              onClick={() => handleTimeGroupChange("MONTH")}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                timeGroup === "MONTH" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => handleTimeGroupChange("DAY")}
              className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                timeGroup === "DAY" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Theo Ngày
            </button>
          </div>

          {/* Predefined Range Selector */}
          <div className="w-[150px]">
            {timeGroup === "MONTH" ? (
              <Select value={monthRangeType} onValueChange={(val) => setMonthRangeType(val as any)}>
                <SelectTrigger className="w-full bg-background border border-input rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-sm cursor-pointer shadow-sm">
                  <span>{monthRangeLabels[monthRangeType]}</span>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="3_MONTHS">3 tháng qua</SelectItem>
                  <SelectItem value="6_MONTHS">6 tháng qua</SelectItem>
                  <SelectItem value="12_MONTHS">12 tháng qua</SelectItem>
                  <SelectItem value="CUSTOM">Tùy chỉnh...</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Select value={dayRangeType} onValueChange={(val) => setDayRangeType(val as any)}>
                <SelectTrigger className="w-full bg-background border border-input rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-sm cursor-pointer shadow-sm">
                  <span>{dayRangeLabels[dayRangeType]}</span>
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="7_DAYS">7 ngày qua</SelectItem>
                  <SelectItem value="14_DAYS">14 ngày qua</SelectItem>
                  <SelectItem value="30_DAYS">30 ngày qua</SelectItem>
                  <SelectItem value="CUSTOM">Tùy chỉnh...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Custom Date Picker Inputs - Only shown when range is CUSTOM */}
          {((timeGroup === "MONTH" && monthRangeType === "CUSTOM") || 
            (timeGroup === "DAY" && dayRangeType === "CUSTOM")) && (
            <div className="flex flex-wrap items-center gap-2.5 text-sm bg-muted/60 p-1.5 rounded-full border border-muted animate-in fade-in slide-in-from-right-2 duration-200">
              <span className="text-muted-foreground pl-2.5 text-xs font-bold uppercase tracking-wider">Từ:</span>
              {timeGroup === "MONTH" ? (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none animate-in fade-in" />
                  <Select value={startMonthStr} onValueChange={handleStartMonthChange}>
                    <SelectTrigger className="min-w-[140px] bg-background border border-input rounded-full pl-9 pr-3 py-1 text-sm font-medium cursor-pointer shadow-sm hover:border-accent-foreground/20 transition-colors">
                      <span>{formatMonthLabel(startMonthStr)}</span>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60 overflow-y-auto">
                      {monthOptions.map((opt) => (
                        <SelectItem 
                          key={opt.value} 
                          value={opt.value} 
                          disabled={opt.value > endMonthStr || getMonthDifference(opt.value, endMonthStr) > 11}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none animate-in fade-in z-10" />
                  <DatePicker
                    value={startDateStr}
                    min={calculatedMinStartDate}
                    max={endDateStr}
                    onChange={handleStartDateChange}
                    className="w-[140px]"
                  />
                </div>
              )}
              
              <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Đến:</span>
              {timeGroup === "MONTH" ? (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none animate-in fade-in" />
                  <Select value={endMonthStr} onValueChange={handleEndMonthChange}>
                    <SelectTrigger className="min-w-[140px] bg-background border border-input rounded-full pl-9 pr-3 py-1 text-sm font-medium cursor-pointer shadow-sm hover:border-accent-foreground/20 transition-colors">
                      <span>{formatMonthLabel(endMonthStr)}</span>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl max-h-60 overflow-y-auto">
                      {monthOptions.map((opt) => (
                        <SelectItem 
                          key={opt.value} 
                          value={opt.value} 
                          disabled={opt.value < startMonthStr || getMonthDifference(startMonthStr, opt.value) > 11}
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="relative flex items-center">
                  <Calendar className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none animate-in fade-in z-10" />
                  <DatePicker
                    value={endDateStr}
                    min={startDateStr}
                    max={calculatedMaxEndDate}
                    onChange={handleEndDateChange}
                    className="w-[140px]"
                    align="right"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
