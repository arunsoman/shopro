/**
 * POStatusBadge.tsx
 * ─────────────────────────────────────────────────────────────────
 * Visual status indicator for Purchase Orders.
 */

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

type POStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';

interface Props {
  status: POStatus;
  className?: string;
}

export default function POStatusBadge({ status, className }: Props) {
  const styles: Record<POStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400",
    SENT: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 font-black tracking-widest",
    PARTIAL: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    RECEIVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-black italic tracking-widest leading-none h-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
  };

  return (
    <Badge className={cn("h-6 rounded-lg font-bold text-[9px] px-3 tracking-widest border-none shadow-sm transition-all", styles[status], className)}>
      {status}
    </Badge>
  );
}
