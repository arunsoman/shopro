/**
 * MatchStatusBadge.tsx
 * ─────────────────────────────────────────────────────────────────
 * Reconciliation status indicator for 3rd-party audits.
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type MatchStatus = 'MATCHED' | 'PARTIAL' | 'UNMATCHED' | 'VARIANCE';

interface Props {
  status: MatchStatus;
  className?: string;
}

export default function MatchStatusBadge({ status, className }: Props) {
  const styles: Record<MatchStatus, string> = {
    MATCHED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black",
    PARTIAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    UNMATCHED: "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400",
    VARIANCE: "bg-rose-500/10 text-rose-600 border-rose-500/20 font-black animate-pulse"
  };

  return (
    <Badge variant="outline" className={cn("h-6 rounded-lg font-bold text-[9px] px-3 tracking-[0.2em] uppercase border shadow-sm transition-all", styles[status], className)}>
      {status}
    </Badge>
  );
}
