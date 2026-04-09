import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4 text-muted-foreground/40 animate-in fade-in duration-700">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronising Ledger...</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="p-6">
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-6 flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-8 w-8 text-rose-500/40" />
        <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Data Retrieval Failed</h3>
            <p className="text-xs text-muted-foreground/60 max-w-xs">{message}</p>
        </div>
        <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm" 
            className="rounded-lg h-8 px-4 font-bold text-[10px] uppercase tracking-widest border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
        >
          Retry Connection
        </Button>
      </div>
    </div>
  )
}

export function Money({ v }: { v: number | null | undefined }) {
  const value = v ?? 0;
  if (isNaN(value)) return <span className="font-mono tabular-nums tracking-tight">$0.00</span>;
  const formatted = Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return <span className="font-mono tabular-nums tracking-tight">{value < 0 ? `($${formatted})` : `$${formatted}`}</span>
}

export function Pct(v: number | null | undefined): string {
  const value = v ?? 0;
  if (isNaN(value)) return "0.0%";
  return `${(value * 100).toFixed(1)}%`
}

export function PctBadge({ v, threshold }: { v: number; threshold?: number }) {
  const danger = threshold != null && v > threshold
  const warn = threshold != null && v > threshold * 0.95 && !danger
  
  return (
    <span className={cn(
        "px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-tight border",
        danger ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : 
        warn ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : 
        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    )}>
      {Pct(v)}
    </span>
  )
}

export function weekOffset(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export function formatWeek(iso: string): string {
  const start = new Date(iso)
  const end = new Date(iso)
  end.setDate(end.getDate() + 6)
  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}
