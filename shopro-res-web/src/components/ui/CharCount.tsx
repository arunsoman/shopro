import React from 'react'
import { cn } from "@/lib/utils"

export interface CharCountProps {
  current: number;
  max: number;
  className?: string;
}

export function CharCount({ current, max, className }: CharCountProps) {
  const isOver = current > max
  return (
    <div className={cn(
      "text-[10px] font-mono",
      isOver ? "text-error font-bold" : "text-muted-foreground",
      className
    )}>
      {current} / {max}
    </div>
  )
}
