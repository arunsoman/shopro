// ─────────────────────────────────────────────────────────────
// features/prime-cost/LaborSchedulePage.tsx  — SS5.6
// Hours entry grid + schedule vs actual comparison
// APIs: listEmployees, getWeeklyLaborSummary, upsertWeeklyHours,
//       listShifts, getScheduleVsActual
// ─────────────────────────────────────────────────────────────

import React, { useState, type FC, type ChangeEvent } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import {
  useEmployees,
  useWeeklyLaborSummary,
  useScheduleVsActual,
  useUpsertWeeklyHours,
} from "@/prime-cost/hooks/usePrimeCost";
import {
  C, fmt, fmtPct, GlobalStyles, Card, CardHeader,
  BtnPrimary, BtnSecondary, WeekSelector, Spinner,
  PageLoader, PageError, Table, Th, Td, Input,
} from "./components/shared";
import { getWeekStart, formatWeekLabel, weekOffset } from "@/lib/date";
import { useToast } from "@/providers/ToastProvider";
import type { DailyHours } from "@/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Tab = "hours" | "schedule";

const LaborSchedulePage: FC = () => {
  const restaurantId = useRestaurantId();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [tab, setTab] = useState<Tab>("hours");

  // Editable local hours state — keyed by employeeId
  const [localHours, setLocalHours] = useState<Record<number, Partial<DailyHours>>>({});
  const [dirty, setDirty] = useState<Set<number>>(new Set());

  const employees = useEmployees(restaurantId);
  const summary   = useWeeklyLaborSummary(restaurantId, weekStart);
  const schedVsAct = useScheduleVsActual(restaurantId, weekStart, tab === "schedule");
  const upsert    = useUpsertWeeklyHours(restaurantId, weekStart);

  const handleHoursChange = (empId: number, day: (typeof DAYS)[number], val: string) => {
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
          const h = localHours[empId] ?? {};
          const record = summary.data?.employees.find(r => r.employee.id === empId)?.laborRecord;
          const existing = record?.hours ?? { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
          const merged: DailyHours = {
            mon: h.mon  ?? existing.mon  ?? 0,
            tue: h.tue  ?? existing.tue  ?? 0,
            wed: h.wed  ?? existing.wed  ?? 0,
            thu: h.thu  ?? existing.thu  ?? 0,
            fri: h.fri  ?? existing.fri  ?? 0,
            sat: h.sat  ?? existing.sat  ?? 0,
            sun: h.sun  ?? existing.sun  ?? 0,
          };
          return upsert.mutateAsync({ employeeId: empId, body: { weekStartDate: weekStart, hours: merged } });
        }),
      );
      setDirty(new Set());
      setLocalHours({});
      toast.success("Hours saved");
    } catch {
      toast.error("Failed to save hours");
    }
  };

  if (employees.isLoading) return <PageLoader />;
  if (employees.isError)   return <PageError message="Failed to load employees" onRetry={() => employees.refetch()} />;

  const rows = summary.data?.employees ?? [];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* ── Header ── */}
      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text }}>
          Labor &amp; Schedule
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {dirty.size > 0 && (
            <BtnPrimary onClick={saveAll} disabled={upsert.isPending}>
              {upsert.isPending ? <Spinner size={14} /> : `Save ${dirty.size} change${dirty.size > 1 ? "s" : ""}`}
            </BtnPrimary>
          )}
          <WeekSelector
            weekStart={weekStart}
            label={formatWeekLabel(weekStart)}
            onPrev={() => setWeekStart(weekOffset(weekStart, -1))}
            onNext={() => setWeekStart(weekOffset(weekStart, 1))}
          />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ padding: "0 32px", display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        {(["hours", "schedule"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: "transparent", border: "none",
              padding: "10px 18px", cursor: "pointer",
              color: tab === t ? C.amber : C.textMuted,
              fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: tab === t ? 600 : 400,
              borderBottom: tab === t ? `2px solid ${C.amber}` : "2px solid transparent",
              marginBottom: -1, transition: "color .15s",
            }}
          >
            {t === "hours" ? "Hours Entry" : "Schedule vs Actual"}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 32px 32px" }}>

        {/* ── Hours Entry Tab ── */}
        {tab === "hours" && (
          <>
            {/* Summary KPIs */}
            {summary.data && (
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Total Hours",     value: `${summary.data.totalHours.toFixed(1)} hrs` },
                  { label: "Total Labor Cost",value: fmt(summary.data.totalMgmtCost + summary.data.totalHourlyCost) },
                  { label: "Mgmt Labor",      value: fmt(summary.data.totalMgmtCost) },
                  { label: "Hourly Labor",    value: fmt(summary.data.totalHourlyCost) },
                  { label: "Labor / Cover",   value: fmt(summary.data.laborCostPerCover) },
                  { label: "Sales / Labor Hr",value: fmt(summary.data.salesPerLaborHour) },
                ].map(item => (
                  <div key={item.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", flex: "1 1 140px" }}>
                    <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 16, color: C.text }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Hours grid */}
            <Card>
              <CardHeader title="Weekly Hours" action={
                <span style={{ fontSize: 12, color: C.textDim }}>Blur to mark dirty · Save All to commit</span>
              } />
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <thead>
                    <tr>
                      <Th>Employee</Th>
                      <Th>Type</Th>
                      {DAY_LABELS.map(d => <Th key={d} right>{d}</Th>)}
                      <Th right>Total</Th>
                      <Th right>Cost</Th>
                      <Th right>OT?</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => {
                      const local = localHours[row.employee.id] ?? {};
                      const existing = row.laborRecord?.hours;
                      const total = DAYS.reduce((s, d) => {
                        const v = local[d] !== undefined ? (local[d] ?? 0) : (existing?.[d] ?? 0);
                        return s + v;
                      }, 0);
                      const isDirty = dirty.has(row.employee.id);
                      return (
                        <tr key={row.employee.id} style={{ background: isDirty ? "#1a1916" : "transparent" }}>
                          <Td style={{ fontWeight: 500 }}>
                            {row.employee.name}
                            {isDirty && <span style={{ color: C.amber, fontSize: 10, marginLeft: 6 }}>●</span>}
                          </Td>
                          <Td style={{ color: C.textDim, fontSize: 12 }}>{row.employee.employeeType}</Td>
                          {DAYS.map(day => (
                            <Td key={day} right style={{ padding: "6px 8px" }}>
                              {row.employee.employeeType === "HOURLY" ? (
                                <Input
                                  type="number"
                                  min={0}
                                  max={24}
                                  step={0.25}
                                  value={local[day] !== undefined ? local[day] : (existing?.[day] ?? "")}
                                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleHoursChange(row.employee.id, day, e.target.value)
                                  }
                                  style={{ width: 64, padding: "5px 6px", textAlign: "right", fontFamily: "'DM Mono',monospace", fontSize: 13 }}
                                />
                              ) : (
                                <span style={{ color: C.textDim, fontSize: 12 }}>—</span>
                              )}
                            </Td>
                          ))}
                          <Td right mono style={{ fontWeight: 600, color: total > 40 ? C.red : C.text }}>
                            {total.toFixed(1)}
                          </Td>
                          <Td right mono style={{ color: C.amber }}>
                            {row.laborRecord ? fmt(row.laborRecord.totalCost) : "—"}
                          </Td>
                          <Td right>
                            {row.laborRecord?.hasOvertime && (
                              <span style={{ color: C.red, fontSize: 12, fontWeight: 700 }}>
                                OT {row.laborRecord.overtimeHours.toFixed(1)}h
                              </span>
                            )}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card>
          </>
        )}

        {/* ── Schedule vs Actual Tab ── */}
        {tab === "schedule" && (
          schedVsAct.isLoading ? <PageLoader /> :
          schedVsAct.isError   ? <PageError message="Failed to load schedule comparison" onRetry={() => schedVsAct.refetch()} /> :
          schedVsAct.data ? (
            <Card>
              <CardHeader title="Scheduled vs Actual" />
              <Table>
                <thead>
                  <tr>
                    <Th>Employee</Th>
                    <Th right>Scheduled hrs</Th>
                    <Th right>Actual hrs</Th>
                    <Th right>Δ hrs</Th>
                    <Th right>Scheduled $</Th>
                    <Th right>Actual $</Th>
                    <Th right>Δ $</Th>
                    <Th right>Favorable?</Th>
                  </tr>
                </thead>
                <tbody>
                  {schedVsAct.data.rows.map(row => (
                    <tr key={row.employee.id}>
                      <Td style={{ fontWeight: 500 }}>{row.employee.name}</Td>
                      <Td right mono>{row.scheduledHours.toFixed(1)}</Td>
                      <Td right mono>{row.actualHours.toFixed(1)}</Td>
                      <Td right mono style={{ color: row.hoursDelta > 0 ? C.red : C.green }}>
                        {row.hoursDelta >= 0 ? "+" : ""}{row.hoursDelta.toFixed(1)}
                      </Td>
                      <Td right mono style={{ color: C.textDim }}>{fmt(row.scheduledCost)}</Td>
                      <Td right mono>{fmt(row.actualCost)}</Td>
                      <Td right mono style={{ color: row.favorable ? C.green : C.red }}>
                        {row.costDelta >= 0 ? "+" : ""}{fmt(row.costDelta)}
                      </Td>
                      <Td right>
                        <span style={{ color: row.favorable ? C.green : C.red, fontSize: 16 }}>
                          {row.favorable ? "✓" : "✕"}
                        </span>
                      </Td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr style={{ background: C.surfaceHigh }}>
                    <Td style={{ fontWeight: 700 }}>Total</Td>
                    <Td right mono style={{ fontWeight: 700 }}>{schedVsAct.data.totalScheduledHours.toFixed(1)}</Td>
                    <Td right mono style={{ fontWeight: 700 }}>{schedVsAct.data.totalActualHours.toFixed(1)}</Td>
                    <Td right mono style={{ fontWeight: 700, color: schedVsAct.data.totalActualHours > schedVsAct.data.totalScheduledHours ? C.red : C.green }}>
                      {(schedVsAct.data.totalActualHours - schedVsAct.data.totalScheduledHours) >= 0 ? "+" : ""}
                      {(schedVsAct.data.totalActualHours - schedVsAct.data.totalScheduledHours).toFixed(1)}
                    </Td>
                    <Td right mono style={{ fontWeight: 700, color: C.textDim }}>{fmt(schedVsAct.data.totalScheduledCost)}</Td>
                    <Td right mono style={{ fontWeight: 700 }}>{fmt(schedVsAct.data.totalActualCost)}</Td>
                    <Td right mono style={{ fontWeight: 700, color: schedVsAct.data.totalVariance > 0 ? C.red : C.green }}>
                      {schedVsAct.data.totalVariance >= 0 ? "+" : ""}{fmt(schedVsAct.data.totalVariance)}
                    </Td>
                    <Td />
                  </tr>
                </tbody>
              </Table>
            </Card>
          ) : null
        )}
      </div>
    </div>
  );
};

export default LaborSchedulePage;
