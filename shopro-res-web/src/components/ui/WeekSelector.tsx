import React from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "./Button"

export interface WeekSelectorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onPickerOpen?: () => void;
}

export function WeekSelector({ label, onPrev, onNext, onPickerOpen }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-surface border rounded-lg p-1">
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        className="h-8 px-3 text-xs font-semibold gap-2 border-x rounded-none"
        onClick={onPickerOpen}
      >
        <Calendar className="h-3.5 w-3.5 text-primary" />
        {label}
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
