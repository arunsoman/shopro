import React from 'react'
import { Check } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface Step {
  id: string | number;
  label: string;
  description?: string;
  status: 'complete' | 'current' | 'upcoming';
}

export interface StepRailProps {
  steps: Step[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function StepRail({ steps, orientation = 'horizontal', className }: StepRailProps) {
  return (
    <div className={cn(
      "w-full py-4",
      orientation === 'vertical' ? "flex flex-col gap-6" : "flex items-center justify-between",
      className
    )}>
      {steps.map((step, i) => (
        <React.Fragment key={step.id}>
           <div className={cn(
             "flex items-center gap-3",
             orientation === 'vertical' ? "w-full" : "flex-1"
           )}>
             <div className={cn(
               "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
               step.status === 'complete' && "bg-success text-white",
               step.status === 'current' && "bg-primary text-white ring-4 ring-primary/20 scale-110",
               step.status === 'upcoming' && "bg-muted text-muted-foreground border border-border"
             )}>
               {step.status === 'complete' ? <Check className="h-4 w-4" /> : (i + 1)}
             </div>
             <div className="flex flex-col">
               <span className={cn(
                 "text-sm font-medium",
                 step.status === 'current' ? "text-foreground" : "text-muted-foreground"
               )}>{step.label}</span>
               {step.description && <span className="text-[10px] text-muted-foreground">{step.description}</span>}
             </div>
           </div>
           
           {i < steps.length - 1 && (
             <div className={cn(
               "bg-border transition-colors duration-500",
               orientation === 'horizontal' ? "h-[2px] flex-1 mx-4" : "w-[1px] h-6 ml-4",
               steps[i].status === 'complete' && "bg-success"
             )} />
           )}
        </React.Fragment>
      ))}
    </div>
  )
}
