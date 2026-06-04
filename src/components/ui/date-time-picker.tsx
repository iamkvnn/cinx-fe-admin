import * as React from "react"
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  value: string // Format: YYYY-MM-DDTHH:mm or ISO string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  min?: string // Format: YYYY-MM-DDTHH:mm or ISO string
  max?: string // Format: YYYY-MM-DDTHH:mm or ISO string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Chọn ngày & giờ...",
  className,
  min,
  max,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const hourScrollRef = React.useRef<HTMLDivElement>(null)
  const minuteScrollRef = React.useRef<HTMLDivElement>(null)

  // Parse current value or default to current date
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date()
    const d = new Date(value)
    return isNaN(d.getTime()) ? new Date() : d
  }, [value])

  // Navigation state for calendar month/year
  const [navYear, setNavYear] = React.useState(parsedDate.getFullYear())
  const [navMonth, setNavMonth] = React.useState(parsedDate.getMonth()) // 0-indexed

  // Sync nav month/year when value changes externally
  React.useEffect(() => {
    if (value) {
      const d = new Date(value)
      if (!isNaN(d.getTime())) {
        setNavYear(d.getFullYear())
        setNavMonth(d.getMonth())
      }
    }
  }, [value])

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Format date display label (HH:mm DD/MM/YYYY)
  const displayLabel = React.useMemo(() => {
    if (!value) return placeholder
    const d = new Date(value)
    if (isNaN(d.getTime())) return placeholder

    const dateStr = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    const timeStr = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    return `${timeStr} ${dateStr}`
  }, [value, placeholder])

  // Calendar math
  const daysInMonth = React.useMemo(() => {
    return new Date(navYear, navMonth + 1, 0).getDate()
  }, [navYear, navMonth])

  const startOffset = React.useMemo(() => {
    const firstDay = new Date(navYear, navMonth, 1)
    const dayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
    return dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Shift so Monday is index 0
  }, [navYear, navMonth])

  const prevMonthDays = React.useMemo(() => {
    return new Date(navYear, navMonth, 0).getDate()
  }, [navYear, navMonth])

  const calendarCells = React.useMemo(() => {
    const cells = []

    // Previous month's trailing days
    for (let i = startOffset - 1; i >= 0; i--) {
      const prevD = prevMonthDays - i
      const prevM = navMonth === 0 ? 11 : navMonth - 1
      const prevY = navMonth === 0 ? navYear - 1 : navYear
      cells.push({
        dayNum: prevD,
        month: prevM,
        year: prevY,
        isCurrentMonth: false,
      })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        dayNum: i,
        month: navMonth,
        year: navYear,
        isCurrentMonth: true,
      })
    }

    // Next month's leading days (fill grid of 42 cells)
    const nextDaysNeeded = 42 - cells.length
    for (let i = 1; i <= nextDaysNeeded; i++) {
      const nextM = navMonth === 11 ? 0 : navMonth + 1
      const nextY = navMonth === 11 ? navYear + 1 : navYear
      cells.push({
        dayNum: i,
        month: nextM,
        year: nextY,
        isCurrentMonth: false,
      })
    }

    return cells
  }, [navYear, navMonth, daysInMonth, startOffset, prevMonthDays])

  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11)
      setNavYear((y) => y - 1)
    } else {
      setNavMonth((m) => m - 1)
    }
  }

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0)
      setNavYear((y) => y + 1)
    } else {
      setNavMonth((m) => m + 1)
    }
  }

  // Format a Date object to YYYY-MM-DDTHH:mm
  const formatDateToLocalString = (date: Date) => {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, "0")
    const dd = String(date.getDate()).padStart(2, "0")
    const hh = String(date.getHours()).padStart(2, "0")
    const min = String(date.getMinutes()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`
  }

  const handleSelectDay = (cell: { dayNum: number; month: number; year: number }) => {
    const newDate = new Date(parsedDate.getTime())
    newDate.setFullYear(cell.year)
    newDate.setMonth(cell.month)
    newDate.setDate(cell.dayNum)

    onChange(formatDateToLocalString(newDate))
  }

  const handleSelectHour = (hour: number) => {
    const newDate = new Date(parsedDate.getTime())
    newDate.setHours(hour)
    onChange(formatDateToLocalString(newDate))
  }

  const handleSelectMinute = (minute: number) => {
    const newDate = new Date(parsedDate.getTime())
    newDate.setMinutes(minute)
    onChange(formatDateToLocalString(newDate))
  }

  const handleSelectToday = () => {
    const now = new Date()
    onChange(formatDateToLocalString(now))
    setNavYear(now.getFullYear())
    setNavMonth(now.getMonth())
  }

  const isCellSelected = (cell: { dayNum: number; month: number; year: number }) => {
    if (!value) return false
    const d = new Date(value)
    if (isNaN(d.getTime())) return false
    return cell.dayNum === d.getDate() && cell.month === d.getMonth() && cell.year === d.getFullYear()
  }

  const isCellDisabled = (cell: { dayNum: number; month: number; year: number }) => {
    const formattedM = String(cell.month + 1).padStart(2, "0")
    const formattedD = String(cell.dayNum).padStart(2, "0")
    const dateStr = `${cell.year}-${formattedM}-${formattedD}`

    if (min) {
      const minDateStr = min.split("T")[0]
      if (dateStr < minDateStr) return true
    }
    if (max) {
      const maxDateStr = max.split("T")[0]
      if (dateStr > maxDateStr) return true
    }
    return false
  }

  const isToday = (cell: { dayNum: number; month: number; year: number }) => {
    const today = new Date()
    return cell.dayNum === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear()
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  // Scroll current hour & minute to center when dropdown is opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedHourEl = hourScrollRef.current.querySelector('[data-selected="true"]')
          if (selectedHourEl) {
            selectedHourEl.scrollIntoView({ block: "center", behavior: "auto" })
          }
        }
        if (minuteScrollRef.current) {
          const selectedMinuteEl = minuteScrollRef.current.querySelector('[data-selected="true"]')
          if (selectedMinuteEl) {
            selectedMinuteEl.scrollIntoView({ block: "center", behavior: "auto" })
          }
        }
      }, 50)
    }
  }, [isOpen])

  const selectedHour = value ? new Date(value).getHours() : new Date().getHours()
  const selectedMinute = value ? new Date(value).getMinutes() : new Date().getMinutes()

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 py-1 text-left text-sm transition-[color,box-shadow,background-color] outline-none hover:bg-input/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 select-none cursor-pointer text-foreground",
          !value && "text-muted-foreground",
          className
        )}
      >
        <span className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{displayLabel}</span>
        </span>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+8px)] w-[410px] bg-popover text-popover-foreground rounded-2xl border border-border shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden">
          <div className="flex divide-x divide-border">
            {/* Calendar panel */}
            <div className="p-4 w-[270px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="font-semibold text-sm">
                  Tháng {navMonth + 1}, {navYear}
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
                <div>T2</div>
                <div>T3</div>
                <div>T4</div>
                <div>T5</div>
                <div>T6</div>
                <div>T7</div>
                <div className="text-destructive/80 font-bold">CN</div>
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-sm">
                {calendarCells.map((cell, idx) => {
                  const selected = isCellSelected(cell)
                  const disabled = isCellDisabled(cell)
                  const today = isToday(cell)

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(cell)}
                      className={cn(
                        "h-8 w-8 mx-auto flex items-center justify-center rounded-full text-xs transition-all cursor-pointer select-none",
                        !cell.isCurrentMonth && "text-muted-foreground/30",
                        cell.isCurrentMonth && !selected && !disabled && "hover:bg-muted text-foreground",
                        selected && "bg-primary text-primary-foreground font-semibold shadow-md",
                        disabled && "text-muted-foreground/20 opacity-40 cursor-not-allowed",
                        today && !selected && "border border-primary/50 font-bold text-primary"
                      )}
                    >
                      {cell.dayNum}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time panel */}
            <div className="w-[140px] p-4 flex flex-col">
              <div className="text-center font-semibold text-xs text-muted-foreground mb-3 flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Thời gian</span>
              </div>

              <div className="flex gap-2 h-[200px] overflow-hidden justify-center">
                {/* Hours column */}
                <div
                  ref={hourScrollRef}
                  className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-0.5 border-r border-border/50 pr-1 select-none"
                >
                  <div className="h-[90px]" /> {/* Spacer at top */}
                  {hours.map((h) => {
                    const isSelected = selectedHour === h
                    return (
                      <button
                        key={h}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleSelectHour(h)}
                        className={cn(
                          "w-full text-center py-1.5 text-xs rounded-lg transition-all cursor-pointer block",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {String(h).padStart(2, "0")}
                      </button>
                    )
                  })}
                  <div className="h-[90px]" /> {/* Spacer at bottom */}
                </div>

                {/* Minutes column */}
                <div
                  ref={minuteScrollRef}
                  className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-0.5 select-none"
                >
                  <div className="h-[90px]" /> {/* Spacer at top */}
                  {minutes.map((m) => {
                    const isSelected = selectedMinute === m
                    return (
                      <button
                        key={m}
                        type="button"
                        data-selected={isSelected}
                        onClick={() => handleSelectMinute(m)}
                        className={cn(
                          "w-full text-center py-1.5 text-xs rounded-lg transition-all cursor-pointer block",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {String(m).padStart(2, "0")}
                      </button>
                    )
                  })}
                  <div className="h-[90px]" /> {/* Spacer at bottom */}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-border p-2 bg-muted/20 flex justify-between gap-2">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs px-3 py-1.5 rounded-lg hover:bg-muted text-primary font-medium cursor-pointer transition-colors"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 font-medium cursor-pointer transition-colors shadow-sm"
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
