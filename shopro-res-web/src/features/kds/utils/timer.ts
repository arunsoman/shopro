export function elapsed(seconds: number): string {
  if (seconds < 60) return `0:${seconds.toString().padStart(2, "0")}`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function timerColor(
  seconds: number,
  warnThreshold: number,
  alertThreshold: number
): string {
  if (seconds >= alertThreshold) return "#ef4444"
  if (seconds >= warnThreshold) return "#f59e0b"
  return "#e0e0e0"
}

export function timerBg(
  seconds: number,
  warnThreshold: number,
  alertThreshold: number
): string {
  if (seconds >= alertThreshold) return "rgba(239,68,68,0.08)"
  if (seconds >= warnThreshold) return "rgba(245,158,11,0.06)"
  return "transparent"
}

export function timerBorder(
  seconds: number,
  warnThreshold: number,
  alertThreshold: number
): string {
  if (seconds >= alertThreshold) return "#ef4444"
  if (seconds >= warnThreshold) return "#f59e0b"
  return "#1f1f1f"
}
