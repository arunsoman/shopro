// ─────────────────────────────────────────────────────────────
// features/prime-cost/TrendChartPage.tsx  — SS5.5
// N-week rolling line chart + budget overlay + history table
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { usePrimeCostTrend, useRecentBudgets } from "@/prime-cost/hooks/usePrimeCost";
import {
  C, fmt, fmtPct, GlobalStyles, Card, CardHeader,
  BtnGhost, PageLoader, PageError, StatusBadge,
  Table, Th, Td, VarianceChip,
} from "./components/shared";

const WEEK_OPTIONS = [4, 8, 12, 26] as const;
type WeekOption = (typeof WEEK_OPTIONS)[number];

const TrendChartPage: FC = () => {
  const restaurantId = useRestaurantId();
  const [weeks, setWeeks] = useState<WeekOption>(8);
  const [showBudget, setShowBudget] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const trend   = usePrimeCostTrend(restaurantId, weeks);
  const budgets = useRecentBudgets(restaurantId, weeks);

  // ── Canvas line chart ─────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !trend.data) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts     = trend.data.points;
    const W       = canvas.width;
    const H       = canvas.height;
    const padL    = 48;
    const padR    = 16;
    const padT    = 16;
    const padB    = 32;
    const chartW  = W - padL - padR;
    const chartH  = H - padT - padB;

    const allVals = pts.flatMap(p => [
      p.primeCostGrossPct,
      ...(showBudget && p.budgetPrimeCostPct ? [p.budgetPrimeCostPct] : []),
    ]);
    const minV = Math.max(0, Math.min(...allVals) - 5);
    const maxV = Math.min(100, Math.max(...allVals) + 5);
    const rangeV = maxV - minV;

    const xOf = (i: number) => padL + (i / (pts.length - 1 || 1)) * chartW;
    const yOf = (v: number) => padT + chartH - ((v - minV) / rangeV) * chartH;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    [0, 25, 50, 75, 100].forEach(g => {
      if (g < minV || g > maxV) return;
      const y = yOf(g);
      ctx.beginPath();
      ctx.strokeStyle = "#2e2c29";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(padL, y); ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = "#6b7280";
      ctx.font = "11px DM Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${g}%`, padL - 6, y + 4);
    });
    ctx.setLineDash([]);

    // Budget line
    if (showBudget) {
      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      pts.forEach((p, i) => {
        const bPct = budgets.data?.find(b => b.weekStart === p.weekStart)?.budgetPrimeCostPct ?? p.budgetPrimeCostPct;
        if (bPct === null || bPct === undefined) return;
        if (i === 0) ctx.moveTo(xOf(i), yOf(bPct));
        else ctx.lineTo(xOf(i), yOf(bPct));
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Actual prime cost line
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.5;
    pts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(xOf(i), yOf(p.primeCostGrossPct));
      else ctx.lineTo(xOf(i), yOf(p.primeCostGrossPct));
    });
    ctx.stroke();

    // Dots + x labels
    pts.forEach((p, i) => {
      const x = xOf(i);
      const y = yOf(p.primeCostGrossPct);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.primeCostGrossPct < 65 ? "#10b981" : "#ef4444";
      ctx.fill();
      // X label (every other point to avoid crowding)
      if (i % 2 === 0 || pts.length <= 8) {
        ctx.fillStyle = "#6b7280";
        ctx.font = "10px DM Sans, sans-serif";
        ctx.textAlign = "center";
        const d = new Date(p.weekStart);
        ctx.fillText(`${d.getMonth() + 1}/${d.getDate()}`, x, H - padB + 16);
      }
    });
  }, [trend.data, budgets.data, showBudget]);

  if (trend.isLoading) return <PageLoader />;
  if (trend.isError)   return <PageError message="Failed to load trend data" onRetry={() => trend.refetch()} />;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text }}>
          Prime Cost Trend
        </h1>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Week range toggle */}
          <div style={{ display: "flex", background: C.surfaceHigh, borderRadius: 8, overflow: "hidden" }}>
            {WEEK_OPTIONS.map(w => (
              <button
                key={w}
                onClick={() => setWeeks(w)}
                style={{
                  background: weeks === w ? C.amber : "transparent",
                  color: weeks === w ? "#0f0e0c" : C.textMuted,
                  border: "none", padding: "7px 14px", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: weeks === w ? 600 : 400, fontSize: 13,
                }}
              >
                {w}w
              </button>
            ))}
          </div>
          {/* Budget toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: C.textMuted, fontSize: 13, cursor: "pointer" }}>
            <div
              onClick={() => setShowBudget(p => !p)}
              style={{ width: 34, height: 18, borderRadius: 9, background: showBudget ? C.amber : C.border, position: "relative", cursor: "pointer", transition: "background .2s" }}
            >
              <div style={{ position: "absolute", top: 2, left: showBudget ? 18 : 2, width: 14, height: 14, borderRadius: 7, background: "#fff", transition: "left .2s" }} />
            </div>
            Show budget
          </label>
        </div>
      </div>

      <div style={{ padding: "0 32px 24px" }}>
        {/* Canvas chart */}
        <Card style={{ padding: 20, marginBottom: 20 }}>
          <canvas
            ref={canvasRef}
            width={900}
            height={280}
            style={{ width: "100%", height: 280, display: "block" }}
          />
          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 12, fontSize: 12, color: C.textMuted }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 20, height: 2.5, background: C.green, borderRadius: 1 }} />
              Actual prime cost %
            </div>
            {showBudget && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 20, height: 1.5, background: C.amber, borderRadius: 1, borderTop: "1px dashed #f59e0b" }} />
                Budget
              </div>
            )}
          </div>
        </Card>

        {/* History table */}
        <Card>
          <CardHeader title={`Last ${weeks} Weeks`} />
          <Table>
            <thead>
              <tr>
                <Th>Week</Th>
                <Th right>Gross Sales</Th>
                <Th right>Total COS</Th>
                <Th right>Total Labor</Th>
                <Th right>Prime Cost</Th>
                <Th right>Prime Cost %</Th>
                <Th right>Budget %</Th>
                <Th right>Variance</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {trend.data?.points.slice().reverse().map((pt) => {
                const variance = pt.budgetPrimeCostPct !== null
                  ? pt.primeCostGrossPct - pt.budgetPrimeCostPct
                  : null;
                return (
                  <tr key={pt.weekStart}>
                    <Td style={{ whiteSpace: "nowrap" }}>
                      {new Date(pt.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Td>
                    <Td right mono>{fmt(pt.grossSales)}</Td>
                    <Td right mono>{fmt(pt.totalActualCos)}</Td>
                    <Td right mono>{fmt(pt.totalLabor)}</Td>
                    <Td right mono>{fmt(pt.primeCostGross)}</Td>
                    <Td right mono style={{ color: pt.primeCostGrossPct < 65 ? C.green : C.red, fontWeight: 700 }}>
                      {fmtPct(pt.primeCostGrossPct)}
                    </Td>
                    <Td right mono style={{ color: C.textDim }}>
                      {pt.budgetPrimeCostPct !== null ? fmtPct(pt.budgetPrimeCostPct) : "—"}
                    </Td>
                    <Td right>
                      {variance !== null
                        ? <VarianceChip pts={variance} favorable={variance <= 0} />
                        : <span style={{ color: C.textDim }}>—</span>
                      }
                    </Td>
                    <Td><StatusBadge status={pt.status} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default TrendChartPage;
