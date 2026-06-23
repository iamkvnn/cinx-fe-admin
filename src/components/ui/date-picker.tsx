import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  min?: string // YYYY-MM-DD
  max?: string // YYYY-MM-DD
  className?: string
  align?: "left" | "right"
}

export function DatePicker({ value, onChange, min, max, className, align = "left" }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Parse current value
  const parsedDate = React.useMemo(() => {
    if (!value) return new Date()
    const [y, m, d] = value.split("-").map(Number)
    return new Date(y, m - 1, d)
  }, [value])

  // Calendar navigation state (month/year we are currently viewing in the grid)
  const [navYear, setNavYear] = React.useState(parsedDate.getFullYear())
  const [navMonth, setNavMonth] = React.useState(parsedDate.getMonth()) // 0-indexed

  // Sync nav month/year when value changes externally
  React.useEffect(() => {
    if (value) {
      const [y, m] = value.split("-").map(Number)
      setNavYear(y)
      setNavMonth(m - 1)
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

  // Format date display label: DD/MM/YYYY
  const displayLabel = React.useMemo(() => {
    if (!value) return "Chọn ngày..."
    const [y, m, d] = value.split("-")
    return `${d}/${m}/${y}`
  }, [value])

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

  const handleSelectDay = (cell: { dayNum: number; month: number; year: number }) => {
    const formattedM = String(cell.month + 1).padStart(2, '0')
    const formattedD = String(cell.dayNum).padStart(2, '0')
    const dateStr = `${cell.year}-${formattedM}-${formattedD}`
    
    // Check bounds
    if (min && dateStr < min) return
    if (max && dateStr > max) return

    onChange(dateStr)
    setIsOpen(false)
  }

  const isCellSelected = (cell: { dayNum: number; month: number; year: number }) => {
    if (!value) return false
    const [y, m, d] = value.split("-").map(Number)
    return cell.dayNum === d && cell.month === m - 1 && cell.year === y
  }

  const isCellDisabled = (cell: { dayNum: number; month: number; year: number }) => {
    const formattedM = String(cell.month + 1).padStart(2, '0')
    const formattedD = String(cell.dayNum).padStart(2, '0')
    const dateStr = `${cell.year}-${formattedM}-${formattedD}`
    
    if (min && dateStr < min) return true
    if (max && dateStr > max) return true
    return false
  }

  const isToday = (cell: { dayNum: number; month: number; year: number }) => {
    const today = new Date()
    return cell.dayNum === today.getDate() && cell.month === today.getMonth() && cell.year === today.getFullYear()
  }

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 bg-background border border-input rounded-full pl-9 pr-4 py-1 text-sm font-medium cursor-pointer shadow-sm hover:border-accent-foreground/20 transition-all select-none focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
      >
        <span>{displayLabel}</span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute mt-2 w-[280px] bg-popover text-popover-foreground rounded-2xl border border-border shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150",
          align === "right" ? "right-0" : "left-0"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="font-semibold text-sm">
              Tháng {navMonth + 1}, {navYear}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-muted rounded-full transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
            <div>T2</div>
            <div>T3</div>
            <div>T4</div>
            <div>T5</div>
            <div>T6</div>
            <div>T7</div>
            <div className="text-destructive/80 font-bold">CN</div>
          </div>

          {/* Day Grid */}
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
      )}
    </div>
  )
}
