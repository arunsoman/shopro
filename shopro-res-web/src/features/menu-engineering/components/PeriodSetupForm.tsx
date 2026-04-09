import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useCostGroups } from '@/features/recipes-menu/hooks/useRecipes'
import { CalendarIcon, Loader2 } from 'lucide-react'

interface PeriodSetupFormProps {
  onSubmit: (data: { periodBeginDate: string; periodEndDate: string; costGroupId?: number }) => void
  isLoading?: boolean
}

export default function PeriodSetupForm({ onSubmit, isLoading }: PeriodSetupFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      periodBeginDate: '',
      periodEndDate: '',
      costGroupId: undefined as number | undefined
    }
  })

  const { data: costGroups, isLoading: loadingGroups } = useCostGroups()

  const onFormSubmit = (data: any) => {
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="periodBeginDate" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Start Date</Label>
          <div className="relative group">
            <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <Input
              id="periodBeginDate"
              type="date"
              {...register('periodBeginDate', { required: 'Start date is required' })}
              className="pl-10 h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 rounded-xl font-medium"
            />
          </div>
          {errors.periodBeginDate && <p className="text-[10px] text-destructive font-bold uppercase tracking-tighter mt-1">{errors.periodBeginDate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="periodEndDate" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">End Date</Label>
          <div className="relative group">
            <CalendarIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
            <Input
              id="periodEndDate"
              type="date"
              {...register('periodEndDate', { required: 'End date is required' })}
              className="pl-10 h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 rounded-xl font-medium"
            />
          </div>
          {errors.periodEndDate && <p className="text-[10px] text-destructive font-bold uppercase tracking-tighter mt-1">{errors.periodEndDate.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Menu Cost Group (Optional)</Label>
        <Select 
          onValueChange={(val) => setValue('costGroupId', val === 'ALL' ? undefined : parseInt(val))}
        >
          <SelectTrigger className="h-11 bg-slate-50/50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 rounded-xl font-medium">
            <SelectValue placeholder="Analyze entire menu library" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="ALL" className="font-bold text-[11px] uppercase tracking-wider">Default (Entire Menu)</SelectItem>
            {!loadingGroups && costGroups?.map(cg => (
              <SelectItem key={cg.id} value={cg.id.toString()} className="text-[13px] font-medium">
                {cg.name}
              </SelectItem>
            ))}
            {loadingGroups && <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" size={20} /></div>}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground/40 italic mt-1 font-medium leading-relaxed">
          Select a subset (e.g. 'Entrees') to isolate performance classification within that category alone.
        </p>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98] group"
        >
          {isLoading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Initialize Analysis Cycle'}
        </Button>
      </div>
    </form>
  )
}
