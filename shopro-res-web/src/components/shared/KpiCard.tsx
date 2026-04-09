import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  delta?: string
  deltaDir?: 'up' | 'down' | 'flat'
  icon?: LucideIcon
  isLive?: boolean
  onClick?: () => void
  className?: string
  loading?: boolean
}

export function KpiCard({
  title, value, delta, deltaDir, icon: Icon, isLive, onClick, className, loading
}: KpiCardProps) {
  if (loading) {
    return (
      <div className={cn('bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm', className)}>
        <div className="h-2 w-1/2 bg-muted/20 rounded animate-pulse mb-4" />
        <div className="h-8 w-3/4 bg-muted/20 rounded animate-pulse mb-2" />
        <div className="h-2 w-1/3 bg-muted/20 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-white/5 shadow-sm text-left w-full transition-all duration-200 group',
        onClick && 'active:scale-[0.98] hover:shadow-md hover:border-slate-300 dark:hover:border-white/10 cursor-pointer',
        !onClick && 'cursor-default',
        className
      )}
    >
      {isLive && (
        <span className="absolute top-4 right-4 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      <div className="flex items-center gap-2 text-muted-foreground/40 mb-2 transition-colors group-hover:text-muted-foreground/60">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{title}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums leading-none mb-2">{value}</p>
      {delta && (
        <div className={cn(
          'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest',
          deltaDir === 'up' && 'text-emerald-600',
          deltaDir === 'down' && 'text-rose-600',
          (!deltaDir || deltaDir === 'flat') && 'text-muted-foreground/40',
        )}>
          {deltaDir === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
          {deltaDir === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
          {deltaDir === 'flat' && <Minus className="h-3.5 w-3.5" />}
          <span>{delta}</span>
        </div>
      )}
    </button>
  )
}