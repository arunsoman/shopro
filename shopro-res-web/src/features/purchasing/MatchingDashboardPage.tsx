import { useAppStore } from '@/App';
import { 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShoppingCart, 
  PieChart, 
  ArrowUpRight,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn, formatDate } from '@/lib/utils';
import { useStaleGRNs } from './hooks/useGoodsReceipts';
import { useRestaurantId } from '@/providers/RestaurantProvider';

export default function MatchingDashboardPage() {
  const navigate = useAppStore(s => s.navigate);
  const back = useAppStore(s => s.back);
  const restaurantId = useRestaurantId();
  const { data: staleGRNs, isLoading } = useStaleGRNs(restaurantId);

  return (
    
    
    
    
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate overflow-y-auto">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => back()} className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-muted-foreground/40 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all">
                <ArrowLeft size={18} strokeWidth={3} />
             </Button>
             <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                <CheckCircle2 size={16} />
             </div>
             <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Reconciliation Hub</span>
          </div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">3-Way Match Audit</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight text-base transition-all hover:bg-white dark:hover:bg-white/5">
              Generate Audit Report
           </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-2">
         {[
           { label: 'Unmatched POs', value: '$12,450', color: 'indigo', icon: ShoppingCart },
           { label: 'Open GRNs', value: staleGRNs?.length || 0, color: 'emerald', icon: CheckCircle2 },
           { label: 'Variance Score', value: '4.2%', color: 'rose', icon: AlertCircle },
           { label: 'Avg Match Time', value: '2.1 Days', color: 'amber', icon: Clock },
         ].map((kpi, i) => (
           <div key={i} className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                 <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", `bg-${kpi.color}-500/10 text-${kpi.color}-600`)}>
                    <kpi.icon size={18} />
                 </div>
                 <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                    <ArrowUpRight size={10} /> 12%
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-3xl font-black tracking-tighter tabular-nums">{kpi.value}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">{kpi.label}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 pb-10">
         
         <div className="lg:col-span-2 space-y-8">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-sm">
               <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                  <div className="flex items-center gap-3">
                     <LayoutGrid size={14} className="text-muted-foreground/40" />
                     <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60">Pending Reconciliation</h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-500 italic tracking-[0.2em] uppercase">Uninvoiced Exceptions</span>
               </div>
               
               <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {staleGRNs && staleGRNs.length > 0 ? (
                    staleGRNs.map((grn: any) => (
                      <div 
                         key={grn.id} 
                         onClick={() => { useAppStore.setState({ selectedGRNId: String(grn.id) }); navigate("purchase-grn-detail"); }}
                         className="p-8 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                      >
                         <div className="flex items-center gap-6">
                            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                               <AlertCircle size={20} />
                            </div>
                            <div className="space-y-1">
                               <p className="text-base font-bold text-foreground">Missing Invoice: {grn.supplierName}</p>
                               <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
                                  <span>GRN #{grn.id}</span>
                                  <span>•</span>
                                  <span>Received {formatDate(grn.receivedDate)}</span>
                                  <span>•</span>
                                  <span className="text-rose-500">Stale Alert (3+ Days)</span>
                               </div>
                            </div>
                         </div>
                         <Button 
                            onClick={(e) => {
                               e.stopPropagation();
                               useAppStore.setState({ selectedInvoiceId: 'new' }); navigate("purchase-invoice-entry");
                            }} 
                            className="h-11 px-6 rounded-xl bg-indigo-600 font-bold tracking-tight shadow-lg shadow-indigo-500/20"
                         >
                            Resolve Entry
                         </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center space-y-4">
                       <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-muted-foreground/20">
                          <CheckCircle2 size={24} />
                       </div>
                       <p className="opacity-30 italic font-bold">All finalized receipts are reconciled.</p>
                    </div>
                  )}
               </div>
            </section>
         </div>

         {/* Sidebar Alerts & Summary */}
         <aside className="space-y-8">
            <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 space-y-10 relative overflow-hidden">
               <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 italic tracking-widest">Supplier Health</h4>
                     <PieChart size={14} className="opacity-40" />
                  </div>
                  <div className="space-y-4">
                     {[
                       { name: 'Standard Foods', match: 98 },
                       { name: 'Fresh Catch', match: 84 },
                       { name: 'Global Produce', match: 92 },
                     ].map((s, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[11px] font-black tracking-tight">
                             <span className="opacity-80">{s.name}</span>
                             <span>{s.match}%</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-white transition-all" style={{ width: `${s.match}%` }} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-10 rotate-12">
                  <CheckCircle2 size={160} />
               </div>
            </div>
         </aside>
      </div>

    </div>
  );
}
