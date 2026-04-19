// ─────────────────────────────────────────────────────────────
// components/QuadrantMatrix.tsx (ME.4)
// Interactive Recharts ScatterChart with quadrant lines,
// classification-coloured dots, hover tooltips, and click.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { QuadrantKpiStrip } from "./QuadrantKpiStrip";
import { CLASSIFICATION_META, formatCurrency, formatPct } from "../hooks/useMenuEngineering";
import type { MenuEngClassification } from "@/types/enums.types";

interface QuadrantMatrixProps {
  /** Results enriched with _fcPct and _totalRevenue. */
  results: {
    itemId: number;
    itemName: string;
    salesMixPct: number;
    contributionMargin: number;
    itemCost: number;
    sellPrice: number;
    quantitySold: number;
    classification: string;
    _fcPct: number;
  }[];
  summary: {
    winnerCount: number;
    opportunityCount: number;
    workhorseCount: number;
    loserCount: number;
    avgContributionMargin?: number;
    popularityThreshold?: number;
    menuHealthScore?: number;
    [key: string]: unknown;
  };
  /** Computed average mix % threshold (50th percentile). */
  avgMixThreshold?: number;
  /** Computed average GP threshold. */
  avgGPThreshold?: number;
  onDotClick?: (menuItemId: number) => void;
  onClassificationClick?: (cls: MenuEngClassification) => void;
  loading?: boolean;
}

const CLASS_COLORS: Record<string, string> = {
  WINNER:      "#10b981",
  OPPORTUNITY: "#f59e0b",
  WORKHORSE:   "#06b6d4",
  LOSER:       "#f43f5e",
};

interface TooltipPayload {
  payload: {
    itemId: number;
    itemName: string;
    classification: string;
    contributionMargin: number;
    _fcPct: number;
    salesMixPct: number;
    quantitySold: number;
  };
}

function CustomTooltipContent({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cls = d.classification as MenuEngClassification;
  const meta = CLASSIFICATION_META[cls] ?? CLASSIFICATION_META.LOSER;
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-4 py-3 shadow-lg text-xs space-y-1.5 min-w-[180px]">
      <div className="font-bold text-sm text-foreground">{d.itemName}</div>
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${meta.bg} ${meta.color}`}>
          {meta.emoji} {meta.label}
        </span>
      </div>
      <div className="text-muted-foreground">
        CM: <span className="text-foreground font-semibold">{formatCurrency(d.contributionMargin)}</span>
      </div>
      <div className="text-muted-foreground">
        FC%: <span className="text-foreground font-semibold">{formatPct(d._fcPct)}</span>
      </div>
      <div className="text-muted-foreground">
        Sales Mix: <span className="text-foreground font-semibold">{formatPct(d.salesMixPct)}</span>
      </div>
      <div className="text-muted-foreground">
        Qty Sold: <span className="text-foreground font-semibold">{d.quantitySold}</span>
      </div>
    </div>
  );
}

export function QuadrantMatrix({
  results,
  summary,
  avgMixThreshold = 0.5,
  avgGPThreshold = 0,
  onDotClick,
  onClassificationClick,
  loading,
}: QuadrantMatrixProps) {
  const [filterCls, setFilterCls] = useState<MenuEngClassification | "ALL">("ALL");
  const [showLabels, setShowLabels] = useState(false);

  const filtered = useMemo(() => {
    if (filterCls === "ALL") return results;
    return results.filter((r) => r.classification === filterCls);
  }, [results, filterCls]);

  const maxMix = useMemo(
    () => Math.max(avgMixThreshold * 2, ...results.map((r) => r.salesMixPct)) * 1.1,
    [results, avgMixThreshold],
  );
  const maxGP = useMemo(
    () => Math.max(avgGPThreshold * 2, ...results.map((r) => r.contributionMargin)) * 1.1,
    [results, avgGPThreshold],
  );

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classification</Label>
          <Select
            value={filterCls}
            onValueChange={(v) => setFilterCls(v as MenuEngClassification | "ALL")}
          >
            <SelectTrigger className="h-9 w-[160px] text-xs rounded-xl" />
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="WINNER">⭐ Stars</SelectItem>
              <SelectItem value="OPPORTUNITY">🧩 Puzzles</SelectItem>
              <SelectItem value="WORKHORSE">🐴 Plow Horses</SelectItem>
              <SelectItem value="LOSER">🐶 Dogs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Show Labels</Label>
          <Switch checked={showLabels} onCheckedChange={setShowLabels} />
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border p-4">
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} horizontal={false} />
              <XAxis
                dataKey="salesMixPct"
                type="number"
                domain={[0, maxMix]}
                tick={{ fontSize: 10, fill: "var(--muted-2)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                label={{ value: "Popularity (Sales Mix %)", position: "bottom", fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                dataKey="contributionMargin"
                type="number"
                domain={[0, maxGP]}
                tick={{ fontSize: 10, fill: "var(--muted-2)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                label={{ value: "Contribution Margin ($)", angle: -90, position: "left", fontSize: 11, fill: "var(--muted-foreground)" }}
              />

              {/* Threshold lines */}
              {avgGPThreshold > 0 && (
                <ReferenceLine
                  y={avgGPThreshold}
                  stroke="var(--muted-2)"
                  strokeDasharray="6 4"
                  strokeWidth={1.5}
                  label={{ value: `Avg CM $${avgGPThreshold.toFixed(2)}`, position: "right", fontSize: 9, fill: "var(--muted-2)" }}
                />
              )}
              <ReferenceLine
                x={avgMixThreshold}
                stroke="var(--muted-2)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
              />

              {/* Quadrant corner labels */}
              <text x={maxMix * 0.85} y={8} textAnchor="middle" fill="#10b981" fontSize={13} fontWeight={800}>⭐ Stars</text>
              <text x={maxMix * 0.15} y={8} textAnchor="middle" fill="#f59e0b" fontSize={13} fontWeight={800}>🧩 Puzzles</text>
              <text x={maxMix * 0.85} y={maxGP * 0.95 + 14} textAnchor="middle" fill="#06b6d4" fontSize={13} fontWeight={800}>🐴 Plow Horses</text>
              <text x={maxMix * 0.15} y={maxGP * 0.95 + 14} textAnchor="middle" fill="#f43f5e" fontSize={13} fontWeight={800}>🐶 Dogs</text>

              <Tooltip content={<CustomTooltipContent />} />
              <Scatter
                data={filtered}
                onClick={(pt: { payload: { itemId: number } }) => pt?.payload?.itemId && onDotClick?.(pt.payload.itemId)}
                cursor="pointer"
              >
                {filtered.map((entry, i) => (
                  <Cell key={i} fill={CLASS_COLORS[entry.classification] ?? "#64748b"} fillOpacity={0.75} stroke="none" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Dot labels overlay */}
        {showLabels && (
          <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
            {filtered.slice(0, 50).map((r) => (
              <span
                key={r.itemId}
                className="bg-surface-2 border border-border-soft rounded px-1.5 py-0.5 truncate max-w-[120px]"
              >
                {r.itemName}
              </span>
            ))}
            {filtered.length > 50 && <span className="text-muted-foreground/40">+{filtered.length - 50} more</span>}
          </div>
        )}
      </div>

      {/* KPI Strip */}
      <QuadrantKpiStrip
        winnerCount={summary.winnerCount}
        opportunityCount={summary.opportunityCount}
        workhorseCount={summary.workhorseCount}
        loserCount={summary.loserCount}
        onClassificationClick={onClassificationClick}
        loading={loading}
      />
    </div>
  );
}

import { Cell } from "recharts";
