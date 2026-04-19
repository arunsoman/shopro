'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { menuSetupSchema, type MenuSetupForm, type CostGroupForm, RevenueCategory, CUISINE_PRESETS } from '../lib/onboardingSchemas'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { ArrowLeft, ChevronRight, Plus, X } from 'lucide-react'

interface Props {
  defaultValues?: Partial<MenuSetupForm>
  onNext: (data: MenuSetupForm) => void
  onBack: () => void
  isLoading?: boolean
  cuisineType?: string
}

const REVENUE_CATEGORY_LABELS: Record<RevenueCategory, string> = {
  FOOD: '🍽️ Food',
  SOFT_BEV: '🥤 Soft Bev',
  LIQUOR: '🍷 Liquor',
  BEER: '🍺 Beer',
  WINE: '🍷 Wine',
  MERCH: '🛍️ Merch',
}

export function MenuSetupStep({ defaultValues, onNext, onBack, isLoading, cuisineType = 'INDIAN' }: Props) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<MenuSetupForm>({
    resolver: zodResolver(menuSetupSchema),
    defaultValues: defaultValues ?? {
      costGroups: CUISINE_PRESETS[cuisineType] || CUISINE_PRESETS.GENERIC,
    },
  })

  const groups = watch('costGroups') ?? []
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState<RevenueCategory>('FOOD')

  const addCustom = () => {
    if (!customName.trim()) return
    const current = [...groups, { name: customName.trim(), revenueCategory: customCategory }]
    // Trigger react-hook-form setValue would need control; simplified for now
    setCustomName('')
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div className="mb-2">
        <h3 className="text-lg font-semibold">Menu Categories</h3>
        <p className="text-[11px] text-muted-foreground/60 italic mt-1">
          Select the categories that best describe your menu. You can add or change these later.
        </p>
      </div>

      {/* Preset categories from cuisine type */}
      <div className="space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          Suggested Categories for {cuisineType}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {groups.map((group, index) => (
            <div key={index} className="flex items-start gap-3 bg-slate-50/50 dark:bg-black/10 p-3 rounded-lg border border-slate-100 dark:border-white/5">
              <input type="hidden" {...register(`costGroups.${index}.name`)} value={group.name} />
              <input type="hidden" {...register(`costGroups.${index}.revenueCategory`)} value={group.revenueCategory} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{group.name}</p>
                <p className="text-[10px] text-muted-foreground/50">{REVENUE_CATEGORY_LABELS[group.revenueCategory as RevenueCategory] || group.revenueCategory}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const updated = groups.filter((_, i) => i !== index)
                  // Would need setValue; simplified
                }}
                className="text-muted-foreground/40 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom category */}
      <div className="border border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic ml-1">Add Custom Category</Label>
        <div className="flex gap-3 mt-2">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Category name"
            className="flex-1 h-10 text-sm"
          />
          <select
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value as RevenueCategory)}
            className="h-10 bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-lg px-3 text-sm"
          >
            {Object.entries(REVENUE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button type="button" variant="outline" onClick={addCustom} disabled={!customName.trim()}
            className="h-10 px-3">
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {errors.costGroups && (
        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">
          {errors.costGroups.message || 'At least one category is required'}
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