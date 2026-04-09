/**
 * ToleranceIndicator.tsx
 * ─────────────────────────────────────────────────────────────────
 * Visual audit signal for variance tolerance bands.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface Props {
  value: number;
  threshold: number;
  className?: string;
}

export default function ToleranceIndicator({ value, threshold, className }: Props) {
  const isOver = value > threshold;
  const isAt = value === threshold;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn(
        "h-1.5 w-1.5 rounded-full transition-all",
        isOver ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" : 
        isAt ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : 
        "bg-emerald-500 opacity-30"
      )} />
      <span className={cn(
        "text-[8px] font-black uppercase tracking-widest leading-none h-2 transition-colors",
        isOver ? "text-rose-600" : isAt ? "text-amber-600" : "text-emerald-500/40 italic"
      )}>
        {isOver ? 'Over Threshold' : isAt ? 'At Boundary' : 'Safe Band'}
      </span>
    </div>
  );
}
