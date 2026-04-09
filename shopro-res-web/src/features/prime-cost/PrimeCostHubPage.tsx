// SS5.0 — Prime Cost Hub
import React, { type FC } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useLivePrimeCost, useForecast, usePrimeCostTrend } from "@/hooks/usePrimeCost";
import { useWeekNav } from "@/hooks/useWeekNav";
import {
  C, fmt, pct, fmtK, pcColor, StyleInjector,
  KpiCard, LoadingState, ErrorState, PageHeader, WeekNav, Spinner,
} from "./components/shared";

const NAV_CARDS = [
  { label: "Live Dashboard",        sub: "Real-time prime cost %",      path: "/prime-cost/live",      icon: "⚡" },
  { label: "Weekly Worksheet",      sub: "Sales · COS · Labor summary", path: "/prime-cost/weekly",    icon: "📋" },
  { label: "Budget vs Actual",      sub: "Line-item variance report",   path: "/prime-cost/budget",    icon: "🎯" },
  { label: "Variance Attribution",  sub: "Price · Mix · Portion · Labor",path: "/prime-cost/variance", icon: "🔍" },
  { label: "8-Week Trend",          sub: "Historical prime cost trend",  path: "/prime-cost/trend",    icon: "📈" },
  { label: "Labor & Schedule",      sub: "Hours entry + schedule",      path: "/prime-cost/labor",     icon: "👥" },
];

const PrimeCostHubPage: FC = () => {
  const navigate      = useNavigate();
  const restaurantId  = useRestaurantId();
  const { weekStart, label, prev, next, isCurrentWeek } = useWeekNav();

  const live     = useLivePrimeCost(restaurantId);
  const forecast = useForecast(restaurantId, weekStart);
  const trend    = usePrimeCostTrend(restaurantId, 8);

  const liveData = live.data;
  const fcastData = forecast.data;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "28px 32px",
      fontFamily: "'DM Sans',sans-serif" }}>
      <StyleInjector />

      <PageHeader
        title="Prime Cost"
        subtitle="Your single most important number — tracked live, every week"
        actions={<WeekNav label={label} onPrev={prev} onNext={next} isCurrentWeek={isCurrentWeek} />}
      />

      {/* ── Live hero banner ── */}
      <div className="pc-fadeUp" style={{
        background: liveData
          ? (liveData.primeCostPct <= 62 ? C.greenDim : liveData.primeCostPct <= 68 ? C.amberDim : C.redDim)
          : C.surfaceHigh,
        border: `1px solid ${liveData
          ? (liveData.primeCostPct <= 62 ? C.green : liveData.primeCostPct <= 68 ? C.amber : C.red)
          : C.border}`,
        borderRadius: 16, padding: "24px 28px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase",
            letterSpacing: ".07em", marginBottom: 4 }}>Live Prime Cost %</div>
          {live.isLoading
            ? <Spinner size={32} />
            : <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 52,
                fontWeight: 700, color: liveData
                  ? pcColor(liveData.primeCostPct)
                  : C.textDim, lineHeight: 1 }}>
                {liveData ? pct(liveData.primeCostPct) : "—"}
              </div>
          }
        </div>
        {liveData && (
          <>
            <div style={{ width: 1, height: 60, background: C.border }} />
            <div>
              <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase",
                letterSpacing: ".06em", marginBottom: 4 }}>Gross Sales To Date</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 22,
                fontWeight: 700, color: C.text }}>{fmtK(liveData.grossSalesToDate)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase",
                letterSpacing: ".06em", marginBottom: 4 }}>Covers</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 22,
                fontWeight: 700, color: C.text }}>{liveData.coversToDate}</div>
            </div>
            {fcastData && (
              <>
                <div style={{ width: 1, height: 60, background: C.border }} />
                <div>
                  <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase",
                    letterSpacing: ".06em", marginBottom: 4 }}>EOW Forecast</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 22,
                    fontWeight: 700, color: pcColor(fcastData.forecastedPrimeCostPct) }}>
                    {pct(fcastData.forecastedPrimeCostPct)}
                    <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'DM Sans'",
                      marginLeft: 8, fontWeight: 400 }}>
                      Budget {pct(fcastData.budgetPrimeCostPct)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
        <div style={{ marginLeft: "auto", fontSize: 12, color: C.textDim }}>
          {liveData && `Updated ${new Date(liveData.computedAt).toLocaleTimeString()}`}
          {live.isLoading && <span className="pc-pulse"> Refreshing…</span>}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
        gap: 14, marginBottom: 28 }}>
        <KpiCard label="Theoretical COS"
          value={liveData ? fmt(liveData.theoreticalCos) : "—"}
          sub="From order lines × recipe costs" delay="0.04s" />
        <KpiCard label="Posted Purchases"
          value={liveData ? fmt(liveData.postedPurchases) : "—"}
          sub="Invoices posted this week" delay="0.08s" />
        <KpiCard label="Labor Accrual"
          value={liveData ? fmt(liveData.laborAccrual) : "—"}
          sub="Hours entered × rates" delay="0.12s" />
        <KpiCard label="Check Average"
          value={liveData ? fmt(liveData.checkAverage) : "—"}
          sub="Gross sales ÷ covers" delay="0.16s" />
      </div>

      {/* ── Nav cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
        gap: 14 }}>
        {NAV_CARDS.map((card, i) => (
          <div
            key={card.path}
            className="pc-fadeUp"
            onClick={() => navigate(card.path)}
            style={{
              animationDelay: `${0.05 + i * 0.05}s`,
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "18px 20px", cursor: "pointer",
              transition: "border-color .2s, background .2s, transform .15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.amber;
              (e.currentTarget as HTMLDivElement).style.background = "#1e1c19";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
              (e.currentTarget as HTMLDivElement).style.background = C.surface;
              (e.currentTarget as HTMLDivElement).style.transform = "none";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 15, marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 13, color: C.textMuted }}>{card.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrimeCostHubPage;
