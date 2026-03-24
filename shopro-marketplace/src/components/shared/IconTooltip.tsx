"use client";

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React from 'react';

interface IconTooltipProps {
  label: string;           // What the icon means, e.g. "Delete item"
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

export function IconTooltip({
  label,
  children,
  side = 'top',
  delayDuration = 400,
}: IconTooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <span
            className="inline-flex items-center justify-center cursor-pointer"
            aria-label={label}
          >
            {children}
          </span>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={6}
            className="z-[9999] px-2 py-1 rounded bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 text-[var(--text-2xs)] shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 select-none max-w-[200px]"
          >
            {label}
            <TooltipPrimitive.Arrow
              className="fill-slate-900 dark:fill-slate-100"
            />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
