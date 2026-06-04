import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to format Date objects as YYYY-MM-DD in local timezone
export function formatDateObj(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

// Helper to format Date objects as YYYY-MM in local timezone
export function formatMonthObj(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number)
  const d = new Date(year, month - 1, day)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${date}`
}

export function addMonths(monthStr: string, months: number): string {
  const [year, month] = monthStr.split("-").map(Number)
  const d = new Date(year, month - 1 + months, 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function getMonthDifference(startMonth: string, endMonth: string): number {
  const [sYear, sMonth] = startMonth.split("-").map(Number)
  const [eYear, eMonth] = endMonth.split("-").map(Number)
  return (eYear - sYear) * 12 + (eMonth - sMonth)
}

export function getLastDayOfMonth(yearMonthStr: string): string {
  const [year, month] = yearMonthStr.split("-").map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return `${yearMonthStr}-${String(lastDay).padStart(2, '0')}`
}

