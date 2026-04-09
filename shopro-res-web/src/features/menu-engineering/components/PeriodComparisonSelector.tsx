import React from 'react'
import { useEngineeringPeriods } from '../hooks/useMenuEngineering'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import { GitCompare, Calendar } from 'lucide-react'
import { Label } from '@/components/ui/Label'

interface PeriodComparisonSelectorProps {
  onSelectionChange: (id1: number | null, id2: number | null) => void
  selectedId1: number | null
  selectedId2: number | null
}

export default function PeriodComparisonSelector({ onSelectionChange, selectedId1, selectedId2 }: PeriodComparisonSelectorProps) {
  const { data: periods } = useEngineeringPeriods()
  const finalizedPeriods = periods?.filter(p => p.status === 'FINALISED') ?? []

  return (
    <div className="space-y-8 py-2">
      <div className="bg-slate-50 dark:bg-white/[0.02] p-6 rounded-2xl border border-slate-100 dark:border-white/5 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
             <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Base Period (Historical)</Label>
          </div>
          <Select 
            value={selectedId1?.toString()} 
            onValueChange={(val) => onSelectionChange(parseInt(val), selectedId2)}
          >
            <SelectTrigger className="h-12 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/5 rounded-xl font-bold text-[13px] shadow-sm">
               <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-muted-foreground/40" />
                  <SelectValue placeholder="Select earlier baseline" />
               </div>
            </SelectTrigger>
            <SelectContent>
              {finalizedPeriods.map(p => (
                <SelectItem key={p.id} value={p.id.toString()} disabled={p.id === selectedId2}>
                  {formatDate(p.periodBeginDate)} – {formatDate(p.periodEndDate)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center relative">
           <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-white/5 border-dashed" />
           </div>
           <div className="relative z-10 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center text-muted-foreground/30">
              <GitCompare size={14} />
           </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <div className="w-1.5 h-1.5 rounded-full bg-primary" />
             <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Target Period (Comparative)</Label>
          </div>
          <Select 
            value={selectedId2?.toString()} 
            onValueChange={(val) => onSelectionChange(selectedId1, parseInt(val))}
          >
            <SelectTrigger className="h-12 bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/5 rounded-xl font-bold text-[13px] shadow-sm">
               <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-primary/40" />
                  <SelectValue placeholder="Select recent comparative" />
               </div>
            </SelectTrigger>
            <SelectContent>
              {finalizedPeriods.map(p => (
                <SelectItem key={p.id} value={p.id.toString()} disabled={p.id === selectedId1}>
                  {formatDate(p.periodBeginDate)} – {formatDate(p.periodEndDate)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!finalizedPeriods.length && (
         <div className="p-10 text-center space-y-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <Calendar size={32} className="mx-auto text-amber-500/20" />
            <p className="text-[11px] font-bold text-amber-600/60 uppercase tracking-widest leading-relaxed">
               Insufficient data: You must have at least two <span className="text-amber-600">FINALISED</span> periods to generate a delta report.
            </p>
         </div>
      )}
    </div>
  )
}
