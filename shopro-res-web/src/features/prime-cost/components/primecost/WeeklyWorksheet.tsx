import { useState } from "react"
import { useWeeklyReport, useFinaliseReport } from "@/hooks/usePrimeCost"
import type { WeeklyPrimeCostReport } from "@/types"
import { LoadingState, ErrorState, Money, Pct, weekOffset, formatWeek } from "../ui/shared"
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/Button"
import {
   FileText,
   ChevronDown,
   ChevronLeft,
   ChevronRight,
   Download,
   CheckCircle2,
   AlertCircle,
   TrendingUp,
   Users,
   Clock,
   DollarSign,
   Lock
} from "lucide-react"

export default function WeeklyWorksheet({
   restaurantId,
   onBack
}: {
   restaurantId: number;
   onBack: () => void;
}) {
   const [weekStart, setWeekStart] = useState(currentMonday())
   const [confirming, setConfirming] = useState(false)
   const { data, isLoading: loading, error, refetch: refresh } = useWeeklyReport(restaurantId, weekStart)
   const { mutateAsync: finaliseReport } = useFinaliseReport(restaurantId)

   async function finalise() {
      try {
         await finaliseReport(weekStart)
      } finally {
         setConfirming(false)
      }
   }

   if (loading) return <LoadingState />
   if (error) return <ErrorState message={error instanceof Error ? error.message : String(error)} onRetry={refresh} />
   if (!data) return null

   const budget = data.budget

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950 overflow-hidden flex justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                        <FileText size={20} />
                     </div>
                     <div className="space-y-0.5">
                        <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Internal Audit</span>
                        <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Weekly Performance Worksheet</h1>
                     </div>
                  </div>

                  <div className="flex items-center gap-3">
                     <WeekNav weekStart={weekStart} onChange={setWeekStart} />
                     <StatusBadge status={data.status} />
                  </div>
               </div>

               <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-4 pt-4">
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                     <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" /> Comparative View Active</span>
                     <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" /> Budget Variance Threshold: 2%</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <Button variant="outline" size="sm" className="rounded-xl h-8 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-white/10 gap-2">
                        <Download size={14} />
                        CSV
                     </Button>
                     {data.status === "DRAFT" && (
                        <Button
                           onClick={() => setConfirming(true)}
                           size="sm"
                           className="rounded-xl h-8 px-4 bg-primary text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/10"
                        >
                           <Lock size={14} />
                           Finalise Snapshot
                        </Button>
                     )}
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar bg-slate-50/20 dark:bg-transparent">
               <div className="space-y-8 pb-10">
                  {/* Financial Matrix */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                     <ColHeaders />

                     <Section label="Revenue Distribution">
                        <DataRow label="Product Sales (Food)" indent actualD={data.grossSales * 0.80} actualPct={0.80} budgetD={budget ? budget.totalSalesForecast * budget.foodSalesPct : null} budgetPct={budget?.foodSalesPct ?? null} />
                        <DataRow label="Support Beverage" indent actualD={data.grossSales * 0.03} actualPct={0.03} budgetD={null} budgetPct={budget?.softBevSalesPct ?? null} />
                        <DataRow label="Refined Spirits" indent actualD={data.grossSales * 0.06} actualPct={0.06} budgetD={null} budgetPct={budget?.liquorSalesPct ?? null} />
                        <DataRow label="Brewed Selections" indent actualD={data.grossSales * 0.06} actualPct={0.06} budgetD={null} budgetPct={null} />
                        <DataRow label="Cellar Operations" indent actualD={data.grossSales * 0.04} actualPct={0.04} budgetD={null} budgetPct={null} />
                        <DataRow label="Ancillary Revenue" indent actualD={data.grossSales * 0.01} actualPct={0.01} budgetD={null} budgetPct={null} />
                        <DataRow label="Aggregate Gross Intake" bold actualD={data.grossSales} actualPct={1.0} budgetD={budget?.totalSalesForecast ?? null} budgetPct={1.0} />
                        <DataRow label="Compensatory Credits" indent actualD={-data.compsDiscounts} actualPct={-(data.compsDiscounts / data.grossSales)} budgetD={null} budgetPct={-(budget?.compsPct ?? 0)} />
                        <DataRow label="Net Operational Intake" bold actualD={data.netSales} actualPct={data.netSales / data.grossSales} budgetD={null} budgetPct={null} />
                     </Section>

                     <Section label="Resource Expenditures (COS)">
                        <DataRow label="Raw Product Procurement" indent actualD={data.purchasesFood} actualPct={null} budgetD={null} budgetPct={null} />
                        <DataRow label="Inaugural Valuation" indent actualD={data.begInventoryFood} actualPct={null} budgetD={null} budgetPct={null} />
                        <DataRow label="Terminal Valuation" indent actualD={data.endInventoryFood} actualPct={null} budgetD={null} budgetPct={null} />
                        <DataRow label="Product COS Verified" bold actualD={data.actualFoodCos} actualPct={data.actualFoodCos / data.grossSales} budgetD={budget ? budget.totalSalesForecast * budget.foodCosPctTarget : null} budgetPct={budget?.foodCosPctTarget ?? null} />
                        <DataRow label="Liquid COS Verified" bold actualD={data.actualBevCos} actualPct={data.actualBevCos / data.grossSales} budgetD={null} budgetPct={budget?.bevCosPctTarget ?? null} />
                        <DataRow label="Combined Operational COS" bold actualD={data.totalActualCos} actualPct={data.totalActualCosPct} budgetD={null} budgetPct={null} />
                        <DataRow label="Predictive Theoretical COS" indent info actualD={data.theoreticalCos} actualPct={data.theoreticalCosPct} budgetD={null} budgetPct={null} />
                        <DataRow label="Operational Variance (Shrinkage)" indent danger actualD={data.shrinkageVariance} actualPct={data.shrinkageVariancePct} budgetD={null} budgetPct={null} />
                     </Section>

                     <Section label="Human Capital Analytics">
                        <DataRow label="Administrative Overhead" indent actualD={data.mgmtLabor} actualPct={data.mgmtLabor / data.grossSales} budgetD={null} budgetPct={budget?.mgmtLaborPctTarget ?? null} />
                        <DataRow label="Operational Personnel" indent actualD={data.hourlyLabor} actualPct={data.hourlyLabor / data.grossSales} budgetD={null} budgetPct={budget?.hourlyLaborPctTarget ?? null} />
                        <DataRow label="Statutory Burdens" indent actualD={data.payrollTaxesBenefits} actualPct={data.payrollTaxesBenefits / data.grossSales} budgetD={null} budgetPct={null} />
                        <DataRow label="Aggregate Labor Cost" bold actualD={data.totalLabor} actualPct={data.totalLaborPct} budgetD={null} budgetPct={null} />
                        <DataRow label="Projected Schedule Cost" indent info actualD={data.scheduledLabor} actualPct={data.scheduledLabor / data.grossSales} budgetD={null} budgetPct={null} />
                        <DataRow label="Schedule Variance Net" indent warn actualD={data.laborVariance} actualPct={data.laborVariance / data.grossSales} budgetD={null} budgetPct={null} />
                     </Section>

                     {/* Terminal Summary */}
                     <div className="bg-slate-900 dark:bg-black text-white py-1">
                        <DataRow label="Terminal Prime Cost (Gross)" bold dark actualD={data.primeCostGross} actualPct={data.primeCostGrossPct} budgetD={null} budgetPct={null} danger={data.primeCostGrossPct > 0.65} />
                        <DataRow label="Terminal Prime Cost (Net)" bold dark actualD={data.primeCostNet} actualPct={data.primeCostNetPct} budgetD={null} budgetPct={null} danger={data.primeCostNetPct > 0.65} />
                        <DataRow label="Fiscal Gross Margin" bold dark actualD={data.grossMargin} actualPct={data.grossMarginPct} budgetD={null} budgetPct={null} />
                     </div>
                  </div>

                  {/* Functional Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <MiniStat label="Traffic Volume" value={(data.totalCovers || 0).toLocaleString()} icon={Users} />
                     <MiniStat label="Check Velocity" value={<Money v={data.checkAverage} />} icon={DollarSign} />
                     <MiniStat label="Labor Efficiency" value={<Money v={data.laborCostPerCover} />} icon={Clock} />
                     <MiniStat label="Revenue per Hour" value={<Money v={data.salesPerLaborHour} />} icon={TrendingUp} />
                  </div>
               </div>
            </main>
         </div>

         {/* Confirmation Modal */}
         {confirming && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300">
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  <div className="flex flex-col items-center text-center space-y-4">
                     <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-sm border border-primary/20">
                        <Lock size={28} />
                     </div>
                     <div className="space-y-1.5">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">Archive Fiscal Instance?</h3>
                        <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed px-4">
                           You are about to lock the report for the week of <span className="text-foreground font-bold">{formatWeek(weekStart)}</span>. This protocol is irreversible and will freeze all ledger values.
                        </p>
                     </div>

                     <div className="w-full pt-6 flex flex-col sm:flex-row gap-3">
                        <Button
                           variant="outline"
                           onClick={() => setConfirming(false)}
                           className="flex-1 rounded-xl h-11 border-slate-200 dark:border-white/10 font-bold uppercase tracking-widest text-[10px]"
                        >
                           Abort Archival
                        </Button>
                        <Button
                           onClick={finalise}
                           className="flex-1 bg-primary text-white rounded-xl h-11 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                        >
                           Confirm Finalize
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}

function ColHeaders() {
   return (
      <div className="grid grid-cols-[220px_1fr_1fr_1fr_1fr_1fr_1fr] bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5 px-4 min-w-[900px]">
         <div className="py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Audit Target</div>
         {["Realized $", "Realized %", "Projected $", "Projected %", "Δ Currency", "Δ Percent"].map(h => (
            <div key={h} className="py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 text-right">{h}</div>
         ))}
      </div>
   )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
   const [open, setOpen] = useState(true)
   return (
      <>
         <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors border-b border-slate-100 dark:border-white/5"
         >
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">{label}</span>
            </div>
            <ChevronDown size={14} className={cn("text-muted-foreground/20 transition-transform duration-300", !open && "-rotate-90")} />
         </button>
         {open && <div className="min-w-[900px]">{children}</div>}
      </>
   )
}

function DataRow({
   label, indent, bold, dark, actualD, actualPct, budgetD, budgetPct,
   info, danger, warn,
}: {
   label: string; indent?: boolean; bold?: boolean; dark?: boolean; info?: boolean; danger?: boolean; warn?: boolean;
   actualD: number | null; actualPct: number | null; budgetD: number | null; budgetPct: number | null;
}) {
   const bgColor = cn(
      info && "bg-indigo-500/[0.05]",
      danger && "bg-rose-500/[0.05]",
      warn && "bg-amber-500/[0.05]",
      dark && "bg-transparent text-white"
   )

   const txColor = cn(
      info && "text-indigo-600 dark:text-indigo-400",
      danger && "text-rose-600 dark:text-rose-400",
      warn && "text-amber-600 dark:text-amber-400",
      dark && "text-white"
   )

   const varianceD = actualD != null && budgetD != null ? actualD - budgetD : null
   const variancePct = actualPct != null && budgetPct != null ? actualPct - budgetPct : null
   const favorable = varianceD !== null ? varianceD > 0 : null

   return (
      <div className={cn(
         "grid grid-cols-[220px_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-slate-50 dark:border-white/5 px-4 items-center group/row hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors",
         bgColor, txColor
      )}>
         <div className={cn(
            "py-3 text-[11px] tracking-tight",
            indent ? "pl-8 text-muted-foreground/80 font-medium" : "pl-2 font-bold text-foreground",
            bold && "text-sm",
            dark && "text-white"
         )}>{label}</div>
         <div className="py-3 text-right font-mono text-xs font-bold">{actualD != null ? <Money v={actualD} /> : <span className="opacity-20">—</span>}</div>
         <div className="py-3 text-right font-mono text-xs font-medium opacity-60">{actualPct != null ? Pct(actualPct) : <span className="opacity-20">—</span>}</div>
         <div className="py-3 text-right font-mono text-xs opacity-40">{budgetD != null ? <Money v={budgetD} /> : <span className="opacity-20">—</span>}</div>
         <div className="py-3 text-right font-mono text-xs opacity-40">{budgetPct != null ? Pct(budgetPct) : <span className="opacity-20">—</span>}</div>
         <div className={cn(
            "py-3 text-right font-mono text-xs font-bold",
            favorable == null ? "opacity-20" : favorable ? "text-emerald-500" : "text-rose-500"
         )}>
            {varianceD != null ? <>{varianceD > 0 ? "+" : ""}<Money v={varianceD} /></> : "—"}
         </div>
         <div className={cn(
            "py-3 text-right font-mono text-[10px] font-bold uppercase",
            favorable == null ? "opacity-20" : favorable ? "text-emerald-500/60" : "text-rose-500/60"
         )}>
            {variancePct != null ? <>{variancePct > 0 ? "+" : ""}{Pct(variancePct)}</> : "—"}
         </div>
      </div>
   )
}

function WeekNav({ weekStart, onChange }: { weekStart: string; onChange: (s: string) => void }) {
   return (
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200/50 dark:border-white/5">
         <button onClick={() => onChange(weekOffset(weekStart, -7))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-none hover:shadow-sm">
            <ChevronLeft size={14} />
         </button>
         <span className="text-[10px] font-bold uppercase tracking-widest text-foreground min-w-[140px] text-center">{formatWeek(weekStart)}</span>
         <button onClick={() => onChange(weekOffset(weekStart, 7))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-none hover:shadow-sm">
            <ChevronRight size={14} />
         </button>
      </div>
   )
}

function StatusBadge({ status }: { status: "DRAFT" | "FINALISED" }) {
   const isDraft = status === "DRAFT"
   return (
      <div className={cn(
         "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest shadow-sm",
         isDraft ? "bg-amber-500/10 border-amber-500/20 text-amber-600 animate-pulse" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
      )}>
         <div className={cn("w-1.5 h-1.5 rounded-full", isDraft ? "bg-amber-500" : "bg-emerald-500")} />
         {isDraft ? "Draft Cycle" : "Archived Record"}
      </div>
   )
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: React.ReactNode, icon: any }) {
   return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-5 shadow-sm space-y-3 group transition-all hover:bg-slate-50/50 dark:hover:bg-white/5 hover:border-primary/20">
         <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{label}</p>
            <Icon size={12} className="text-muted-foreground/20 group-hover:text-primary/40 transition-colors" />
         </div>
         <div className="text-lg font-bold font-mono tracking-tighter tabular-nums text-foreground/80 group-hover:text-foreground transition-colors">
            {value}
         </div>
      </div>
   )
}

function currentMonday(): string {
   const d = new Date()
   d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
   return d.toISOString().split("T")[0]
}
