import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HubHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  onBack?: () => void;
  children?: React.ReactNode;
  /** When true, renders animated skeleton placeholders for subtitle and title. */
  loading?: boolean;
}

export function HubHeader({ title, subtitle, icon: Icon, onBack, children, loading = false }: HubHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-4">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all group shrink-0"
              >
                <ArrowLeft size={18} className="text-muted-foreground transition-transform group-hover:-translate-x-1" />
              </Button>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
            </>
          )}
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Icon size={14} />
              </div>
            )}
            {loading ? (
              <div className="h-2.5 w-24 bg-muted/20 rounded animate-pulse" />
            ) : (
              <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] italic">
                {subtitle}
              </span>
            )}
          </div>
        </div>
        {loading ? (
          <div className="h-9 w-48 bg-muted/20 rounded-lg animate-pulse" />
        ) : (
          <h1 className="text-4xl font-bold text-foreground tracking-tight leading-none">{title}</h1>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-3">{children}</div>
      )}
    </header>
  );
}
