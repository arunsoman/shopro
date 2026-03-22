import React from 'react';
import { cn } from '@/lib/utils';
import { GlowingBorder, NeonEdges } from './neon-button';

export interface ShoproInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const ShoproInput = React.forwardRef<HTMLInputElement, ShoproInputProps>(
  ({ className, label, error, id, leftIcon, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {label}
          </label>
        )}
        <div className="group relative">
          <GlowingBorder spread={20} borderWidth={1} />
          <NeonEdges />
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-20 group-focus-within:text-blue-500 transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            {...props}
            id={inputId}
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 focus-visible:shadow-[0_0_20px_rgba(59,130,246,0.15)] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 relative z-10",
              leftIcon ? "pl-11 pr-4" : "px-4",
              error && "border-red-500 focus-visible:ring-red-500",
              className
            )}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

ShoproInput.displayName = "ShoproInput";
