'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactOwnerSchema, type ContactOwnerForm } from '../lib/onboardingSchemas'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ChevronRight, UserPlus } from 'lucide-react'

interface Props {
  defaultValues?: Partial<ContactOwnerForm>
  onNext: (data: ContactOwnerForm) => void
  onBack: () => void
  isLoading?: boolean
}

export function ContactOwnerStep({ defaultValues, onNext, onBack, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactOwnerForm>({
    resolver: zodResolver(contactOwnerSchema),
    defaultValues: defaultValues ?? { phoneNumber: '', email: '', adminUsername: '', adminFullName: '', adminEmail: '' },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <UserPlus size={20} className="text-[var(--primary)]" />
        <h3 className="text-lg font-semibold">Primary Controller</h3>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 3 of 7</span>
      </div>

      <p className="text-[11px] text-muted-foreground/60 italic">The primary controller manages day-to-day operations and has full access to the command center.</p>

      <div className="w-full bg-slate-50/50 dark:bg-black/10 p-6 rounded-xl border border-slate-100 dark:border-white/5 space-y-6">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 italic border-b border-slate-100 dark:border-white/5 pb-3">Restaurant Contact</h4>
        
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Phone Number *</Label>
            <Input {...register('phoneNumber')} type="tel" placeholder="+91 98765 43210" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
            {errors.phoneNumber && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.phoneNumber.message}</p>}
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Restaurant Email *</Label>
            <Input {...register('email')} type="email" placeholder="restaurant@example.com" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
            {errors.email && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      <div className="w-full bg-slate-50/50 dark:bg-black/10 p-6 rounded-xl border border-slate-100 dark:border-white/5 space-y-6">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/40 italic border-b border-secondary/20 dark:border-secondary/10 pb-3 flex items-center gap-2">
          <UserPlus size={14} /> Admin Account
        </h4>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Full Legal Name *</Label>
          <Input {...register('adminFullName')} placeholder="e.g. Jane Doe" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
          {errors.adminFullName && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.adminFullName.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">ID Tag (UID) *</Label>
            <Input {...register('adminUsername')} placeholder="j.doe" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-mono font-bold text-sm" />
            {errors.adminUsername && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.adminUsername.message}</p>}
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic ml-1">Reporting Mail *</Label>
            <Input {...register('adminEmail')} type="email" placeholder="jane@domain.com" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-white/5 rounded-xl h-12 px-4 font-bold text-sm" />
            {errors.adminEmail && <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest ml-1">{errors.adminEmail.message}</p>}
          </div>
        </div>
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