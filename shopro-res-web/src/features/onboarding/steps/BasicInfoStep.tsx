'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { basicInfoSchema, type BasicInfoForm, CuisineType, CUISINE_PRESETS } from '../lib/onboardingSchemas'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { ChevronRight } from 'lucide-react'

interface Props {
  defaultValues?: Partial<BasicInfoForm>
  onNext: (data: BasicInfoForm) => void
  onBack?: () => void
  isLoading?: boolean
}

const CUISINE_OPTIONS: { value: CuisineType; label: string; group: string }[] = [
  // Indian
  { value: 'NORTH_INDIAN', label: 'North Indian', group: 'Indian' },
  { value: 'SOUTH_INDIAN', label: 'South Indian', group: 'Indian' },
  { value: 'BIRYANI', label: 'Biryani', group: 'Indian' },
  // Asian
  { value: 'CHINESE', label: 'Chinese', group: 'Asian' },
  { value: 'JAPANESE', label: 'Japanese', group: 'Asian' },
  { value: 'KOREAN', label: 'Korean', group: 'Asian' },
  { value: 'THAI', label: 'Thai', group: 'Asian' },
  // Western
  { value: 'ITALIAN', label: 'Italian', group: 'Western' },
  { value: 'MEXICAN', label: 'Mexican', group: 'Western' },
  { value: 'MEDITERRANEAN', label: 'Mediterranean', group: 'Western' },
  { value: 'CONTINENTAL', label: 'Continental', group: 'Western' },
  // Casual
  { value: 'FAST_FOOD', label: 'Fast Food', group: 'Casual' },
  { value: 'CAFE', label: 'Café', group: 'Casual' },
  { value: 'BAKERY', label: 'Bakery', group: 'Casual' },
  { value: 'PIZZA', label: 'Pizza', group: 'Casual' },
  { value: 'BURGER', label: 'Burger', group: 'Casual' },
  { value: 'STREET_FOOD', label: 'Street Food', group: 'Casual' },
  // Other
  { value: 'DESSERT', label: 'Dessert', group: 'Specialty' },
  { value: 'BEVERAGE', label: 'Beverage', group: 'Specialty' },
  { value: 'SEAFOOD', label: 'Seafood', group: 'Specialty' },
  { value: 'BBQ', label: 'BBQ', group: 'Specialty' },
  { value: 'MIDDLE_EASTERN', label: 'Middle Eastern', group: 'Specialty' },
  { value: 'HEALTHY_FOOD', label: 'Healthy Food', group: 'Specialty' },
  { value: 'OTHER', label: 'Other', group: 'Other' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Standard)' },
  { value: 'Asia/Kolkata', label: 'IST — India (UTC+5:30)' },
  { value: 'Asia/Dubai', label: 'GST — Dubai (UTC+4)' },
  { value: 'Asia/Singapore', label: 'SGT — Singapore (UTC+8)' },
  { value: 'America/New_York', label: 'EST — New York (UTC-5)' },
  { value: 'America/Chicago', label: 'CST — Chicago (UTC-6)' },
  { value: 'America/Denver', label: 'MST — Denver (UTC-7)' },
  { value: 'America/Los_Angeles', label: 'PST — Los Angeles (UTC-8)' },
  { value: 'Europe/London', label: 'GMT — London (UTC+0)' },
  { value: 'Europe/Paris', label: 'CET — Paris (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'JST — Tokyo (UTC+9)' },
  { value: 'Australia/Sydney', label: 'AEST — Sydney (UTC+11)' },
]

export function BasicInfoStep({ defaultValues, onNext, onBack, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: defaultValues ?? {
      timezone: 'Asia/Kolkata',
      cuisineType: 'NORTH_INDIAN',
      taxAndBenefitsRate: 0.22,
      weekStartDay: 'MONDAY',
    },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      {/* Restaurant Name */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          Legal Entity Name *
        </Label>
        <Input
          {...register('name')}
          placeholder="e.g. Blue Ocean Bistro"
          className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm focus:ring-4 focus:ring-primary/5"
        />
        {errors.name && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Cuisine Type */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          Cuisine Type *
        </Label>
        <select
          {...register('cuisineType')}
          className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:outline-none"
        >
          {Object.entries(
            CUISINE_OPTIONS.reduce((acc, opt) => {
              if (!acc[opt.group]) acc[opt.group] = []
              acc[opt.group].push(opt)
              return acc
            }, {} as Record<string, typeof CUISINE_OPTIONS>)
          ).map(([group, opts]) => (
            <optgroup key={group} label={group}>
              {opts.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {errors.cuisineType && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">
            {errors.cuisineType.message}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          Operational Timezone *
        </Label>
        <select
          {...register('timezone')}
          className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:outline-none"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          Description <span className="text-muted-foreground/30">(optional)</span>
        </Label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="A short tagline or description of your restaurant..."
          className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/5 focus:outline-none resize-none"
          maxLength={500}
        />
        {errors.description && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Tax & Benefits Rate */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          Taxes & Benefits Rate <span className="text-muted-foreground/30">(default 22%)</span>
        </Label>
        <div className="relative">
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            {...register('taxAndBenefitsRate', { valueAsNumber: true })}
            className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 pr-8 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:outline-none"
            placeholder="0.22"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">%</span>
        </div>
        {errors.taxAndBenefitsRate && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">
            {errors.taxAndBenefitsRate.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="pt-4 flex flex-row gap-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}
            className="flex-1 rounded-xl h-11 border-slate-200 dark:border-white/10 font-bold uppercase tracking-widest text-[10px]">
            ← Back
          </Button>
        )}
        <Button type="submit" disabled={isLoading}
          className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all">
          {isLoading ? 'Saving...' : <>Next <ChevronRight size={12} className="ml-1" /></>}
        </Button>
      </div>
    </form>
  )
}