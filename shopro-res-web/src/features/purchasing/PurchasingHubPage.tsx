/**
 * PurchasingHubPage.tsx (SS2.0)
 * ─────────────────────────────────────────────────────────────────
 * Central Command for Purchasing, Procurement, and Invoicing.
 */

import React from 'react';
import { useAppStore } from "@/App";
import { FilePlus, FileText, Users, BarChart3, AlertCircle, ShoppingCart, CheckCircle2, ClipboardCheck, ArrowUpRight, Plus, Filter, LayoutGrid, TrendingUp } from 'lucide-react';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/shared/KpiCard";
import { usePurchasingDashboard } from "@/hooks/useInvoices";
import { format, startOfWeek } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";

import { SupplierForm } from "./components/SupplierForm";
import { SlideOver, SlideOverContent, SlideOverHeader, SlideOverTitle, SlideOverDescription } from "@/components/ui/SlideOver";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { useToast } from "@/providers/ToastProvider";
import { cn, currency } from "@/lib/utils";

export default function PurchasingHubPage() {
   const navigate = useAppStore(s => s.navigate);
   const restaurantId = useRestaurantId();
   const toast = useToast();

   const [showAddSupplier, setShowAddSupplier] = React.useState(false);
   const weekStart = format(startOfWeek(new Date()), 'yyyy-MM-dd');
   const { data: dashboard, isLoading } = usePurchasingDashboard(restaurantId, weekStart);
   const { mutate: createSupplier } = useCreateSupplier(restaurantId);

   const navCards = [
      { title: 'Reorder Staging', description: 'Mark items for reorder & raise POs', icon: LayoutGrid, screen: 'purchase-po-staging' as const, color: 'text-rose-500', bg: 'bg-rose-500/10' },
      { title: 'Purchase Orders', description: 'Procurement drafts & sent orders', icon: ShoppingCart, screen: 'purchase-po-list' as const, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
      { title: 'Goods Receipts', description: 'Verify and confirm deliveries', icon: CheckCircle2, screen: 'purchase-grn-list' as const, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
      { title: '3-Way Match', description: 'Reconcile PO vs GRN vs INV', icon: ClipboardCheck, screen: 'purchase-matching' as const, color: 'text-amber-600', bg: 'bg-amber-500/10' },
   ];

   return (
      <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-10 space-y-10 mi-animate overflow-y-auto">
         
         {/* Header Ledger Block */}
         <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 px-2">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm">
                     <ShoppingCart size={16} />
                  </div>
                  <span className="font-bold text-[10px] text-muted-foreground/40 uppercase tracking-[0.25em] italic">Purchasing Command</span>
               </div>
               <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">Purchasing Hub</h1>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={() => setShowAddSupplier(true)} className="h-14 px-8 rounded-2xl border-slate-200 dark:border-white/10 font-bold tracking-tight text-base transition-all hover:bg-white dark:hover:bg-white/5">
                  <Users className="mr-2 h-5 w-5" /> Add Supplier
               </Button>
               <Button onClick={() => { useAppStore.setState({ selectedPOId: 'new' }); navigate("purchase-po-editor"); }} className="h-14 px-8 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/20 gap-2.5 font-bold tracking-tight text-base transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Plus size={20} strokeWidth={3} /> Generate PO
               </Button>
            </div>
         </header>

         {/* KPI Matrix */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-2">
            {[
               { title: 'Weekly Spend', value: currency(dashboard?.weeklySpend || 0), delta: dashboard?.spendDelta || '0%', icon: BarChart3, color: 'indigo' },
               { title: 'Open PO Count', value: dashboard?.openPoCount?.toString() || '0', delta: 'Requires Follow-up', icon: ShoppingCart, color: 'amber' },
               { title: 'Unmatched GRNs', value: dashboard?.unmatchedGrnCount?.toString() || '0', delta: 'Critical Reconciliation', icon: CheckCircle2, color: 'rose' },
               { title: 'Matching Health', value: `${dashboard?.matchingHealth || 0}%`, delta: 'On Target', icon: ClipboardCheck, color: 'emerald' },
            ].map((kpi, i) => (
               <div key={i} className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-4 shadow-sm hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                     <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center", `bg-${kpi.color}-500/10 text-${kpi.color}-600`)}>
                        <kpi.icon size={18} />
                     </div>
                     <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px]">
                        <ArrowUpRight size={10} /> {kpi.delta}
                     </div>
                  </div>
                  <div className="space-y-1">
                     <p className="text-3xl font-black tracking-tighter tabular-nums">{kpi.value}</p>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30 italic">{kpi.title}</p>
                  </div>
               </div>
            ))}
         </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
            {navCards.map((card) => (
               <button
                  key={card.title}
                  onClick={() => navigate(card.screen)}
                  className="group p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] text-left transition-all hover:shadow-2xl hover:border-indigo-500/20 active:scale-[0.98] shadow-sm"
               >
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-6", card.bg, card.color)}>
                     <card.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground tracking-tight mb-2 group-hover:text-indigo-600 transition-colors uppercase">{card.title}</h3>
                  <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed italic">{card.description}</p>
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2 pb-10">
            <Card className="lg:col-span-2 p-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-center relative z-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
                     <TrendingUp size={14} className="text-indigo-600" />
                     Spend Frequency (8 Weeks)
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate("purchase-trend")} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-500/5 rounded-xl px-4">Analyze Trends</Button>
               </div>
               <div className="h-[280px] flex items-end gap-4 pb-4 relative z-10">
                  {(dashboard?.spendTrend || []).map((trend, i) => (
                     <div key={i} className="flex-1 bg-slate-50 dark:bg-black/20 rounded-2xl relative group h-full">
                        <div
                           className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-2xl transition-all duration-700 ease-out group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                           style={{ height: `${trend.trendPercentage}%` }}
                        />
                     </div>
                  ))}
               </div>
               <div className="flex justify-between text-[9px] font-black tracking-[0.2em] text-muted-foreground/30 opacity-60 uppercase relative z-10 mt-2">
                  <span>{dashboard?.spendTrend?.[0]?.weekLabel || 'Start'}</span>
                  <span>{dashboard?.spendTrend && dashboard.spendTrend.length > 0 ? dashboard.spendTrend[dashboard.spendTrend.length - 1].weekLabel + ' (Current)' : 'Current'}</span>
               </div>
            </Card>

            <Card className="p-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-[2.5rem] space-y-10 shadow-sm">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-foreground opacity-60 flex items-center gap-2">
                  <FileText size={14} className="text-sky-500" />
                  Latest Vouchers
               </h3>
               <div className="space-y-4">
                  {(dashboard?.latestVouchers || []).map(invoice => (
                     <div key={invoice.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 group hover:border-indigo-500/20 transition-all cursor-pointer">
                        <div className="space-y-1">
                           <p className="text-sm font-bold text-foreground">{(invoice.invoiceNumber && invoice.invoiceNumber.length > 0) ? invoice.invoiceNumber : `INV-${invoice.id}`}</p>
                           <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{invoice.supplierName || "Unknown Supplier"}</p>
                        </div>
                        <p className="text-sm font-black tabular-nums tracking-tighter">{currency(invoice.invoiceAmount)}</p>
                     </div>
                  ))}
               </div>
               <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-200 dark:border-white/5 font-black uppercase tracking-widest text-[11px] hover:bg-slate-50 dark:hover:bg-white/5" onClick={() => navigate("purchase-invoice-log")}>
                  See Integrated Log
               </Button>
            </Card>
         </div>

         <SlideOver open={showAddSupplier} onOpenChange={setShowAddSupplier}>
            <SlideOverContent className="sm:max-w-xl">
               <SlideOverHeader>
                  <SlideOverTitle className="text-2xl font-black tracking-tighter">Fast Registration</SlideOverTitle>
                  <SlideOverDescription className="text-xs font-medium opacity-50 italic">Onboard a new supplier entity immediately.</SlideOverDescription>
               </SlideOverHeader>
               <div className="mt-10 px-2">
                  <SupplierForm
                     onSave={(data) => {
                        createSupplier(data, {
                           onSuccess: () => {
                              toast.success("Supplier registered.");
                              setShowAddSupplier(false);
                           }
                        })
                     }}
                     onCancel={() => setShowAddSupplier(false)}
                  />
               </div>
            </SlideOverContent>
         </SlideOver>
      </div>
   )
}
