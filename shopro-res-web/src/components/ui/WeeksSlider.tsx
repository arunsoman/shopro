import React from 'react'
import { cn } from "@/lib/utils"

export interface WeeksSliderProps {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  className?: string;
}

export function WeeksSlider({ value, options, onChange, className }: WeeksSliderProps) {
  return (
    <div className={cn("flex bg-muted/30 p-1 rounded-lg border", className)}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            "flex-1 px-3 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200",
            value === opt 
              ? "bg-surface text-primary shadow-sm ring-1 ring-border" 
              : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          {opt}W
        </button>
      ))}
    </div>
  )
}
