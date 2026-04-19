'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string | number
  label: string
  description?: string
  status: 'complete' | 'current' | 'upcoming'
}

export interface StepSidebarProps {
  steps: Step[]
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (step: number) => void
}

export function StepSidebar({ steps, currentStep, completedSteps, onStepClick }: StepSidebarProps) {
  return (
    <aside className="w-[220px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 h-full">
      <div className="absolute top-0 left-0 w-1 bg-primary h-full z-10" />
      <nav className="flex flex-col gap-1 p-4 pt-8">
        {steps.map((step, i) => {
          const isComplete = completedSteps.has(i)
          const isCurrent = i === currentStep
          const isClickable = isComplete || i <= currentStep + 1

          return (
            <button
              key={step.id}
              onClick={() => isClickable ? onStepClick(i) : undefined}
              disabled={!isClickable}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                isCurrent && 'bg-primary/10 dark:bg-primary/20',
                isComplete && !isCurrent && 'hover:bg-slate-50 dark:hover:bg-white/5',
                !isClickable && 'opacity-40 cursor-not-allowed',
              )}
            >
              <div className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                isComplete && 'bg-emerald-500/10 text-emerald-500',
                isCurrent && !isComplete && 'bg-primary/10 text-primary border-2 border-primary',
                !isComplete && !isCurrent && 'bg-slate-100 dark:bg-slate-800 text-muted-foreground/30',
              )}>
                {isComplete ? (
                  <Check size={14} />
                ) : (
                  <span className="text-[11px] font-bold">{i + 1}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className={cn(
                  'text-[11px] font-semibold truncate',
                  isCurrent && 'text-foreground',
                  isComplete && !isCurrent && 'text-foreground/70',
                  !isComplete && !isCurrent && 'text-muted-foreground/40',
                )}>
                  {step.label}
                </p>
              </div>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}