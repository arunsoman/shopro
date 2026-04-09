import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'ACTIVE' | 'INACTIVE' 
  | 'DRAFT' | 'POSTED' | 'VOID' 
  | 'OPEN' | 'CLOSED' | 'FINALISED' 
  | 'WINNER' | 'WORKHORSE' | 'OPPORTUNITY' | 'LOSER'
  | 'LOW_STOCK' | 'NORMAL';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = (s: string) => {
    if (!s) return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    switch (s.toUpperCase()) {
      case 'ACTIVE':
      case 'POSTED':
      case 'FINALISED':
      case 'WINNER':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'INACTIVE':
      case 'VOID':
      case 'LOSER':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'DRAFT':
      case 'OPEN':
      case 'OPPORTUNITY':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'WORKHORSE':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'LOW_STOCK':
        return 'bg-red-500 text-white border-red-600 animate-pulse';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const displayStatus = status || 'UNKNOWN';

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-black tracking-tighter uppercase text-[10px] py-0.5 px-2 rounded-md", 
        getStatusStyles(displayStatus as string),
        className
      )}
    >
      {(displayStatus as string).replace('_', ' ')}
    </Badge>
  );
};

export default StatusBadge;