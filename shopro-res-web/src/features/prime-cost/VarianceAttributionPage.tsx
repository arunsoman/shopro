// ─────────────────────────────────────────────────────────────
// features/prime-cost/VarianceAttributionPage.tsx  — SS5.4
// WHY did prime cost change — 4 expandable buckets
// ─────────────────────────────────────────────────────────────

import React, { useState, type FC } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useVarianceAttribution } from "@/prime-cost/hooks/usePrimeCost";
import {
  C, fmt, fmtPts, GlobalStyles, Card,
  WeekSelector, PageLoader, PageError, VarianceChip,
  Table, Th, Td,
} from "./components/shared";
import { getWeekStart, formatWeekLabel, weekOffset } from "@/lib/date";
import type { VarianceBucketType } from "@/types";

const BUCKET_META: Record<VarianceBucketType, { label: string; icon: string; desc: string }> = {
  PRICE:   { label: "Price Variance",   icon: "💰", desc: "Ingredient price changes × qty sold" },
  MIX:     { label: "Volume Mix Shift", icon: "📊", desc: "Change in sales mix toward higher/lower cost items" },
  PORTION: { label: "Portion Variance", icon: "⚖",  desc: "Actual COGS − Theoretical COGS (shrinkage, waste, over-portioning)" },
  LABOR:   { label: "Labor Variance",   icon: "👥", desc: "Actual labor vs scheduled labor" },
};

const VarianceAttributionPage: FC = () => {
  const restaurantId = useRestaurantId();
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const query = useVarianceAttribution(restaurantId, weekStart);

  const toggleBucket = (type: string) =>
    setExpanded(p => ({ ...p, [type]: !p[type] }));

  if (query.isLoading) return <PageLoader />;
  if (query.isError)   return <PageError message="Failed to load variance attribution" onRetry={() => query.refetch()} />;

  const d = query.data!;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />

      <div style={{ padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: C.text }}>
            Variance Attribution
          </h1>
          <div style={{ fontSize: 13, color: C.textDim, marginTop: 2 }}>
            {formatWeekLabel(weekStart)} · Total explained variance:{" "}
            <VarianceChip pts={d.totalVariancePts} />
          </div>
        </div>
        <WeekSelector
          weekStart={weekStart}
          label={formatWeekLabel(weekStart)}
          onPrev={() => setWeekStart(weekOffset(weekStart, -1))}
          onNext={() => setWeekStart(weekOffset(weekStart, 1))}
        />
      </div>

      {/* Summary donut (simple bar for now) */}
      <div style={{ padding: "0 32px 20px", display: "flex", gap: 12 }}>
        {d.buckets.map(bucket => {
          const meta = BUCKET_META[bucket.bucketType];
          const pct = d.totalVariancePts !== 0
            ? Math.abs(bucket.totalImpactPts / d.totalVariancePts) * 100
            : 0;
          return (
            <div key={bucket.bucketType} style={{
              flex: 1, background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{meta.icon}</div>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 4 }}>{meta.label}</div>
              <div style={{
                fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 20,
                color: bucket.totalImpactPts > 0 ? C.red : C.green,
              }}>
                {fmtPts(bucket.totalImpactPts)}
              </div>
              <div style={{ height: 4, background: C.surfaceHigh, borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: bucket.totalImpactPts > 0 ? C.red : C.green,
                  borderRadius: 2,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable buckets */}
      <div style={{ padding: "0 32px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
        {d.buckets.map(bucket => {
          const meta   = BUCKET_META[bucket.bucketType];
          const isOpen = expanded[bucket.bucketType];
          return (
            <Card key={bucket.bucketType}>
              <div
                onClick={() => toggleBucket(bucket.bucketType)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: C.text }}>{meta.label}</div>
                    <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>{meta.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 18,
                    color: bucket.totalImpactPts > 0 ? C.red : C.green,
                  }}>
                    {fmtPts(bucket.totalImpactPts)}
                  </span>
                  <span style={{ color: C.textDim, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .2s" }}>›</span>
                </div>
              </div>

              {isOpen && bucket.rows.length > 0 && (
                <div style={{ borderTop: `1px solid ${C.border}` }}>
                  <Table>
                    <thead>
                      <tr>
                        <Th>Item</Th>
                        <Th right>Impact $</Th>
                        <Th right>Impact pts</Th>
                        <Th>Detail</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {bucket.rows.map((row, i) => (
                        <tr key={i}>
                          <Td>{row.description}</Td>
                          <Td right mono style={{ color: row.impact > 0 ? C.red : C.green }}>
                            {row.impact >= 0 ? "+" : ""}{fmt(row.impact)}
                          </Td>
                          <Td right>
                            <VarianceChip pts={row.impactPts} favorable={row.impactPts <= 0} />
                          </Td>
                          <Td style={{ color: C.textDim, fontSize: 12 }}>{row.detail}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {isOpen && bucket.rows.length === 0 && (
                <div style={{ padding: "16px 18px", color: C.textDim, fontSize: 14 }}>
                  No items in this bucket for this week.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default VarianceAttributionPage;
