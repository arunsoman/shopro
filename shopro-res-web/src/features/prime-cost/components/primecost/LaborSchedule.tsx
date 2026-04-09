import { useState } from "react"
import { useWeeklyLaborSummary, useLaborMutations } from "@/hooks/useLabor"
import type { WeeklyLaborSummary, EmployeeLaborRecord, DailyHours, EmployeeWeekRow } from "@/types"
import { LoadingState, ErrorState, Money, weekOffset, formatWeek } from "../ui/shared"
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/Button"
import { Users, Clock, TrendingUp, DollarSign, ChevronLeft, ChevronRight, Save, Download } from "lucide-react"

type Tab = "hours" | "schedule"

export default function LaborSchedule({
   restaurantId,
   onBack
}: {
   restaurantId: number;
   onBack: () => void;
}) {
   const [weekStart, setWeekStart] = useState(currentMonday())
   const [tab, setTab] = useState<Tab>("hours")
   const [saving, setSaving] = useState(false)
   const [edits, setEdits] = useState<Record<number, Partial<DailyHours>>>({})

   const { data, isLoading: loading, error, refetch: refresh } = useWeeklyLaborSummary(restaurantId, weekStart)
   const { upsertHours } = useLaborMutations(restaurantId)

   function setHours(employeeId: number, day: keyof DailyHours, value: string) {
      const v = value === "" ? 0 : parseFloat(value)
      setEdits((prev) => ({
         ...prev,
         [employeeId]: { ...prev[employeeId], [day]: v }
      }))
   }

   async function saveAll() {
      if (!data) return
      setSaving(true)
      try {
         for (const [empIdString, editHours] of Object.entries(edits)) {
            const empId = parseInt(empIdString)
            const row = (data?.employees || []).find((e: EmployeeWeekRow) => e.employee.id === empId)
            if (!row) continue

            // Merge existing hours with edits
            const currentHours = row.laborRecord?.hours || {
               mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0
            }

            const mergedHours: DailyHours = {
               ...currentHours,
               ...editHours
            }

            await upsertHours.mutateAsync({
               employeeId: empId,
               req: {
                  weekStartDate: weekStart,
                  hours: mergedHours
               }
            })
         }
         setEdits({})
         // refresh is handled by mutation onSuccess, but we can call it to be safe
      } finally {
         setSaving(false)
      }
   }

   if (loading) return <LoadingState />
   if (error) return <ErrorState message={error instanceof Error ? error.message : String(error)} onRetry={refresh} />
   if (!data) return null

   const employees = data.employees || []

   const days: Array<keyof DailyHours> = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
   const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

   return (
      <div className="w-full bg-slate-50 dark:bg-slate-950  overflow-hidden flex items-center justify-center p-4 font-sans">
         <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-xl relative overflow-hidden">
            {/* Header */}
            <header className="shrink-0 z-20 w-full border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-5">
               <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <button
                           onClick={onBack}
                           className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95"
                        >
                           <ChevronLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/10">
                           <Users size={20} />
                        </div>
                        <div className="space-y-0.5">
                           <span className="font-semibold text-[10px] text-muted-foreground/40 uppercase tracking-[0.1em]">Human Resource Ops</span>
                           <h1 className="text-xl font-bold text-foreground tracking-tight leading-none">Labor Control Ledger</h1>
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <WeekNav weekStart={weekStart} onChange={(w) => { setWeekStart(w); setEdits({}) }} />
                        <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 font-bold text-[10px] uppercase tracking-widest border-slate-200 dark:border-white/10 gap-2">
                           <Download size={14} />
                           Export
                        </Button>
                     </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                     <div className="flex border border-slate-200 dark:border-white/10 rounded-xl p-1 bg-slate-50 dark:bg-black/20">
                        <button
                           onClick={() => setTab("hours")}
                           className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              tab === "hours" ? "bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5" : "text-muted-foreground/40 hover:text-foreground"
                           )}
                        >
                           Hours Entry
                        </button>
                        <button
                           onClick={() => setTab("schedule")}
                           className={cn(
                              "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                              tab === "schedule" ? "bg-white dark:bg-white/10 text-primary shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5" : "text-muted-foreground/40 hover:text-foreground"
                           )}
                        >
                           Schedule Variance
                        </button>
                     </div>

                     {Object.keys(edits).length > 0 && (
                        <Button
                           onClick={saveAll}
                           disabled={saving}
                           size="sm"
                           className="rounded-xl h-9 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-emerald-600/20"
                        >
                           {saving ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Save size={14} />}
                           {saving ? "Synchronizing..." : `Commit ${Object.keys(edits).length} Entry Changes`}
                        </Button>
                     )}
                  </div>
               </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50/20 dark:bg-transparent">
               <div className="space-y-8 pb-10">
                  {/* KPI Strip */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <KpiCard
                        label="Aggregate Labor"
                        value={<Money v={data.totalActualCost || 0} />}
                        sub={`Scheduled: ${fmtMoney(data.totalScheduledCost || 0)}`}
                        icon={DollarSign}
                     />
                     <KpiCard
                        label="Schedule Variance"
                        value={<>{(data.totalLaborVariance || 0) > 0 ? "+" : ""}<Money v={data.totalLaborVariance || 0} /></>}
                        sub={(data.totalLaborVariance || 0) > 0 ? "Exceeding Budget" : "Under Threshold"}
                        alert={(data.totalLaborVariance || 0) > 200}
                        icon={TrendingUp}
                     />
                     <KpiCard
                        label="Labor Velocity"
                        value={<Money v={data.salesPerLaborHour || 0} />}
                        sub={`Total Hours: ${(data.totalHours || 0).toFixed(1)}`}
                        icon={Clock}
                     />
                     <KpiCard
                        label="Cover Unit Cost"
                        value={<Money v={data.laborCostPerCover || 0} />}
                        sub={`Traffic: ${data.totalCovers || 0}`}
                        alert={(data.laborCostPerCover || 0) > 15}
                        icon={Users}
                     />
                  </div>

                  {/* Data Views */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                     {tab === "hours" ? (
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Employee Profile</th>
                                 <th className="px-4 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Class</th>
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Market Rate</th>
                                 {dayLabels.map(d => (
                                    <th key={d} className="px-2 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{d}</th>
                                 ))}
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Net Duration</th>
                                 <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Projected Draw</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                              {(employees || []).map((row: EmployeeWeekRow) => {
                                 const { employee: emp, laborRecord: rec } = row
                                 const edit = edits[emp.id] || {}
                                 const isManagement = emp.employeeType === "MANAGEMENT"

                                 const totalHours = rec ? rec.totalHours : 0
                                 const totalCost = rec ? rec.totalCost : 0
                                 const isOvertime = rec ? rec.hasOvertime : false

                                 return (
                                    <tr key={emp.id} className={cn(
                                       "group/row transition-colors",
                                       isManagement ? "bg-slate-50/30 dark:bg-white/[0.02]" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
                                    )}>
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/40">
                                                {emp.name[0]}
                                             </div>
                                             <span className="text-sm font-bold text-foreground tracking-tight">{emp.name}</span>
                                          </div>
                                       </td>
                                       <td className="px-4 py-4">
                                          <span className={cn(
                                             "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border",
                                             isManagement ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                                          )}>
                                             {emp.employeeType === "MANAGEMENT" ? "Mgmt" : "Hourly"}
                                          </span>
                                       </td>
                                       <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground/60">
                                          {emp.hourlyRate != null ? fmtMoney(emp.hourlyRate) : "—"}
                                       </td>
                                       {days.map((day) => {
                                          const currentVal = rec?.hours?.[day] ?? 0
                                          const val = edit[day] !== undefined ? edit[day] : currentVal
                                          return (
                                             <td key={day} className="px-2 py-4 text-right">
                                                {isManagement ? (
                                                   <span className="text-muted-foreground/20">—</span>
                                                ) : (
                                                   <input
                                                      type="number"
                                                      min="0"
                                                      step="0.5"
                                                      value={val ?? ""}
                                                      onChange={(e) => setHours(emp.id, day, e.target.value)}
                                                      className={cn(
                                                         "w-12 h-8 rounded-lg bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 px-2 text-right font-mono text-xs focus:ring-4 focus:ring-primary/5 focus:border-primary/40 outline-none transition-all",
                                                         edit[day] !== undefined ? "border-amber-500/40 bg-amber-500/5 text-amber-600" : "text-foreground"
                                                      )}
                                                   />
                                                )}
                                             </td>
                                          )
                                       })}
                                       <td className="px-4 py-4 text-right">
                                          <div className="flex flex-col items-end">
                                             <span className={cn(
                                                "text-sm font-bold font-mono tracking-tight",
                                                isOvertime ? "text-rose-600" : "text-foreground"
                                             )}>
                                                {(totalHours || 0).toFixed(1)} hrs
                                             </span>
                                             {isOvertime && <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest">OT Multiplier active</span>}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <span className={cn(
                                             "text-sm font-bold font-mono",
                                             isOvertime ? "text-rose-600 font-black" : "text-foreground/60"
                                          )}>
                                             <Money v={totalCost} />
                                          </span>
                                       </td>
                                    </tr>
                                 )
                              })}
                           </tbody>
                           <tfoot>
                              <tr className="bg-slate-50/50 dark:bg-black/40 font-bold border-t border-slate-100 dark:border-white/10">
                                 <td className="px-6 py-5 text-[10px] uppercase tracking-widest text-foreground/40">Aggregrate Performance</td>
                                 <td /><td />
                                 {days.map((day) => (
                                    <td key={day} className="px-2 py-5 text-right font-mono text-xs text-foreground/60">
                                       {employees.reduce((s: number, row: EmployeeWeekRow) => s + (row.laborRecord?.hours?.[day] || 0), 0).toFixed(1)}
                                    </td>
                                 ))}
                                 <td className="px-4 py-5 text-right font-mono text-sm tracking-tight">
                                    {(data.totalHours || 0).toFixed(1)}
                                 </td>
                                 <td className="px-6 py-5 text-right font-mono text-sm text-primary">
                                    <Money v={data.totalActualCost} />
                                 </td>
                              </tr>
                           </tfoot>
                        </table>
                     ) : (
                        <table className="w-full text-left border-collapse">
                           <thead>
                              <tr className="bg-slate-50 dark:bg-black/20 border-b border-slate-100 dark:border-white/5">
                                 <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Resource Name</th>
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Projected</th>
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Retrieved</th>
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Net Delta</th>
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Market Rate</th>
                                 <th className="px-4 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Fiscal Variance</th>
                                 <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Stability</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                              {(data?.employees || []).map((row: EmployeeWeekRow) => {
                                 const emp = row.employee || { id: -1, name: "Unknown" }
                                 const status = (row.hoursDelta || 0) > 5 ? "CRITICAL" : (row.hoursDelta || 0) > 0 ? "OVER" : "OK"
                                 return (
                                    <tr key={emp.id} className="group/row hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-[10px] font-bold text-muted-foreground/40">
                                                {emp.name[0]}
                                             </div>
                                             <span className="text-sm font-bold text-foreground tracking-tight">{emp.name}</span>
                                          </div>
                                       </td>
                                       <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground/60">{(row.scheduledHours || 0).toFixed(1)}</td>
                                       <td className="px-4 py-4 text-right font-mono text-xs text-foreground/80 font-bold">{(row.actualHours || 0).toFixed(1)}</td>
                                       <td className={cn(
                                          "px-4 py-4 text-right font-mono text-xs font-bold",
                                          (row.hoursDelta || 0) > 0 ? "text-amber-600" : "text-emerald-600"
                                       )}>
                                          {(row.hoursDelta || 0) > 0 ? "+" : ""}{(row.hoursDelta || 0).toFixed(1)} hr
                                       </td>
                                       <td className="px-4 py-4 text-right font-mono text-xs text-muted-foreground/40">{emp.hourlyRate != null ? fmtMoney(emp.hourlyRate) : "—"}</td>
                                       <td className={cn(
                                          "px-4 py-4 text-right font-mono text-sm font-bold",
                                          row.costDelta > 0 ? "text-rose-600" : "text-emerald-600"
                                       )}>
                                          {row.costDelta > 0 ? "+" : ""}<Money v={row.costDelta} />
                                       </td>
                                       <td className="px-6 py-4 flex justify-center">
                                          <StatusBadge status={status} />
                                       </td>
                                    </tr>
                                 )
                              })}
                           </tbody>
                           <tfoot>
                              <tr className="bg-slate-50/50 dark:bg-black/40 font-bold border-t border-slate-100 dark:border-white/10">
                                 <td className="px-6 py-5 text-[10px] uppercase tracking-widest text-foreground/40">Module Total</td>
                                 <td className="px-4 py-5 text-right font-mono text-xs text-muted-foreground/60">
                                    {((data?.employees || []).reduce((s: number, r: EmployeeWeekRow) => s + (r.scheduledHours || 0), 0)).toFixed(1)}
                                 </td>
                                 <td className="px-4 py-4 text-right font-mono text-sm font-bold text-foreground">
                                    {((data?.employees || []).reduce((s: number, r: EmployeeWeekRow) => s + (r.actualHours || 0), 0)).toFixed(1)}
                                 </td>
                                 <td className={cn(
                                    "px-6 py-4 text-right font-mono text-sm font-bold",
                                    (data?.totalLaborVariance || 0) > 0 ? "text-rose-600" : "text-emerald-600"
                                 )}>
                                    {(data?.totalLaborVariance || 0) > 0 ? "+" : ""}{((data?.employees || []).reduce((s: number, r: EmployeeWeekRow) => s + (r.hoursDelta || 0), 0)).toFixed(1)}
                                 </td>
                                 <td />
                                 <td className="px-4 py-5 text-right font-mono text-sm text-rose-600">
                                    {(data?.totalLaborVariance || 0) > 0 ? "+" : ""}<Money v={data?.totalLaborVariance || 0} />
                                 </td>
                                 <td />
                              </tr>
                           </tfoot>
                        </table>
                     )}
                  </div>
               </div>
            </main>
         </div>
      </div>
   )
}

