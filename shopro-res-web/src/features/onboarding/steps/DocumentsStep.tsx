'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { documentsSchema, type DocumentsForm } from '../lib/onboardingSchemas'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ChevronRight, Shield } from 'lucide-react'

interface Props {
  defaultValues?: Partial<DocumentsForm>
  onNext: (data: DocumentsForm) => void
  onBack: () => void
  isLoading?: boolean
}

export function DocumentsStep({ defaultValues, onNext, onBack, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<DocumentsForm>({
    resolver: zodResolver(documentsSchema),
    defaultValues: defaultValues ?? { gstNumber: '', fssaiNumber: '', fssaiExpiryDate: undefined },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <Shield size={20} className="text-[var(--primary)]" />
        <h3 className="text-lg font-semibold">Documents & Compliance</h3>
      </div>

      <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-500/20 rounded-xl p-4">
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          ⚠️ GST and FSSAI registration numbers are legally required for food businesses in India.
          These will be visible on your restaurant profile.
        </p>
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          GST Number *
        </Label>
        <Input
          {...register('gstNumber')}
          placeholder="22AAAAA0000A1Z5"
          maxLength={15}
          className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-mono text-sm tracking-wider"
        />
        <p className="text-[9px] text-muted-foreground/30 italic ml-1">15-character GST identification number</p>
        {errors.gstNumber && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">{errors.gstNumber.message}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          FSSAI License Number *
        </Label>
        <Input
          {...register('fssaiNumber')}
          placeholder="12345678901234"
          maxLength={14}
          className="bg-slate-50/50 dark:bg-black/20 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-mono text-sm tracking-wider"
        />
        <p className="text-[9px] text-muted-foreground/30 italic ml-1">14-digit FSSAI food license number</p>
        {errors.fssaiNumber && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">{errors.fssaiNumber.message}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">
          FSSAI Expiry Date *
        </Label>
        <input
          type="date"
          {...register('fssaiExpiryDate', { valueAsDate: true })}
          className="w-full bg-slate-50/50 dark:bg-black/20 border border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 text-sm focus:ring-4 focus:ring-primary/5 focus:outline-none"
        />
        <p className="text-[9px] text-muted-foreground/30 italic ml-1">Must be a future date</p>
        {errors.fssaiExpiryDate && (
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1 ml-1">{errors.fssaiExpiryDate.message}</p>
        )}
      </div>

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