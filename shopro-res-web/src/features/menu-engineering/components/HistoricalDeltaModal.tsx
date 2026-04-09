import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog"
import PeriodComparisonSelector from './PeriodComparisonSelector'
import { useAppStore } from '@/App'
import { Button } from '@/components/ui/Button'
import { GitCompare, Loader2 } from 'lucide-react'

interface HistoricalDeltaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function HistoricalDeltaModal({ open, onOpenChange }: HistoricalDeltaModalProps) {
  const openEngineeringComparison = useAppStore((s: any) => s.openEngineeringComparison)
  const [id1, setId1] = useState<number | null>(null)
  const [id2, setId2] = useState<number | null>(null)

  const handleExecute = () => {
    if (id1 && id2) {
      openEngineeringComparison(id1, id2)
      onOpenChange(false)
    }
  }

  const isValid = id1 && id2 && id1 !== id2

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 shadow-2xl rounded-2xl">
        <div className="bg-slate-50 dark:bg-black/20 px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground leading-none">Historical Comparison</DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mt-2 italic">
              Select two finalized audits
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8">
           <PeriodComparisonSelector 
             selectedId1={id1} 
             selectedId2={id2} 
             onSelectionChange={(sid1, sid2) => { setId1(sid1); setId2(sid2); }} 
           />
        </div>

        <div className="bg-slate-50 dark:bg-black/20 px-8 py-5 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
           <Button 
             onClick={handleExecute} 
             disabled={!isValid}
             className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] shadow-xl rounded-2xl transition-all active:scale-[0.98] group disabled:opacity-20"
           >
              <GitCompare size={14} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Compute Profit Drift
           </Button>
           <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest text-center">
             Verified registry audit active
           </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
