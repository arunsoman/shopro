import React from 'react';
import { cn } from '@/lib/utils';

// ── DataList ────────────────────────────────────────────────────

interface DataListProps {
  children?: React.ReactNode;
  className?: string;
  divided?: boolean;
  /** When true, renders `skeletonCount` skeleton rows instead of children. */
  loading?: boolean;
  skeletonCount?: number;
}

export function DataList({ children, className, divided = false, loading = false, skeletonCount = 3 }: DataListProps) {
  return (
    <div className={cn(
      'w-full',
      divided ? 'divide-y divide-slate-100 dark:divide-white/5' : 'space-y-4',
      className,
    )}>
      {loading
        ? Array.from({ length: skeletonCount }).map((_, i) => <DataListItem key={i} loading title="" />)
        : children}
    </div>
  );
}

// ── DataListItem ────────────────────────────────────────────────

interface DataListItemProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  value?: string | React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** When true, renders an animated skeleton row. */
  loading?: boolean;
}

export function DataListItem({ title, subtitle, value, onClick, className, loading = false }: DataListItemProps) {
  if (loading) {
    return (
      <div className={cn(
        'flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 animate-pulse',
        className,
      )}>
        <div className="space-y-2">
          <div className="h-3 w-28 bg-muted/20 rounded" />
          <div className="h-2 w-20 bg-muted/20 rounded" />
        </div>
        <div className="h-3 w-14 bg-muted/20 rounded" />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 transition-all',
        onClick ? 'cursor-pointer group hover:border-primary/40 dark:hover:border-primary/40 hover:shadow-sm' : '',
        className,
      )}
    >
      <div className="space-y-1">
        <div className="text-sm font-bold text-foreground">{title}</div>
        {subtitle && (
          <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{subtitle}</div>
        )}
      </div>
      {value && (
        <div className="text-sm font-black tabular-nums tracking-tighter flex items-center justify-end">{value}</div>
      )}
    </div>
  );
}
