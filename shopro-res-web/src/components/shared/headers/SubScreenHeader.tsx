import { ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SubScreenHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  onBack?: () => void;
  children?: React.ReactNode;
}

export function SubScreenHeader({ title, subtitle, icon: Icon, onBack, children }: SubScreenHeaderProps) {
  return (
    <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              className="rounded-xl h-9 w-9 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="space-y-0.5">
            {subtitle && (
              <div className="flex items-center gap-2">
                {Icon && <Icon size={12} className="text-muted-foreground/40" />}
                <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">
                  {subtitle}
                </span>
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              {title}
            </h1>
          </div>
        </div>

        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
