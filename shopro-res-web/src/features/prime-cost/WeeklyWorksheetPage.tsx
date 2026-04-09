// ─────────────────────────────────────────────────────────────
// features/prime-cost/WeeklyWorksheetPage.tsx  — SS5.2
// Full accordion P&L: Sales / COS / Labor / Summary + Finalise
// APIs: getWeeklyReport, getWeeklyBudget, getWeeklyLaborSummary,
//       getScheduleVsActual, finaliseWeeklyReport
// ─────────────────────────────────────────────────────────────

import React, { useState, type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import {
  useWeeklyReport,
  useFinaliseWeeklyReport,
  useWeeklyLaborSummary,
  useWeeklyBudget,
} from "@/prime-cost/hooks/usePrimeCost";
import {
  C, fmt, fmtPct, pcColor, pcBg,
  GlobalStyles, Card, CardHeader, Divider, StatusBadge,
  BtnPrimary, BtnSecondary, BtnGhost, WeekSelector,
  Spinner, PageLoader, PageError, VarianceChip,
  Table, Th, Td,
} from "./components/shared";
import { getWeekStart, formatWeekLabel, weekOffset } from "@/lib/date";
import { useToast } from "@/providers/ToastProvider";

// ── Section row component ──────────────────────────────────────

const Row: FC<{
  label: string;
  actual: number;
  budget?: number;
  isCost?: boolean;
  isTotal?: boolean;
}> = ({ label, actual, budget, isCost, isTotal }) => {
  const variance = budget !== undefined ? actual - budget : undefined;
  const favorable = variance !== undefined ? (isCost ? variance < 0 : variance > 0) : undefined;

  return (
    <tr style={{ background: isTotal ? C.surfaceHigh : "transparent" }}>
      <Td style={{ paddingLeft: isTotal ? 14 : 28, fontWeight: isTotal ? 600 : 400 }}>{label}</Td>
      <Td right mono style={{ fontWeight: isTotal ? 700 : 400, color: isTotal ? C.text : C.textMuted }}>
        {fmt(actual)}
      </Td>
      {budget !== undefined ? (
        <>
          <Td right mono style={{ color: C.textDim }}>{fmt(budget)}</Td>
          <Td right>
            {variance !== undefined && (
              <VarianceChip pts={variance} favorable={favorable} />
            )}
          </Td>
        </>
      ) : (
        <><Td /><Td /></>
      )}
    </tr>
  );
};

// ── Accordion section ──────────────────────────────────────────

const Section: FC<{ title: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({
  title, open, onToggle, children,
}) => (
  <Card style={{ marginBottom: 12 }}>
    <div
      onClick={onToggle}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", cursor: "pointer" }}
    >
      <span style={{ fontWeight: 600, color: C.text, fontSize: 15 }}>{title}</span>
      <span style={{ color: C.textDim, fontSize: 18, transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
    </div>
    {open && <>{children}</>}
  </Card>
);

// ── Main page ──────────────────────────────────────────────────

const WeeklyWorksheetPage: FC = () => {
  const restaurantId = useRestaurantId();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [open, setOpen] = useState<Record<string, boolean>>({ sales: true, cos: true, labor: true, summary: true });
  const [showFinaliseModal, setShowFinaliseModal] = useState(false);

  const report  = useWeeklyReport(restaurantId, weekStart);
  const budget  = useWeeklyBudget(restaurantId, weekStart);
  const finalise = useFinaliseWeeklyReport(restaurantId);

  const toggle = (k: string) => setOpen(p => ({ ...p, [k]: !p[k] }));

  const d  = report.data;
  const b  = budget.data;
  const isFinalised = d?.status === "FINALISED";

  if (report.isLoading) return <PageLoader />;
  if (report.isError)   return <PageError message="Failed to load weekly report" onRetry={() => report.refetch()} />;

  const handleFinalise = async () => {
    try {
      await finalise.mutateAsync(weekStart);
      toast.success("Week finalised and frozen!");
      setShowFinaliseModal(false);
    } catch {
      toast.error("Failed to finalise report");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      {/* Finalise confirm modal */}
      {showFinaliseModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, width: 380, textAlign: "center" }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              Finalise this week?
            </div>
            <div style={{ color: C.textMuted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              This freezes the report as a permanent snapshot. You won't be able to edit it after finalising.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <BtnPrimary onClick={handleFinalise} disabled={finalise.isPending}>
                {finalise.isPending ? <Spinner size={14} /> : "Yes, finalise"}
              </BtnPrimary>
              <BtnSecondary onClick={() => setShowFinaliseModal(false)}>Cancel</BtnSecondary>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text }}>
            Weekly Prime Cost Worksheet
          </h1>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 4 }}>
            {d && <StatusBadge status={d.status} />}
            <span style={{ fontSize: 13, color: C.textDim }}>{formatWeekLabel(weekStart)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <WeekSelector
            weekStart={weekStart}
            label={formatWeekLabel(weekStart)}
            onPrev={() => setWeekStart(weekOffset(weekStart, -1))}
            onNext={() => setWeekStart(weekOffset(weekStart, 1))}
          />
          {!isFinalised && (
            <BtnPrimary onClick={() => setShowFinaliseModal(true)}>
              Finalise Week
            </BtnPrimary>
          )}
        </div>
      </div>

      <div style={{ padding: "0 32px 32px" }}>

        {/* Column headers */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 130px 130px 120px",
          padding: "8px 14px", marginBottom: 4,
          fontSize: 11, color: C.textDim, letterSpacing: ".07em", textTransform: "uppercase",
        }}>
          <span />
          <span style={{ textAlign: "right" }}>Actual</span>
          <span style={{ textAlign: "right" }}>Budget</span>
          <span style={{ textAlign: "right" }}>Variance</span>
        </div>

        {/* ── SALES ── */}
        {d && (
          <Section title="Revenue" open={!!open.sales} onToggle={() => toggle("sales")}>
            <Table>
              <tbody>
                <Row label="Gross Sales"       actual={d.grossSales}      budget={b?.totalSalesForecast} />
                <Row label="Comps & Discounts" actual={d.compsDiscounts}  isCost />
                <Row label="Net Sales"         actual={d.netSales}        isTotal />
              </tbody>
            </Table>
          </Section>
        )}

        {/* ── COST OF SALES ── */}
        {d && (
          <Section title="Cost of Sales" open={!!open.cos} onToggle={() => toggle("cos")}>
            <Table>
              <tbody>
                <Row label="Beg. Inventory — Food"   actual={d.begInventoryFood} />
                <Row label="+ Purchases — Food"       actual={d.purchasesFood}   budget={b?.budgetFoodCos} isCost />
                <Row label="− End Inventory — Food"   actual={-d.endInventoryFood} />
                <Row label="Actual Food COS"          actual={d.actualFoodCos}   budget={b?.budgetFoodCos} isTotal isCost />
                <Row label="Actual Beverage COS"      actual={d.actualBevCos}    budget={b?.budgetBevCos}  isTotal isCost />
                <Row label="Total Actual COS"         actual={d.totalActualCos}  isTotal isCost />
                <tr><td colSpan={4}><Divider /></td></tr>
                <Row label="Theoretical COS"          actual={d.theoreticalCos} />
                <tr>
                  <Td style={{ paddingLeft: 28 }}>Shrinkage Variance</Td>
                  <Td right mono style={{ color: d.shrinkageVariance > 0 ? C.red : C.green }}>
                    {fmt(d.shrinkageVariance)}
                  </Td>
                  <Td />
                  <Td right>
                    <VarianceChip pts={d.shrinkageVariancePct * 100} favorable={d.shrinkageVariance <= 0} />
                  </Td>
                </tr>
              </tbody>
            </Table>
          </Section>
        )}

        {/* ── LABOR ── */}
        {d && (
          <Section title="Labor" open={!!open.labor} onToggle={() => toggle("labor")}>
            <Table>
              <tbody>
                <Row label="Management Labor"       actual={d.mgmtLabor}              budget={b?.budgetMgmtLabor}   isCost />
                <Row label="Hourly Labor"           actual={d.hourlyLabor}            budget={b?.budgetHourlyLabor} isCost />
                <Row label="Payroll Taxes & Benefits" actual={d.payrollTaxesBenefits} budget={b?.budgetBenefits}    isCost />
                <Row label="Total Labor"            actual={d.totalLabor}             budget={b?.budgetTotalLabor}  isTotal isCost />
                <tr><td colSpan={4}><Divider /></td></tr>
                <Row label="Scheduled Labor"        actual={d.scheduledLabor} />
                <tr>
                  <Td style={{ paddingLeft: 28 }}>Labor Variance (actual vs scheduled)</Td>
                  <Td right mono style={{ color: d.laborVariance > 0 ? C.red : C.green }}>
                    {fmt(d.laborVariance)}
                  </Td>
                  <Td />
                  <Td />
                </tr>
              </tbody>
            </Table>
          </Section>
        )}

        {/* ── PRIME COST SUMMARY ── */}
        {d && (
          <Section title="Prime Cost Summary" open={!!open.summary} onToggle={() => toggle("summary")}>
            <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { label: "Gross Sales",        value: fmt(d.grossSales) },
                { label: "Total COS",          value: fmt(d.totalActualCos) },
                { label: "Total Labor",        value: fmt(d.totalLabor) },
                { label: "Prime Cost",         value: fmt(d.primeCostGross),    color: pcColor(d.primeCostGrossPct) },
                { label: "COS %",              value: fmtPct(d.totalActualCosPct) },
                { label: "Labor %",            value: fmtPct(d.totalLaborPct) },
                { label: "Prime Cost %",       value: fmtPct(d.primeCostGrossPct), color: pcColor(d.primeCostGrossPct), big: true },
                { label: "Gross Margin",       value: fmt(d.grossMargin),       color: C.green },
                { label: "Total Covers",       value: (d.totalCovers || 0).toLocaleString() },
                { label: "Check Average",      value: fmt(d.checkAverage) },
                { label: "Labor / Cover",      value: fmt(d.laborCostPerCover) },
                { label: "Sales / Labor Hr",   value: fmt(d.salesPerLaborHour) },
              ].map(item => (
                <div key={item.label} style={{ background: C.surfaceHigh, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, color: C.textDim, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                  <div style={{
                    fontFamily: "'DM Mono',monospace", fontWeight: 700,
                    fontSize: (item as any).big ? 28 : 18,
                    color: (item as any).color ?? C.text,
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default WeeklyWorksheetPage;
