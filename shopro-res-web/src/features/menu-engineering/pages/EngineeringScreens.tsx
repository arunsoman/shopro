import { useAppStore } from '@/App'
import { BarChart2, PlayCircle, GitCompare, BarChart3, TrendingUp, History, Activity, ArrowRight, Target, ChevronRight } from 'lucide-react'
import { KpiCard } from '@/components/shared/cards/KpiCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { useEngineeringPeriods } from '../hooks/useMenuEngineering'
import { formatDate } from '@/lib/utils'
import NavCard from '@/components/shared/cards/NavCard'
import type { NavCardContent } from '@/components/shared/cards/NavCard'
import { HubHeader } from '@/components/shared/headers/HubHeader'
import { Suspendable } from '@/components/shared/Suspendable'
import CreateAnalysisModal from '../components/CreateAnalysisModal'
import HistoricalDeltaModal from '../components/HistoricalDeltaModal'
import { useState } from 'react'

// Engineering-specific nav card extends NavCardContent with local action/screen routing
interface EngineeringNavCard extends NavCardContent {
  action?: () => void;
  screen?: string;
  id?: number;
}

export default function EngineeringHub() {
  const navigate = useAppStore((s: any) => s.navigate)
  const openEngineeringDetail = useAppStore((s: any) => s.openEngineeringDetail)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeltaModal, setShowDeltaModal] = useState(false)
  const { data: periods, isLoading } = useEngineeringPeriods()

  const latest = periods?.find(p => p.status === 'FINALISED')
  const drafts = periods?.filter(p => p.status === 'DRAFT') ?? []

  const navCards: EngineeringNavCard[] = [
    { label: 'New Analysis',    desc: 'Initialize production evaluation',   Icon: PlayCircle, action: () => setShowCreateModal(true), iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-600', route: '' },
    { label: 'Latest Results',  desc: 'View terminal profit metrics',       Icon: BarChart2,  screen: 'engineering-results' as any, id: latest?.id, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600', route: '' },
    { label: 'Quadrant Matrix', desc: 'Visual performance classification',  Icon: Target,     screen: 'engineering-quadrant' as any, id: latest?.id, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-600', route: '' },
    { label: 'Historical Delta', desc: 'Multi-period delta comparison',     Icon: GitCompare, action: () => setShowDeltaModal(true), iconBg: 'bg-slate-500/10', iconColor: 'text-slate-700', route: '' },
  ]

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex items-center justify-center p-4 font-sans no-scrollbar">
      <div className="w-full max-w-5xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">

        <HubHeader
          title="Menu Engineering"
          subtitle="Profit Optimization"
          icon={BarChart3}
          onBack={() => navigate('dashboard' as any)}
          loading={isLoading}
        >
          <div className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-xl flex items-center gap-2">
            <Activity size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider tabular-nums">{drafts.length} Active Drafts</span>
          </div>
        </HubHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
          <KpiCard title="Evaluations Executed"  value={String(periods?.length ?? 0)} loading={isLoading} icon={History}   delta="Historical Lifecycle" deltaDir="flat" />
          <KpiCard title="Pending Finalization"  value={String(drafts.length)}         loading={isLoading} icon={TrendingUp} delta={drafts.length > 0 ? 'Action required' : 'Optimized'} deltaDir={drafts.length > 0 ? 'down' : 'up'} />
        </div>

        {/* Latest Analysis Focus */}
        <Suspendable
          isLoading={isLoading}
          className="px-4"
          skeleton={
            <div className="rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 p-8 animate-pulse space-y-4">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 rounded-2xl bg-muted/20" />
                <div className="space-y-2">
                  <div className="h-2 w-32 bg-muted/20 rounded" />
                  <div className="h-5 w-48 bg-muted/20 rounded" />
                </div>
              </div>
            </div>
          }
        >
          {latest && (
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
          )}
        </Suspendable>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {navCards.map((c) => (
            <NavCard
              key={c.label}
              card={c}
              loading={isLoading}
              onClick={() => {
                if ((c as any).action) (c as any).action()
                else if ((c as any).id) openEngineeringDetail((c as any).id)
                else navigate((c as any).screen)
              }}
            />
          ))}
        </div>

        {/* Evaluation History */}
        <Suspendable
          isLoading={isLoading}
          className="px-4"
          skeleton={
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-sm overflow-hidden animate-pulse">
              <div className="px-8 py-5 border-b border-slate-100 dark:border-white/5 h-14 bg-slate-50/50 dark:bg-black/20" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-white/5 last:border-0">
                  <div className="flex items-center gap-6">
                    <div className="h-8 w-8 rounded-lg bg-muted/10" />
                    <div className="space-y-2">
                      <div className="h-3 w-40 bg-muted/10 rounded" />
                      <div className="h-2 w-24 bg-muted/10 rounded" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-muted/10 rounded-full" />
                </div>
              ))}
            </div>
          }
        >
          {(periods?.length ?? 0) > 0 && (
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
          )}
        </Suspendable>

        <CreateAnalysisModal open={showCreateModal} onOpenChange={setShowCreateModal} />
        <HistoricalDeltaModal open={showDeltaModal} onOpenChange={setShowDeltaModal} />
      </div>
    </div>
  )
}
