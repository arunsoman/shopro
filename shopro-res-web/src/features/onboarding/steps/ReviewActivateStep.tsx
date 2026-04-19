'use client'

import { Button } from '@/components/ui/Button'
import { CheckCircle2, Edit } from 'lucide-react'
import type { OnboardingProgress } from '../lib/onboardingSchemas'

interface Props {
  progress: OnboardingProgress
  stepData: Record<string, unknown>
  onActivate: () => void
  onEditStep: (step: number) => void
  isLoading?: boolean
}

const STEP_LABELS = [
  'Basic Info',
  'Location',
  'Contact & Owner',
  'Menu Setup',
  'Operating Hours',
  'Documents',
  'Review & Activate',
]

export function ReviewActivateStep({ progress, stepData, onActivate, onEditStep, isLoading }: Props) {
  const data = stepData as Record<string, any>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircle2 size={24} className="text-emerald-500" />
        <div>
          <h3 className="text-xl font-semibold">Review & Activate</h3>
          <p className="text-[11px] text-muted-foreground/60 italic">Confirm your restaurant details before going live.</p>
        </div>
      </div>

      {/* Step 1 summary */}
      <div className="bg-slate-50/50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 1: Basic Information</h4>
          <button onClick={() => onEditStep(0)} className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            <Edit size={10} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground/50">Name:</span> <span className="font-bold">{data.step1?.name || '—'}</span></div>
          <div><span className="text-muted-foreground/50">Cuisine:</span> <span className="font-bold">{data.step1?.cuisineType || '—'}</span></div>
          <div><span className="text-muted-foreground/50">Timezone:</span> <span className="font-bold">{data.step1?.timezone || '—'}</span></div>
          <div><span className="text-muted-foreground/50">Tax Rate:</span> <span className="font-bold">{((data.step1?.taxAndBenefitsRate ?? 0.22) * 100).toFixed(0)}%</span></div>
        </div>
      </div>

      {/* Step 2 summary */}
      <div className="bg-slate-50/50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 2: Location</h4>
          <button onClick={() => onEditStep(1)} className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            <Edit size={10} /> Edit
          </button>
        </div>
        <div className="text-sm">
          <p className="font-bold">{data.step2?.address || '—'}</p>
          <p className="text-muted-foreground">{data.step2?.city}, {data.step2?.state} {data.step2?.pincode}</p>
        </div>
      </div>

      {/* Step 3 summary */}
      <div className="bg-slate-50/50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 3: Contact & Owner</h4>
          <button onClick={() => onEditStep(2)} className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            <Edit size={10} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-muted-foreground/50">Phone:</span> <span className="font-bold">{data.step3?.phoneNumber || '—'}</span></div>
          <div><span className="text-muted-foreground/50">Email:</span> <span className="font-bold">{data.step3?.email || '—'}</span></div>
          <div><span className="text-muted-foreground/50">Admin:</span> <span className="font-bold">{data.step3?.adminFullName || '—'}</span></div>
          <div><span className="text-muted-foreground/50">Username:</span> <span className="font-mono font-bold">{data.step3?.adminUsername || '—'}</span></div>
        </div>
      </div>

      {/* Step 4 summary */}
      <div className="bg-slate-50/50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 4: Menu Categories</h4>
          <button onClick={() => onEditStep(3)} className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            <Edit size={10} /> Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(data.step4?.costGroups as Array<{name: string; revenueCategory: string}> | undefined)?.map((g, i) => (
            <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
              {g.name}
            </span>
          )) ?? <span className="text-muted-foreground/40">No categories set</span>}
        </div>
      </div>

      {/* Step 5 summary */}
      <div className="bg-slate-50/50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 5: Operating Hours</h4>
          <button onClick={() => onEditStep(4)} className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            <Edit size={10} /> Edit
          </button>
        </div>
        <div className="text-sm text-muted-foreground">
          {(data.step5?.hours as Array<{dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean}> | undefined)?.map((h, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-slate-100/50 last:border-0">
              <span className="font-bold">{h.dayOfWeek.charAt(0) + h.dayOfWeek.slice(1).toLowerCase()}</span>
              <span>{h.isClosed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}</span>
            </div>
          )) ?? <span>No hours set</span>}
        </div>
      </div>

      {/* Step 6 summary */}
      <div className="bg-slate-50/50 dark:bg-black/10 rounded-xl border border-slate-100 dark:border-white/5 p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 italic">Step 6: Documents & Compliance</h4>
          <button onClick={() => onEditStep(5)} className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
            <Edit size={10} /> Edit
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground/50 text-[9px] uppercase tracking-widest block">GST Number</span>
            <span className="font-mono font-bold">{data.step6?.gstNumber || '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50 text-[9px] uppercase tracking-widest block">FSSAI Number</span>
            <span className="font-mono font-bold">{data.step6?.fssaiNumber || '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground/50 text-[9px] uppercase tracking-widest block">FSSAI Expiry</span>
            <span className="font-bold">{data.step6?.fssaiExpiryDate ? new Date(data.step6.fssaiExpiryDate).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>

      {/* Activate button */}
      <div className="pt-6 flex flex-col items-center gap-4">
        <p className="text-[11px] text-muted-foreground/60 text-center">
          By activating, your restaurant becomes visible to customers. You can still edit details from Settings.
        </p>
        <Button
          onClick={onActivate}
          disabled={isLoading}
          className="w-full max-w-md bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12 font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          {isLoading ? 'Activating...' : '🚀 Activate Restaurant'}
        </Button>
      </div>
    </div>
  )
}