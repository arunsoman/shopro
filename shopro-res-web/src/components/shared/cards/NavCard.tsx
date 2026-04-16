import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavCardContent {
  route: string;
  label: string;
  desc: string;
  iconBg: string;
  iconColor: string;
  Icon: LucideIcon;
  count?: number;
}

interface NavCardProps {
  card: NavCardContent;
  onClick: () => void;
  loading?: boolean;
}

function NavCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/10 border border-slate-200 dark:border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-muted/20" />
      <div className="space-y-2">
        <div className="h-3 w-24 bg-muted/20 rounded" />
        <div className="h-2 w-36 bg-muted/20 rounded" />
      </div>
    </div>
  );
}

const NavCard = React.forwardRef<HTMLButtonElement, NavCardProps>(({ card, onClick, loading }, ref) => {
  if (loading) return <NavCardSkeleton />;

  return (
    <button
      ref={ref}
      onClick={onClick}
      className="group bg-white dark:bg-slate-800/10 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
    >
      <div className={cn("relative w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.iconBg)}>
        <card.Icon className={cn("h-5 w-5", card.iconColor)} />
        {card.count !== undefined && card.count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-bold px-1.5 min-w-[1.25rem] text-center rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900">
            {card.count}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{card.label}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:translate-x-1 transition-all" />
      </div>
      <p className="text-[11px] text-muted-foreground/60 leading-relaxed font-medium">{card.desc}</p>
    </button>
  );
});

NavCard.displayName = 'NavCard';
export default NavCard;
