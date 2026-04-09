import { useAppStore, type Screen } from '@/App'
import { BarChart2, PlayCircle, GitCompare, BarChart3, TrendingUp, History, Activity, ArrowRight, ArrowLeft, Target, ChevronRight } from 'lucide-react'
import { KpiCard } from '@/components/shared/KpiCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useEngineeringPeriods } from '../hooks/useMenuEngineering'
import { formatDate, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import CreateAnalysisModal from '../components/CreateAnalysisModal'
import HistoricalDeltaModal from '../components/HistoricalDeltaModal'
import React, { useState } from 'react'

export default function EngineeringHub() {
   const navigate = useAppStore((s: any) => s.navigate)
   const openEngineeringDetail = useAppStore((s: any) => s.openEngineeringDetail)
   const [showCreateModal, setShowCreateModal] = useState(false)
   const [showDeltaModal, setShowDeltaModal] = useState(false)
   const { data: periods, isLoading } = useEngineeringPeriods()

   const latest = periods?.find(p => p.status === 'FINALISED')
   const drafts = periods?.filter(p => p.status === 'DRAFT') ?? []

   const navCards = [
      { label: 'New Analysis', desc: 'Initialize production evaluation', icon: PlayCircle, onClick: () => setShowCreateModal(true), color: 'bg-indigo-600', stat: 'INIT' },
      { label: 'Latest Results', desc: 'View terminal profit metrics', icon: BarChart2, screen: 'engineering-results' as any, id: latest?.id, color: 'bg-emerald-600', stat: 'PROF' },
      { label: 'Quadrant Matrix', desc: 'Visual performance classification', icon: Target, screen: 'engineering-quadrant' as any, id: latest?.id, color: 'bg-amber-600', stat: 'VIS' },
      { label: 'Historical Delta', desc: 'Multi-period delta comparison', icon: GitCompare, onClick: () => setShowDeltaModal(true), color: 'bg-slate-700', stat: 'DELTA' },
   ]

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans no-scrollbar">
         <div className="w-full max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            {/* Header Sector */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-4">
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('dashboard' as any)}
                        className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 transition-all group"
                     >
                        <ArrowLeft size={18} className="text-muted-foreground transition-transform group-hover:-translate-x-1" />
                     </Button>
                     <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
                     <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                           <BarChart3 size={14} />
                        </div>
                        <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] italic">Profit Optimization</span>
                     </div>
                  </div>
                  <h1 className="text-4xl font-bold text-foreground tracking-tight leading-none">Menu Engineering</h1>
               </div>

               <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-xl flex items-center gap-2">
                     <Activity size={12} />
                     <span className="text-[10px] font-bold uppercase tracking-wider tabular-nums">{drafts.length} Active Drafts</span>
                  </div>
               </div>
            </header>

            {/* Global Stats Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
               <KpiCard title="Evaluations Executed" value={String(periods?.length ?? 0)} loading={isLoading} icon={History} delta="Historical Lifecycle" deltaDir="flat" />
               <KpiCard title="Pending Finalization" value={String(drafts.length)} delta={drafts.length > 0 ? 'Action required' : 'Optimized'} deltaDir={drafts.length > 0 ? 'down' : 'up'} icon={TrendingUp} />
            </div>

            {/* Latest Analysis Focus */}
            {latest && (
               <div className="px-4">
                  <button
                     onClick={() => openEngineeringDetail(latest.id)}
                     className="group w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-8"
                  >
                     <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none duration-700 group-hover:scale-125 rotate-6">
                        <BarChart3 size={160} />
                     </div>

                     <div className="flex items-center gap-6 min-w-0 relative z-10">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:rotate-6">
                           <Target size={24} />
                        </div>
                        <div className="min-w-0">
                           <p className="text-[10px] font-bold text-emerald-600/40 uppercase tracking-[0.2em] mb-1.5 italic">Terminal Performance Verified</p>
                           <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">{formatDate(latest.periodBeginDate)} – {formatDate(latest.periodEndDate)}</h3>
                           {latest.costGroupName && <p className="text-[11px] font-bold text-muted-foreground/30 uppercase tracking-widest mt-1">{latest.costGroupName}</p>}
                        </div>
                     </div>

                     <div className="flex items-center gap-10 shrink-0 relative z-10">
                        <div className="text-right">
                           <p className="text-2xl font-bold font-mono tracking-tighter text-foreground leading-none">{latest.itemCount}</p>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 italic mt-1.5">SKUs Evaluated</p>
                        </div>
                        <StatusBadge status={latest.status} className="scale-110" />
                        <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-white/5 text-muted-foreground/20 group-hover:bg-primary/5 group-hover:text-primary flex items-center justify-center transition-all shadow-sm">
                           <ArrowRight size={20} />
                        </div>
                     </div>
                  </button>
               </div>
            )}

            {/* Navigational Control Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
               {navCards.map((c, i) => (
                  <button
                     key={c.label}
                     onClick={() => {
                        if (c.onClick) c.onClick()
                        else if (c.id) openEngineeringDetail(c.id)
                        else navigate(c.screen)
                     }}
                     className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 hover:border-primary/40 rounded-[2rem] p-8 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.98] overflow-hidden flex flex-col justify-between space-y-10"
                  >
                     <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none duration-700 group-hover:scale-150 rotate-12">
                        <c.icon size={120} />
                     </div>

                     <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110", c.color)}>
                        <c.icon size={22} />
                     </div>

                     <div className="space-y-3 relative z-10">
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-primary/40" />
                           <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">{c.stat}</span>
                        </div>
                        <h3 className="text-[15px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight uppercase">{c.label}</h3>
                        <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed group-hover:text-foreground transition-colors">{c.desc}</p>
                     </div>

                     <div className="flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                        Execute Action <ArrowRight size={12} className="opacity-60" />
                     </div>
                  </button>
               ))}
            </div>

            {/* Evaluation History Feed */}
            {(periods?.length ?? 0) > 0 && (
               <div className="px-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden relative overflow-x-auto">
                     <div className="px-8 py-5 border-b border-slate-100 dark:border-white/5 flex items-center gap-3 bg-slate-50/50 dark:bg-black/20">
                        <History size={12} className="text-muted-foreground/40" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 leading-none">Historical Evaluation Timeline</h3>
                     </div>

                     <div className="divide-y divide-slate-100 dark:divide-white/5 min-w-[700px]">
                        {periods!.slice(0, 8).map(p => (
                           <button
                              key={p.id}
                              onClick={() => openEngineeringDetail(p.id)}
                              className="w-full flex items-center justify-between px-8 py-5 hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group"
                           >
                              <div className="flex items-center gap-6">
                                 <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground/40 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                    <Activity size={14} />
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[13px] font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{formatDate(p.periodBeginDate)} – {formatDate(p.periodEndDate)}</p>
                                    <div className="flex items-center gap-3 mt-1 opacity-40">
                                       <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{p.itemCount} SKUs Evaluated</span>
                                       <div className="w-[1px] h-2 bg-slate-300 dark:bg-white/10" />
                                       <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{p.costGroupName ?? 'Composite Ledger'}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex items-center gap-8">
                                 <StatusBadge status={p.status} className="scale-90" />
                                 <ChevronRight size={18} className="text-muted-foreground/20 transition-transform group-hover:translate-x-1" />
                              </div>
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            )}
            
            <CreateAnalysisModal 
               open={showCreateModal} 
               onOpenChange={setShowCreateModal} 
            />

            <HistoricalDeltaModal
               open={showDeltaModal}
               onOpenChange={setShowDeltaModal}
            />
         </div>
      </div>
   )
}
