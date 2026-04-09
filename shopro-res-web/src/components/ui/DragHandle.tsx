import React from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className }: DragHandleProps) {
  return (
    <div className={cn("cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground transition-colors", className)}>
      <GripVertical className="h-5 w-5" />
    </div>
  )
}
