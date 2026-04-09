// SS5.1 — Live Prime Cost Dashboard
// Auto-refreshes every 5 min via React Query refetchInterval
import React, { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useLivePrimeCost, useForecast } from "../../hooks/usePrimeCost";
import { useWeeklyLaborSummary } from "../../hooks/useLabor";
import { useWeekNav } from "../../hooks/useWeekNav";
import {
  C, fmt, fmtK, pct, pcColor, StyleInjector,
  LoadingState, ErrorState, KpiCard, WeekNav, PageHeader, Spinner,
} from "./components/shared";

const LiveDashboardPage: FC = () => {
  const navigate     = useNavigate();
  const restaurantId = useRestaurantId();
  const { weekStart, label, prev, next, isCurrentWeek } = useWeekNav();

  const live   = useLivePrimeCost(restaurantId);
  const fcast  = useForecast(restaurantId, weekStart);
  const labor  = useWeeklyLaborSummary(restaurantId, weekStart);

  if (live.isLoading) return <LoadingState label="Loading live data…" />;
  if (live.isError)   return <ErrorState message="Failed to load live prime cost" onRetry={live.refetch} />;

  const d = live.data!;
  const f = fcast.data;
  const l = labor.data;

  const pc = d.primeCostPct;
  const color = pcColor(pc);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 32px",
      fontFamily: "'DM Sans',sans-serif" }}>
      <StyleInjector />

      <PageHeader
        title="Live Dashboard"
        subtitle={`Auto-refreshes every 5 minutes · Last updated ${new Date(d.computedAt).toLocaleTimeString()}`}
        actions={
          <>
            <WeekNav label={label} onPrev={prev} onNext={next} isCurrentWeek={isCurrentWeek} />
            <button className="pc-btn-secondary" onClick={() => live.refetch()}>
              {live.isFetching ? <Spinner size={14} /> : "↻"} Refresh
            </button>
            <button className="pc-btn-ghost" onClick={() => navigate("/prime-cost")}>← Hub</button>
          </>
        }
      />

      {/* ── Hero % ── */}
      <div className="pc-fadeUp" style={{
        background: C.surfaceHigh, border: `2px solid ${color}`,
        borderRadius: 20, padding: "32px 36px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase",
            letterSpacing: ".08em", marginBottom: 8 }}>Prime Cost %</div>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 72,
            fontWeight: 700, color, lineHeight: 1 }}>{pct(pc)}</div>
          <div style={{ fontSize: 13, color: C.textMuted, marginTop: 8 }}>
            {pc <= 62 ? "✓ On target" : pc <= 65 ? "⚠ Marginal" : "✕ Over target"}
          </div>
        </div>

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            ["Gross Sales", fmtK(d.grossSalesToDate), "From order lines"],
            ["Theoretical COS", fmt(d.theoreticalCos), "Recipe costs × qty sold"],
            ["Posted Purchases", fmt(d.postedPurchases), "Invoices this week"],
            ["Labor Accrual", fmt(d.laborAccrual), "Days elapsed × weekly rate"],
          ].map(([lbl, val, sub]) => (
            <div key={lbl} style={{ background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: C.textDim, letterSpacing: ".06em",
                textTransform: "uppercase", marginBottom: 4 }}>{lbl}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 20,
                fontWeight: 700, color: C.text }}>{val}</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Three columns: Sales / COS / Labor ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>

        {/* Sales */}
        <div className="pc-card pc-fadeUp" style={{ animationDelay: ".04s" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
            fontWeight: 600, color: C.text, fontSize: 13 }}>Sales</div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Gross Sales", fmtK(d.grossSalesToDate)],
              ["Covers",      String(d.coversToDate)],
              ["Check Avg",   fmt(d.checkAverage)],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.textMuted }}>{lbl}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: C.text }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COS */}
        <div className="pc-card pc-fadeUp" style={{ animationDelay: ".08s" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
            fontWeight: 600, color: C.text, fontSize: 13 }}>Cost of Sales</div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Theoretical COS", fmt(d.theoreticalCos)],
              ["Posted Purchases",fmt(d.postedPurchases)],
              ["Purchases COS %", pct(d.grossSalesToDate > 0 ? d.postedPurchases / d.grossSalesToDate * 100 : 0)],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.textMuted }}>{lbl}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: C.text }}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Labor */}
        <div className="pc-card pc-fadeUp" style={{ animationDelay: ".12s" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
            fontWeight: 600, color: C.text, fontSize: 13 }}>Labor</div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {labor.isLoading
              ? <Spinner size={16} />
              : l
                ? [
                    ["Mgmt Labor",   fmt(l.totalMgmtCost)],
                    ["Hourly Labor", fmt(l.totalHourlyCost)],
                    ["Total Hours",  `${l.totalHours.toFixed(1)} hrs`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: C.textMuted }}>{lbl}</span>
                      <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 600, color: C.text }}>{val}</span>
                    </div>
                  ))
                : <span style={{ color: C.textDim, fontSize: 13 }}>No labor entered</span>
            }
          </div>
        </div>
      </div>

      {/* ── EOW Forecast banner ── */}
      {f && (
        <div className="pc-fadeUp pc-card" style={{
          padding: "16px 20px", animationDelay: ".16s",
          borderColor: f.onTrack ? C.green : C.amber,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 16 }}>{f.onTrack ? "✓" : "⚠"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>
                End-of-week forecast: <span style={{ fontFamily: "'DM Mono',monospace",
                  color: pcColor(f.forecastedPrimeCostPct) }}>{pct(f.forecastedPrimeCostPct)}</span>
              </div>
              <div style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>
                Budget {pct(f.budgetPrimeCostPct)} ·{" "}
                {f.onTrack
                  ? `${Math.abs(f.projectedVariancePts).toFixed(1)} pts below budget — on track`
                  : `${f.projectedVariancePts.toFixed(1)} pts over budget — action needed`}
              </div>
            </div>
            <button className="pc-btn-secondary" onClick={() => navigate("/prime-cost/weekly")}>
              View worksheet →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDashboardPage;
