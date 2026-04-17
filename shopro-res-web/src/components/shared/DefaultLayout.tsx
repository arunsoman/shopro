import React, { useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, Plus, LucideIcon } from 'lucide-react'
import { useAppStore } from '@/App'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface KPICard {
  id: string | number
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export interface NavCard {
  id: string | number
  title: string
  description?: string
  icon: LucideIcon
  badge?: string | number
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger'
  onClick?: () => void
  href?: string
}

export interface DefaultLayoutProps {
  // Header
  title: string
  subtitle?: string
  icon: LucideIcon
  category?: string
  
  // Actions
  showBack?: boolean
  backHref?: string
  onBack?: () => void
  createLabel?: string
  onCreate?: () => void
  
  // KPI Cards
  kpiCards?: KPICard[]
  
  // Nav Cards (grid of action cards)
  navCards?: NavCard[]
  navCardsTitle?: string
  
  // Main content (typically ResponsiveDataList which has its own search/filter)
  children?: ReactNode
  
  // Custom footer
  footer?: ReactNode
  
  // Custom styles
  className?: string
  contentClassName?: string
  
  // Loading states
  isLoading?: boolean
  
  // Empty state
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function KPICardItem({ card, index }: { card: KPICard; index: number }) {
  const variantStyles = {
    default: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
    info: 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50',
  }

  const iconBadgeStyles = {
    default: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
    success: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    info: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
  }

  const valueStyles = {
    default: 'text-slate-900 dark:text-white',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-rose-600 dark:text-rose-400',
    info: 'text-indigo-600 dark:text-indigo-400',
  }

  return (
    <div 
      className={cn(
        "group relative p-6 rounded-[2rem] border transition-all hover:shadow-xl hover:-translate-y-1",
        variantStyles[card.variant || 'default']
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Background glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        card.variant === 'success' ? 'bg-emerald-500/5' :
        card.variant === 'warning' ? 'bg-amber-500/5' :
        card.variant === 'danger' ? 'bg-rose-500/5' :
        card.variant === 'info' ? 'bg-indigo-500/5' :
        'bg-slate-500/5'
      )} />

      <div className="relative z-10 flex items-start justify-between">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
          iconBadgeStyles[card.variant || 'default']
        )}>
          <card.icon className="w-5 h-5" />
        </div>
        
        {card.trend && (
          <div className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
            card.trend.isPositive 
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" 
              : "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
          )}>
            {card.trend.isPositive ? '↑' : '↓'} {Math.abs(card.trend.value)}%
          </div>
        )}
      </div>

      <div className="relative z-10 mt-4">
        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">
          {card.title}
        </p>
        <p className={cn(
          "text-3xl font-black tracking-tighter mt-1",
          valueStyles[card.variant || 'default']
        )}>
          {card.value}
        </p>
        {card.subtitle && (
          <p className="text-[10px] font-medium text-muted-foreground/60 mt-1">
            {card.subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

function NavCardItem({ card }: { card: NavCard }) {
  const { onClick } = useAppStore()
  
  const handleClick = useCallback(() => {
    if (card.onClick) {
      card.onClick()
    } else if (card.href) {
      onClick(card.href)
    }
  }, [card, onClick])

  return (
    <button
      onClick={handleClick}
      className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-500/20 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between mb-6 w-full">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-muted-foreground/30 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
          <card.icon size={22} />
        </div>
        {card.badge !== undefined && (
          <span className={cn(
            "h-7 min-w-[28px] px-2.5 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-wider",
            card.badgeVariant === 'success' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
            card.badgeVariant === 'warning' ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
            card.badgeVariant === 'danger' ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400" :
            "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400"
          )}>
            {card.badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold text-foreground tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
          {card.title}
        </h3>
        {card.description && (
          <p className="text-[11px] font-medium text-muted-foreground/60 line-clamp-2">
            {card.description}
          </p>
        )}
      </div>

      <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
        <ChevronLeft className="w-5 h-5 rotate-180 text-indigo-500" />
      </div>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

export function DefaultLayout({
  // Header
  title,
  subtitle,
  icon: Icon,
  category,
  
  // Actions
  showBack = false,
  backHref,
  onBack,
  createLabel,
  onCreate,
  
  // Cards
  kpiCards = [],
  navCards = [],
  navCardsTitle,
  
  // Content
  children,
  footer,
  
  // Styles
  className,
  contentClassName,
  
  // States
  isLoading = false,
  empty = false,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no items to display.',
  emptyAction,
}: DefaultLayoutProps) {
  const back = useAppStore(s => s.back)
  const navigate = useAppStore(s => s.navigate)

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else if (backHref) {
      navigate(backHref)
    } else {
      back()
    }
  }, [onBack, backHref, navigate, back])

  return (
    <div className={cn(
      "absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate overflow-y-auto",
      className
    )}>
      {/* ── Header Section ── */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {showBack && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack}
                className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </Button>
            )}
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
              <Icon size={16} />
            </div>
            {category && (
              <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">
                {category}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm font-medium text-muted-foreground/60 max-w-xl">
              {subtitle}
            </p>
          )}
        </div>
        
        {createLabel && onCreate && (
          <div className="flex items-center gap-3">
            <Button
              onClick={onCreate}
              className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={20} strokeWidth={3} /> {createLabel}
            </Button>
          </div>
        )}
      </header>

      {/* ── Search & Filter are handled by ResponsiveDataList when used as children ── */}

      {/* ── KPI Cards Section ── */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
          {kpiCards.map((card, index) => (
            <KPICardItem key={card.id} card={card} index={index} />
          ))}
        </div>
      )}

      {/* ── Nav Cards Section ── */}
      {navCards.length > 0 && (
        <div className="space-y-6 px-2">
          {navCardsTitle && (
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {navCardsTitle}
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navCards.map((card) => (
              <NavCardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* ── Main Content Section ── */}
      {(children || !empty) && (
        <div className={cn("flex-1 min-h-0", contentClassName)}>
          {children}
        </div>
      )}

      {/* ── Empty State ── */}
      {empty && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <Icon size={32} className="text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              {emptyTitle}
            </h3>
            <p className="text-sm text-muted-foreground/60">
              {emptyDescription}
            </p>
            {emptyAction && (
              <Button
                onClick={emptyAction.onClick}
                className="mt-4 rounded-xl"
              >
                <Plus size={16} className="mr-2" />
                {emptyAction.label}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-muted-foreground/60 animate-pulse">
              Loading...
            </p>
          </div>
        </div>
      )}

      {/* ── Custom Footer ── */}
      {footer && (
        <div className="shrink-0">
          {footer}
        </div>
      )}
    </div>
  )
}

// Re-export for convenience
export default DefaultLayout
