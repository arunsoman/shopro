import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip-icon-button";
import { NeonEdges } from "./neon-button";

interface SocialLoginsProps {
  className?: string;
  onSelect?: (provider: string) => void;
}

export function SocialLogins({ className, onSelect }: SocialLoginsProps) {
  const providers = [
    { id: "google", name: "Google", icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
    )},
    { id: "microsoft", name: "Microsoft", icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#f25022" />
      </svg>
    )},
  ];

  return (
    <TooltipProvider>
      <div className={cn("space-y-4", className)}>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-400">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => onSelect?.(provider.id)}
              className="group relative flex items-center justify-center gap-2 h-11 rounded-xl ring-1 ring-border hover:ring-primary/50 hover:bg-primary/5 transition-all active:scale-95 overflow-hidden"
            >
              <NeonEdges />
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                    {provider.icon}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  Login with {provider.name}
                </TooltipContent>
              </Tooltip>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                {provider.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
