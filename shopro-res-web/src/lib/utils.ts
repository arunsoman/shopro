import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function currency(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function percent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined || isNaN(value)) return '0.0%'
  return `${(value * 100).toFixed(decimals)}%`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return format(date, 'MMM d, yyyy')
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return format(date, 'MMM d, yyyy h:mm a')
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return formatDistanceToNow(date, { addSuffix: true })
}

export function sessionDuration(openedAt: string): number {
  return Math.round((Date.now() - new Date(openedAt).getTime()) / 60000)
}
