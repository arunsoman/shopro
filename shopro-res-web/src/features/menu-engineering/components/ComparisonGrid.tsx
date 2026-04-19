// ─────────────────────────────────────────────────────────────
// components/ComparisonGrid.tsx (ME.9 comparison table)
// Side-by-side classification migration table.
// BE: ComparisonDto.rows computed client-side by useComparison hook.
// BE: comparisonDto.totalRevenueP1/P2/revenueDelta/moversCount from useComparison.
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { ClassificationBadge } from "./ClassificationBadge";
import { formatCurrency, formatPct } from "../hooks/useMenuEngineering";
import type { ComparisonDto } from "@/types/menuEngineering.types";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";
import { Check, ArrowRight } from "lucide-react";

interface ComparisonGridProps {
  comparison: ComparisonDto | null;
  onItemClick?: (menuItemId: number) => void;
  loading?: boolean;
}

export function ComparisonGrid({ comparison, onItemClick, loading }: ComparisonGridProps) {
  const [moversOnly, setMoversOnly] = useState(false);

  const rows = useMemo(() => {
    if (!comparison?.rows) return [];
    if (!moversOnly) return comparison.rows;
    return comparison.rows.filter((r) => r.changed);
  }, [comparison, moversOnly]);

  const columns: Column<(typeof rows)[0]>[] = [
    {
      header: "Item",
      accessorKey: "itemName",
      cell: (r) => (
        <div>
          <span className="font-semibold text-foreground">{r.itemName}</span>
          {r.pluNumber && <span className="ml-2 text-xs text-muted-foreground font-mono">{r.pluNumber}</span>}
        </div>
      ),
    },
    {
      header: "P1 Class",
      accessorKey: "classificationPeriod1",
      cell: (r) => <ClassificationBadge classification={r.classificationPeriod1} />,
    },
    {
      header: "P2 Class",
      accessorKey: "classificationPeriod2",
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <ArrowRight size={12} className="text-muted-foreground" />
          <ClassificationBadge classification={r.classificationPeriod2} />
        </div>
      ),
    },
    {
      header: "Changed",
      accessorKey: "changed",
      cell: (r) =>
        r.changed ? (
          <Check size={14} className="text-amber-500" />
        ) : (
          <span className="text-muted-foreground/30">—</span>
        ),
    },
    {
      header: "CM P1",
      accessorKey: "grossProfitP1",
      cell: (r) => <span className="tabular-nums">{formatCurrency(r.grossProfitP1)}</span>,
    },
    {
      header: "CM P2",
      accessorKey: "grossProfitP2",
      cell: (r) => <span className="tabular-nums">{formatCurrency(r.grossProfitP2)}</span>,
    },
    {
      header: "Mix% P1",
      accessorKey: "salesMixPctP1",
      cell: (r) => <span className="tabular-nums">{formatPct(r.salesMixPctP1)}</span>,
    },
    {
      header: "Mix% P2",
      accessorKey: "salesMixPctP2",
      cell: (r) => <span className="tabular-nums">{formatPct(r.salesMixPctP2)}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <Switch checked={moversOnly} onCheckedChange={setMoversOnly} />
        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Movers Only
        </Label>
        {comparison?.moversCount !== undefined && (
          <span className="text-[10px] text-muted-foreground">
            ({comparison.moversCount} items changed)
          </span>
        )}
      </div>

      {/* Table */}
      <ResponsiveDataList
        data={rows}
        columns={columns}
        isLoading={loading}
        searchable
        searchPlaceholder="Search items…"
        onRowClick={(r) => onItemClick?.(r.menuItemId)}
        emptyMessage="No comparison data"
        emptyDescription="Select two periods to compare."
      />
    </div>
  );
}
