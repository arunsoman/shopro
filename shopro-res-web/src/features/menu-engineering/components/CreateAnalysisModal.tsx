import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog"
import PeriodSetupForm from './PeriodSetupForm'
import { useCreateEngineeringPeriod } from '../hooks/useMenuEngineering'
import { useToast } from "@/providers/ToastProvider"

interface CreateAnalysisModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateAnalysisModal({ open, onOpenChange }: CreateAnalysisModalProps) {
  const toast = useToast()
  const { mutate: createPeriod, isPending } = useCreateEngineeringPeriod()

  const handleCreate = (data: { periodBeginDate: string; periodEndDate: string; costGroupId?: number }) => {
    createPeriod(data, {
      onSuccess: () => {
        toast.success("Engineering period initialized. View results in drafts.")
        onOpenChange(false)
      },
      onError: (err: any) => {
        toast.error(err?.response?.data?.message || "Failed to initialize and evaluate period data.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl">
        <div className="bg-slate-50 dark:bg-black/20 px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-none">New Analysis Strategy</DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-2 italic">
              Initialize evaluation cycle
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
           <PeriodSetupForm onSubmit={handleCreate} isLoading={isPending} />
        </div>

        <div className="bg-slate-50 dark:bg-black/20 px-8 py-4 border-t border-slate-100 dark:border-white/5">
           <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest leading-relaxed">
             This process will scan all sales records in the given range and classify items into the popularity/margin matrix (Winner, Workhorse, Opportunity, Loser).
           </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
