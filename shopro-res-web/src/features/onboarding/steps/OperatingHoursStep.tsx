'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { operatingHoursSchema, type OperatingHoursForm, type OperatingHoursEntry, DayOfWeek, DEFAULT_HOURS } from '../lib/onboardingSchemas'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react'

interface Props {
  defaultValues?: Partial<OperatingHoursForm>
  onNext: (data: OperatingHoursForm) => void
  onBack: () => void
  isLoading?: boolean
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu',
  FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun',
}

export function OperatingHoursStep({ defaultValues, onNext, onBack, isLoading }: Props) {
  const hours = defaultValues?.hours ?? DEFAULT_HOURS

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OperatingHoursForm>({
    resolver: zodResolver(operatingHoursSchema),
    defaultValues: { hours },
  })

  const watchedHours = watch('hours') ?? hours

  const handleClosedToggle = (index: number, checked: boolean) => {
    setValue(`hours.${index}.isClosed`, checked)
  }

  const handleApplyAll = (fromIndex: number) => {
    const source = watchedHours[fromIndex]
    if (!source) return
    watchedHours.forEach((_, i) => {
      if (i === fromIndex) return
      if (watchedHours[i]?.isClosed) return // Don't overwrite closed days
      setValue(`hours.${i}.openTime`, source.openTime)
      setValue(`hours.${i}.closeTime`, source.closeTime)
    })
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <Clock size={20} className="text-[var(--primary)]" />
        <h3 className="text-lg font-semibold">Operating Hours</h3>
      </div>

      <p className="text-[11px] text-muted-foreground/60 italic">
        Set your daily hours. Uncheck days when you're closed.
      </p>

      <div className="space-y-2">
        {watchedHours.map((entry, index) => (
          <div key={entry.dayOfWeek} className="flex items-center gap-4 bg-slate-50/50 dark:bg-black/10 p-3 rounded-lg border border-slate-100 dark:border-white/5">
            {/* Day name + checkbox */}
            <label className="flex items-center gap-2 min-w-[80px]">
              <input
                type="checkbox"
                checked={!entry.isClosed}
                onChange={(e) => handleClosedToggle(index, !e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-bold">{DAY_LABELS[entry.dayOfWeek] || entry.dayOfWeek}</span>
            </label>

            {/* Time inputs or "Closed" label */}
            {entry.isClosed ? (
              <span className="text-muted-foreground/40 text-sm font-medium italic">Closed</span>
            ) : (
              <>
                <input
                  type="time"
                  {...register(`hours.${index}.openTime`)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-md h-9 px-2 text-sm font-mono"
                />
                <span className="text-muted-foreground/40 text-sm">—</span>
                <input
                  type="time"
                  {...register(`hours.${index}.closeTime`)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-md h-9 px-2 text-sm font-mono"
                />
              </>
            )}

            {/* Apply to all (except first day) */}
            {index === 0 && !entry.isClosed && (
              <button
                type="button"
                onClick={() => handleApplyAll(0)}
                className="text-[9px] font-bold uppercase tracking-widest text-primary/60 hover:text-primary ml-auto whitespace-nowrap"
              >
                Apply to all ↓
              </button>
            )}
          </div>
        ))}
      </div>

      {errors.hours && (
        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">
          {typeof errors.hours.message === 'string' ? errors.hours.message : 'Please fill in operating hours for all days'}
        </p>
      )}

      <div className="pt-4 flex flex-row gap-4">
        <Button type="button" variant="outline" onClick={onBack}
          className="flex-1 rounded-xl h-11 border-slate-200 dark:border-white/10 font-bold uppercase tracking-widest text-[10px]">
          <ArrowLeft size={12} className="mr-2" /> Previous
        </Button>
        <Button type="submit" disabled={isLoading}
          className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
          {isLoading ? 'Saving...' : <>Next <ChevronRight size={12} className="ml-1" /></>}
        </Button>
      </div>
    </form>
  )
}