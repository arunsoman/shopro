// SS5.6 — Hours entry grid + schedule vs actual comparison
import React, { useState, type FC, type ChangeEvent } from "react";
import { format, parseISO, addWeeks, startOfWeek, addDays } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useEmployees, useWeeklyLaborSummary, useScheduleVsActual, useLaborMutations } from "@/hooks/useLabor";
import { useAppStore } from "@/App";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Button } from "@/components/ui/Button";
import { Users, ChevronLeft, ChevronRight, Save, UserPlus, Pencil } from "lucide-react";
import { cn, currency } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider";
import type { DailyHours } from "@/types";
import { EmployeeModal } from "./EmployeeModal";

// ── Date helpers ───────────────────────────────────────────────
function getWeekStart() { return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); }
function weekLabel(ws: string) {
  const d = parseISO(ws);
  return `${format(d, "MMM d")} – ${format(addDays(d, 6), "MMM d, yyyy")}`;
}

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
type Tab = "hours" | "schedule";

function KpiPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex-1 min-w-[130px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">{label}</p>
      <p className="text-base font-bold font-mono tabular-nums text-foreground">{value}</p>
    </div>
  );
}

const LaborSchedulePage: FC = () => {
  const navigate     = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const toast        = useToast();
  const [weekStart, setWeekStart] = useState(getWeekStart);
  const [tab, setTab]             = useState<Tab>("hours");
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [localHours, setLocalHours] = useState<Record<number, Partial<DailyHours>>>({});
  const [dirty, setDirty]           = useState<Set<number>>(new Set());

  const employees  = useEmployees(restaurantId);
  const summary    = useWeeklyLaborSummary(restaurantId, weekStart);
  const schedVsAct = useScheduleVsActual(restaurantId, weekStart);
  const { upsertHours } = useLaborMutations(restaurantId);

  const handleHoursChange = (empId: number, day: typeof DAYS[number], val: string) => {
    setLocalHours(prev => ({
      ...prev,
      [empId]: { ...(prev[empId] ?? {}), [day]: val === "" ? undefined : parseFloat(val) },
    }));
    setDirty(prev => new Set(prev).add(empId));
  };

  const saveAll = async () => {
    const dirtyIds = Array.from(dirty);
    if (!dirtyIds.length) return;
    try {
      await Promise.all(
        dirtyIds.map(empId => {
          const h        = localHours[empId] ?? {};
          const existing = summary.data?.employees.find((r: any) => r.employee.id === empId)?.laborRecord?.hours;
          const merged: DailyHours = {
            mon: h.mon ?? existing?.mon ?? 0,
            tue: h.tue ?? existing?.tue ?? 0,
            wed: h.wed ?? existing?.wed ?? 0,
            thu: h.thu ?? existing?.thu ?? 0,
            fri: h.fri ?? existing?.fri ?? 0,
            sat: h.sat ?? existing?.sat ?? 0,
            sun: h.sun ?? existing?.sun ?? 0,
          };
          return upsertHours.mutateAsync({
            employeeId: empId,
            req: { weekStartDate: weekStart, hours: merged },
          });
        }),
      );
      setDirty(new Set());
      setLocalHours({});
      toast.success("Hours saved");
    } catch {
      toast.error("Failed to save hours");
    }
  };

  if (employees.isError) return (
    <div className="absolute inset-0 flex items-center justify-center p-8">
      <ErrorState message="Failed to load employees" onRetry={() => employees.refetch()} />
    </div>
  );

  const rows = summary.data?.employees ?? [];

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Labor & Schedule"
        subtitle="Prime Cost"
        icon={Users}
        onBack={() => navigate("prime-cost")}
      >
        {dirty.size > 0 && (
          <Button
            variant="default"
            size="sm"
            onClick={saveAll}
            disabled={upsertHours.isPending}
            className="rounded-xl h-8 gap-1.5"
          >
            <Save size={12} />
            Save {dirty.size} {dirty.size === 1 ? "change" : "changes"}
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), -1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
          <ChevronLeft size={14} />
        </Button>
        <span className="text-xs font-bold text-foreground min-w-[120px] text-center tabular-nums">{weekLabel(weekStart)}</span>
        <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), 1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
          <ChevronRight size={14} />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => { setSelectedEmployee(null); setEmployeeModalOpen(true); }}
          className="rounded-xl h-8 gap-1.5 ml-2"
        >
          <UserPlus size={14} />
          Add Employee
        </Button>
      </SubScreenHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 px-6 shrink-0">
        {(["hours", "schedule"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-colors",
              tab === t
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "hours" ? "Hours Entry" : "Schedule vs Actual"}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar space-y-6">

        {/* ── Hours Entry Tab ── */}
        {tab === "hours" && (
          <>
            {/* Summary KPIs */}
            <Suspendable
              isLoading={summary.isLoading}
              skeleton={
                <div className="flex gap-3 flex-wrap animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex-1 min-w-[130px] space-y-2">
                      <div className="h-2 w-20 bg-muted/20 rounded" />
                      <div className="h-4 w-14 bg-muted/20 rounded" />
                    </div>
                  ))}
                </div>
              }
            >
              {summary.data && (
                <div className="flex gap-3 flex-wrap">
                  <KpiPill label="Total Hours"      value={`${summary.data.totalHours.toFixed(1)} hrs`} />
                  <KpiPill label="Total Labor Cost" value={currency(summary.data.totalMgmtCost + summary.data.totalHourlyCost)} />
                  <KpiPill label="Mgmt Labor"       value={currency(summary.data.totalMgmtCost)} />
                  <KpiPill label="Hourly Labor"     value={currency(summary.data.totalHourlyCost)} />
                  <KpiPill label="Labor / Cover"    value={currency(summary.data.laborCostPerCover ?? 0)} />
                  <KpiPill label="Sales / Labor Hr" value={currency(summary.data.salesPerLaborHour ?? 0)} />
                </div>
              )}
            </Suspendable>

            {/* Hours grid */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Weekly Hours</h3>
                <span className="text-[10px] text-muted-foreground/40">Blur to mark dirty · Save All to commit</span>
              </div>
              <Suspendable isLoading={employees.isLoading} skeleton={<SkeletonTable rows={5} cols={11} />}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Employee</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Type</th>
                        {DAY_LABELS.map(d => (
                          <th key={d} className="text-right px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{d}</th>
                        ))}
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Total</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Cost</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">OT?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {rows.map((row: any) => {
                        const local    = localHours[row.employee.id] ?? {};
                        const existing = row.laborRecord?.hours;
                        const total    = DAYS.reduce((s, d) => {
                          const v = local[d] !== undefined ? (local[d] ?? 0) : (existing?.[d] ?? 0);
                          return s + v;
                        }, 0);
                        const isDirty = dirty.has(row.employee.id);
                        return (
                          <tr key={row.employee.id} className={cn(isDirty && "bg-amber-500/5")}>
                            <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">
                              {row.employee.name}
                              {isDirty && <span className="ml-1.5 text-amber-500 text-[10px]">●</span>}
                              <button
                                onClick={() => { setSelectedEmployee(row.employee); setEmployeeModalOpen(true); }}
                                className="ml-2 text-muted-foreground hover:text-foreground"
                                title="Edit employee"
                              >
                                <Pencil size={12} />
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-xs text-muted-foreground/60">{row.employee.employeeType}</td>
                            {DAYS.map(day => (
                              <td key={day} className="px-1.5 py-1.5 text-right">
                                {row.employee.employeeType === "HOURLY" ? (
                                  <input
                                    type="number"
                                    min={0}
                                    max={24}
                                    step={0.25}
                                    value={local[day] !== undefined ? local[day] : (existing?.[day] ?? "")}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                      handleHoursChange(row.employee.id, day, e.target.value)
                                    }
                                    className="w-16 px-2 py-1 text-right text-xs font-mono bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                ) : (
                                  <span className="text-muted-foreground/40 text-xs">—</span>
                                )}
                              </td>
                            ))}
                            <td className={cn(
                              "px-4 py-2.5 text-right font-mono tabular-nums font-bold",
                              total > 40 ? "text-rose-600" : "text-foreground"
                            )}>
                              {total.toFixed(1)}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono tabular-nums text-amber-600">
                              {row.laborRecord ? currency(row.laborRecord.totalCost ?? 0) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {row.laborRecord?.hasOvertime && (
                                <span className="text-[11px] font-bold text-rose-600">
                                  OT {row.laborRecord.overtimeHours?.toFixed(1)}h
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Suspendable>
            </div>
          </>
        )}

        {/* ── Schedule vs Actual Tab ── */}
        {tab === "schedule" && (
          schedVsAct.isError ? (
            <ErrorState message="Failed to load schedule comparison" onRetry={() => schedVsAct.refetch()} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
              <Suspendable isLoading={schedVsAct.isLoading} skeleton={<SkeletonTable rows={6} cols={8} />}>
                {schedVsAct.data && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                          {["Employee", "Sched hrs", "Actual hrs", "Δ hrs", "Sched $", "Actual $", "Δ $", "Favorable?"].map((h, i) => (
                            <th key={h} className={cn(
                              "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40",
                              i === 0 ? "text-left" : "text-right"
                            )}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {schedVsAct.data.rows.map((row: any) => (
                          <tr key={row.employee.id}>
                            <td className="px-4 py-3 font-medium text-foreground">{row.employee.name}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums">{row.scheduledHours.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums">{row.actualHours.toFixed(1)}</td>
                            <td className={cn(
                              "px-4 py-3 text-right font-mono tabular-nums font-bold",
                              row.hoursDelta > 0 ? "text-rose-600" : "text-emerald-600"
                            )}>
                              {row.hoursDelta >= 0 ? "+" : ""}{row.hoursDelta.toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">{currency(row.scheduledCost)}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums">{currency(row.actualCost)}</td>
                            <td className={cn(
                              "px-4 py-3 text-right font-mono tabular-nums font-bold",
                              row.favorable ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {row.costDelta >= 0 ? "+" : ""}{currency(row.costDelta)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className={cn("text-base font-bold", row.favorable ? "text-emerald-600" : "text-rose-600")}>
                                {row.favorable ? "✓" : "✕"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {/* Totals row */}
                        <tr className="bg-slate-50/50 dark:bg-black/20 font-bold">
                          <td className="px-4 py-3 text-foreground">Total</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{schedVsAct.data.totalScheduledHours.toFixed(1)}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{schedVsAct.data.totalActualHours.toFixed(1)}</td>
                          <td className={cn(
                            "px-4 py-3 text-right font-mono tabular-nums",
                            schedVsAct.data.totalActualHours > schedVsAct.data.totalScheduledHours ? "text-rose-600" : "text-emerald-600"
                          )}>
                            {(schedVsAct.data.totalActualHours - schedVsAct.data.totalScheduledHours) >= 0 ? "+" : ""}
                            {(schedVsAct.data.totalActualHours - schedVsAct.data.totalScheduledHours).toFixed(1)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">{currency(schedVsAct.data.totalScheduledCost)}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(schedVsAct.data.totalActualCost)}</td>
                          <td className={cn(
                            "px-4 py-3 text-right font-mono tabular-nums",
                            schedVsAct.data.totalVariance > 0 ? "text-rose-600" : "text-emerald-600"
                          )}>
                            {schedVsAct.data.totalVariance >= 0 ? "+" : ""}{currency(schedVsAct.data.totalVariance)}
                          </td>
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </Suspendable>
            </div>
          )
        )}
      </main>
    </div>
  );

  return (
    <>
      <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
        <SubScreenHeader
          title="Labor & Schedule"
          subtitle="Prime Cost"
          icon={Users}
          onBack={() => navigate("prime-cost")}
        >
          {dirty.size > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={saveAll}
              disabled={upsertHours.isPending}
              className="rounded-xl h-8 gap-1.5"
            >
              <Save size={12} />
              Save {dirty.size} {dirty.size === 1 ? "change" : "changes"}
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), -1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
            <ChevronLeft size={14} />
          </Button>
          <span className="text-xs font-bold text-foreground min-w-[120px] text-center tabular-nums">{weekLabel(weekStart)}</span>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), 1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
            <ChevronRight size={14} />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setSelectedEmployee(null); setEmployeeModalOpen(true); }}
            className="rounded-xl h-8 gap-1.5 ml-2"
          >
            <UserPlus size={14} />
            Add Employee
          </Button>
        </SubScreenHeader>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 px-6 shrink-0">
          {(["hours", "schedule"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "py-3 px-4 text-xs font-bold border-b-2 transition-colors",
                tab === t
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "hours" ? "Hours Entry" : "Schedule vs Actual"}
            </button>
          ))}
        </div>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar space-y-6">

          {/* ── Hours Entry Tab ── */}
          {tab === "hours" && (
            <>
              {/* Summary KPIs */}
              <Suspendable
                isLoading={summary.isLoading}
                skeleton={
                  <div className="flex gap-3 flex-wrap animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex-1 min-w-[130px] space-y-2">
                        <div className="h-2 w-20 bg-muted/20 rounded" />
                        <div className="h-4 w-14 bg-muted/20 rounded" />
                      </div>
                    ))}
                  </div>
                }
              >
                {summary.data && (
                  <div className="flex gap-3 flex-wrap">
                    <KpiPill label="Total Hours"      value={`${summary.data.totalHours.toFixed(1)} hrs`} />
                    <KpiPill label="Total Labor Cost" value={currency(summary.data.totalMgmtCost + summary.data.totalHourlyCost)} />
                    <KpiPill label="Mgmt Labor"       value={currency(summary.data.totalMgmtCost)} />
                    <KpiPill label="Hourly Labor"     value={currency(summary.data.totalHourlyCost)} />
                    <KpiPill label="Labor / Cover"    value={currency(summary.data.laborCostPerCover ?? 0)} />
                    <KpiPill label="Sales / Labor Hr" value={currency(summary.data.salesPerLaborHour ?? 0)} />
                  </div>
                )}
              </Suspendable>

              {/* Hours grid */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-black/20">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Weekly Hours</h3>
                  <span className="text-[10px] text-muted-foreground/40">Blur to mark dirty · Save All to commit</span>
                </div>
                <Suspendable isLoading={employees.isLoading} skeleton={<SkeletonTable rows={5} cols={11} />}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Employee</th>
                          <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Type</th>
                          {DAY_LABELS.map(d => (
                            <th key={d} className="text-right px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{d}</th>
                          ))}
                          <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Total</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Cost</th>
                          <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">OT?</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {rows.map((row: any) => {
                          const local    = localHours[row.employee.id] ?? {};
                          const existing = row.laborRecord?.hours;
                          const total    = DAYS.reduce((s, d) => {
                            const v = local[d] !== undefined ? (local[d] ?? 0) : (existing?.[d] ?? 0);
                            return s + v;
                          }, 0);
                          const isDirty = dirty.has(row.employee.id);
                          return (
                            <tr key={row.employee.id} className={cn(isDirty && "bg-amber-500/5")}>
                              <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">
                                {row.employee.name}
                                {isDirty && <span className="ml-1.5 text-amber-500 text-[10px]">●</span>}
                                <button
                                  onClick={() => { setSelectedEmployee(row.employee); setEmployeeModalOpen(true); }}
                                  className="ml-2 text-muted-foreground hover:text-foreground"
                                  title="Edit employee"
                                >
                                  <Pencil size={12} />
                                </button>
                              </td>
                              <td className="px-4 py-2.5 text-xs text-muted-foreground/60">{row.employee.employeeType}</td>
                              {DAYS.map(day => (
                                <td key={day} className="px-1.5 py-1.5 text-right">
                                  {row.employee.employeeType === "HOURLY" ? (
                                    <input
                                      type="number"
                                      min={0}
                                      max={24}
                                      step={0.25}
                                      value={local[day] !== undefined ? local[day] : (existing?.[day] ?? "")}
                                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleHoursChange(row.employee.id, day, e.target.value)
                                      }
                                      className="w-16 px-2 py-1 text-right text-xs font-mono bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                  ) : (
                                    <span className="text-muted-foreground/40 text-xs">—</span>
                                  )}
                                </td>
                              ))}
                              <td className={cn(
                                "px-4 py-2.5 text-right font-mono tabular-nums font-bold",
                                total > 40 ? "text-rose-600" : "text-foreground"
                              )}>
                                {total.toFixed(1)}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-amber-600">
                                {row.laborRecord ? currency(row.laborRecord.totalCost ?? 0) : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                {row.laborRecord?.hasOvertime && (
                                  <span className="text-[11px] font-bold text-rose-600">
                                    OT {row.laborRecord.overtimeHours?.toFixed(1)}h
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Suspendable>
              </div>
            </>
          )}

          {/* ── Schedule vs Actual Tab ── */}
          {tab === "schedule" && (
            schedVsAct.isError ? (
              <ErrorState message="Failed to load schedule comparison" onRetry={() => schedVsAct.refetch()} />
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm overflow-hidden">
                <Suspendable isLoading={schedVsAct.isLoading} skeleton={<SkeletonTable rows={6} cols={8} />}>
                  {schedVsAct.data && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                            {["Employee", "Sched hrs", "Actual hrs", "Δ hrs", "Sched $", "Actual $", "Δ $", "Favorable?"].map((h, i) => (
                              <th key={h} className={cn(
                                "px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40",
                                i === 0 ? "text-left" : "text-right"
                              )}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {schedVsAct.data.rows.map((row: any) => (
                            <tr key={row.employee.id}>
                              <td className="px-4 py-3 font-medium text-foreground">{row.employee.name}</td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.scheduledHours.toFixed(1)}</td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums">{row.actualHours.toFixed(1)}</td>
                              <td className={cn(
                                "px-4 py-3 text-right font-mono tabular-nums font-bold",
                                row.hoursDelta > 0 ? "text-rose-600" : "text-emerald-600"
                              )}>
                                {row.hoursDelta >= 0 ? "+" : ""}{row.hoursDelta.toFixed(1)}
                              </td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">{currency(row.scheduledCost)}</td>
                              <td className="px-4 py-3 text-right font-mono tabular-nums">{currency(row.actualCost)}</td>
                              <td className={cn(
                                "px-4 py-3 text-right font-mono tabular-nums font-bold",
                                row.favorable ? "text-emerald-600" : "text-rose-600"
                              )}>
                                {row.costDelta >= 0 ? "+" : ""}{currency(row.costDelta)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={cn("text-base font-bold", row.favorable ? "text-emerald-600" : "text-rose-600")}>
                                  {row.favorable ? "✓" : "✕"}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {/* Totals row */}
                          <tr className="bg-slate-50/50 dark:bg-black/20 font-bold">
                            <td className="px-4 py-3 text-foreground">Total</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{schedVsAct.data.totalScheduledHours.toFixed(1)}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{schedVsAct.data.totalActualHours.toFixed(1)}</td>
                            <td className={cn(
                              "px-4 py-3 text-right font-mono tabular-nums",
                              schedVsAct.data.totalActualHours > schedVsAct.data.totalScheduledHours ? "text-rose-600" : "text-emerald-600"
                            )}>
                              {(schedVsAct.data.totalActualHours - schedVsAct.data.totalScheduledHours) >= 0 ? "+" : ""}
                              {(schedVsAct.data.totalActualHours - schedVsAct.data.totalScheduledHours).toFixed(1)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-muted-foreground/60">{currency(schedVsAct.data.totalScheduledCost)}</td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">{currency(schedVsAct.data.totalActualCost)}</td>
                            <td className={cn(
                              "px-4 py-3 text-right font-mono tabular-nums",
                              schedVsAct.data.totalVariance > 0 ? "text-rose-600" : "text-emerald-600"
                            )}>
                              {schedVsAct.data.totalVariance >= 0 ? "+" : ""}{currency(schedVsAct.data.totalVariance)}
                            </td>
                            <td />
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </Suspendable>
              </div>
            )
          )}
        </main>
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        employee={selectedEmployee}
      />
    </>
  );
};

export default LaborSchedulePage;
