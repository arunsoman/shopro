'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationSchema, type LocationForm } from '../lib/onboardingSchemas'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ChevronRight, MapPin } from 'lucide-react'

interface Props {
  defaultValues?: Partial<LocationForm>
  onNext: (data: LocationForm) => void
  onBack: () => void
  isLoading?: boolean
}

export function LocationStep({ defaultValues, onNext, onBack, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: defaultValues ?? { address: '', city: '', state: '', pincode: '' },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <MapPin size={20} className="text-[var(--primary)]" />
        <h3 className="text-lg font-semibold">Where is your restaurant?</h3>
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Street Address *</Label>
        <Input {...register('address')} placeholder="123 Main St, Connaught Place" className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
        {errors.address && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.address.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">City *</Label>
          <Input {...register('city')} placeholder="Mumbai" className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
          {errors.city && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.city.message}</p>}
        </div>
        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">State *</Label>
          <Input {...register('state')} placeholder="Maharashtra" className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
          {errors.state && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.state.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Pincode *</Label>
          <Input {...register('pincode')} placeholder="400001" maxLength={6} className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
          {errors.pincode && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.pincode.message}</p>}
        </div>
        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Delivery Radius (km) <span className="text-muted-foreground/30">(optional)</span></Label>
          <input type="number" {...register('deliveryRadiusKm', { valueAsNumber: true })} placeholder="5" min="0" max="100" className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm focus:ring-4 focus:ring-primary/5 focus:outline-none" />
        </div>
      </div>

      {/* Hidden latitude/longitude fields — would be auto-populated by geocoding */}
      <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
      <input type="hidden" {...register('longitude', { valueAsNumber: true })} />

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