// ─────────────────────────────────────────────────────────────
// features/prime-cost/BudgetVsActualPage.tsx  — SS5.3
// ─────────────────────────────────────────────────────────────

import React, { useState, type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useBudgetVsActual, useWeeklyBudgetMutations, useWeeklyBudget } from "@/prime-cost/hooks/usePrimeCost";
import {
  C, fmt, fmtPct, GlobalStyles, Card, CardHeader,
  BtnSecondary, WeekSelector, PageLoader, PageError,
  Table, Th, Td, VarianceChip,
} from "./components/shared";
import { getWeekStart, formatWeekLabel, weekOffset } from "@/lib/date";
import { useToast } from "@/providers/ToastProvider";

const BudgetVsActualPage: FC = () => {
  const restaurantId = useRestaurantId();
  const toast = useToast();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));

  const report  = useBudgetVsActual(restaurantId, weekStart);
  const budget  = useWeeklyBudget(restaurantId, weekStart);
  const { copyFromPrior } = useWeeklyBudgetMutations(restaurantId, weekStart);

  if (report.isLoading) return <PageLoader />;
  if (report.isError)   return <PageError message="Failed to load budget vs actual" onRetry={() => report.refetch()} />;

  const d = report.data!;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text }}>
          Budget vs Actual
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {!budget.data && (
            <BtnSecondary onClick={() => copyFromPrior.mutate(undefined, { onSuccess: () => toast.success("Budget copied from prior week") })}>
              Copy prior week budget
            </BtnSecondary>
          )}
          <WeekSelector
            weekStart={weekStart}
            label={formatWeekLabel(weekStart)}
            onPrev={() => setWeekStart(weekOffset(weekStart, -1))}
            onNext={() => setWeekStart(weekOffset(weekStart, 1))}
          />
        </div>
      </div>

      {/* Prime cost headline */}
      <div style={{ padding: "0 32px 20px", display: "flex", gap: 16 }}>
        {[
          { label: "Actual Prime Cost %",  value: fmtPct(d.primeCostActualPct),  color: C.text },
          { label: "Budget Prime Cost %",  value: fmtPct(d.primeCostBudgetPct),  color: C.textMuted },
          { label: "Variance",             value: `${d.primeCostVariancePts >= 0 ? "+" : ""}${d.primeCostVariancePts.toFixed(1)} pts`,
            color: d.onBudget ? C.green : C.red },
        ].map(item => (
          <div key={item.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", flex: 1 }}>
            <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 28, color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0 32px 32px" }}>
        <Card>
          <Table>
            <thead>
              <tr>
                <Th>Line Item</Th>
                <Th right>Actual $</Th>
                <Th right>Budget $</Th>
                <Th right>Variance $</Th>
                <Th right>Variance</Th>
              </tr>
            </thead>
            <tbody>
              {d.lines.map((line, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "#171614" }}>
                  <Td>{line.label}</Td>
                  <Td right mono>{fmt(line.actualAmount)}</Td>
                  <Td right mono style={{ color: C.textDim }}>{fmt(line.budgetAmount)}</Td>
                  <Td right mono style={{ color: line.favorable ? C.green : C.red }}>
                    {line.varianceAmount >= 0 ? "+" : ""}{fmt(line.varianceAmount)}
                  </Td>
                  <Td right>
                    {line.variancePct !== null && (
                      <VarianceChip pts={line.variancePct} favorable={line.favorable} />
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export { BudgetVsActualPage };
export default BudgetVsActualPage;