function KpiCard({ label, value, sub, alert, icon: Icon }: { label: string; value: React.ReactNode; sub: string; alert?: boolean, icon: any }) {
   return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-sm space-y-3 group transition-all hover:bg-slate-50/50 dark:hover:bg-white/5">
         <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em]">{label}</p>
            <Icon size={12} className="text-muted-foreground/20" />
         </div>
         <div className={cn(
            "text-xl font-bold font-mono tracking-tighter tabular-nums",
            alert ? "text-rose-600" : "text-foreground"
         )}>
            {value}
         </div>
         <p className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest">{sub}</p>
      </div>
   )
}

function StatusBadge({ status }: { status: "OVER" | "CRITICAL" | "OK" }) {
   const styles = {
      OK: { bg: "bg-emerald-500/10", tx: "text-emerald-600", border: "border-emerald-500/20", label: "Stable Operation" },
      OVER: { bg: "bg-amber-500/10", tx: "text-amber-600", border: "border-amber-500/20", label: "Budget Overrun" },
      CRITICAL: { bg: "bg-rose-500/10", tx: "text-rose-600", border: "border-rose-500/20", label: "High Risk Leakage" },
   }[status]

   return (
      <span className={cn(
         "px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border shadow-sm",
         styles.bg, styles.tx, styles.border
      )}>
         {styles.label}
      </span>
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

function Loader2({ className, ...props }: any) {
   return <Clock className={cn("animate-spin", className)} {...props} />
}

function fmtMoney(v: number): string {
   return "$" + (v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function currentMonday(): string {
   const d = new Date()
   d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
   return d.toISOString().split("T")[0]
}
