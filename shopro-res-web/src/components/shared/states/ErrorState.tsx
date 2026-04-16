import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 py-16 px-4 text-center',
      className,
    )}>
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
        <AlertCircle className="h-7 w-7 text-rose-500" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="font-bold text-sm text-foreground">Failed to load</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="rounded-xl mt-1">
          Try again
        </Button>
      )}
    </div>
  );
}
