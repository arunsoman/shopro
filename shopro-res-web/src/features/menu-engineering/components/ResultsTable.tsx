// ─────────────────────────────────────────────────────────────
// components/ResultsTable.tsx (ME.3)
// Sortable/filterable data table of analysis results.
// BE: MenuEngResult fields are itemName, contributionMargin, grossProfit
// (NOT itemNameSnapshot, itemGrossProfit).
// ─────────────────────────────────────────────────────────────

import { useMemo, useState } from "react";
import { Download, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { ClassificationBadge } from "./ClassificationBadge";
import { formatCurrency, formatPct } from "../hooks/useMenuEngineering";
import type { MenuEngClassification } from "@/types/enums.types";
import { cn } from "@/lib/utils";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";

interface ResultsTableProps {
  results: {
    itemId: number;
    itemName: string;
    quantitySold: number;
    sellPrice: number;
    itemCost: number;
    contributionMargin: number;
    salesMixPct: number;
    classification: string;
    _fcPct: number;
  }[];
  periodId: number;
  onItemClick?: (menuItemId: number) => void;
  onWhatIf?: () => void;
  loading?: boolean;
}

type SortKey = "itemName" | "contributionMargin" | "sellPrice" | "quantitySold" | "salesMixPct";
type SortDir = "asc" | "desc";

function FC_PILL(pct: number) {
  const color =
    pct < 30 ? "bg-emerald-500/10 text-emerald-600" :
    pct <= 40 ? "bg-amber-500/10 text-amber-600" :
    "bg-rose-500/10 text-rose-600";
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums", color)}>
      {formatPct(pct)}
    </span>
  );
}

export function ResultsTable({
  results,
  periodId,
  onItemClick,
  onWhatIf,
  loading,
}: ResultsTableProps) {
  const [filterCls, setFilterCls] = useState<MenuEngClassification | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("contributionMargin");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let data = [...results].map((r) => ({ ...r, id: r.itemId }));
    if (filterCls !== "ALL") data = data.filter((r) => r.classification === filterCls);
    data.sort((a, b) => {
      const aV = a[sortKey] as number | string;
      const bV = b[sortKey] as number | string;
      const cmp =
        typeof aV === "number" && typeof bV === "number"
          ? aV - bV
          : String(aV).localeCompare(String(bV));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return data;
  }, [results, filterCls, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  type RowType = typeof filtered[0];
  const columns: Column<RowType>[] = [
    { header: "Item",     accessorKey: "itemName",            cell: (r) => <span className="font-semibold text-foreground">{r.itemName}</span>, sortable: true },
    { header: "Price",   accessorKey: "sellPrice",           cell: (r) => <span className="tabular-nums">{formatCurrency(r.sellPrice)}</span>, sortable: true },
    { header: "Cost",    accessorKey: "itemCost",            cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.itemCost)}</span>, sortable: true },
    { header: "CM",      accessorKey: "contributionMargin",  cell: (r) => <span className="tabular-nums font-semibold">{formatCurrency(r.contributionMargin)}</span>, sortable: true },
    { header: "FC%",    accessorKey: "_fcPct",              cell: (r) => FC_PILL(r._fcPct), sortable: false },
    { header: "Qty Sold",accessorKey: "quantitySold",       cell: (r) => <span className="tabular-nums">{r.quantitySold.toLocaleString()}</span>, sortable: true },
    { header: "Mix %",  accessorKey: "salesMixPct",         cell: (r) => <span className="tabular-nums">{formatPct(r.salesMixPct)}</span>, sortable: true },
    { header: "Class",  accessorKey: "classification",      cell: (r) => <ClassificationBadge classification={r.classification} />, sortable: false },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classification</span>
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
          {onWhatIf && (
            <Button variant="ghost" size="sm" onClick={onWhatIf} className="h-9 rounded-xl gap-1.5">
              <FlaskConical size={14} />
              What-If
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-9 rounded-xl gap-1.5">
            <Download size={14} />
            Export
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <ResponsiveDataList
        data={filtered}
        columns={columns}
        isLoading={loading}
        searchable
        searchPlaceholder="Search items…"
        onRowClick={(r) => onItemClick?.(r.itemId)}
        emptyMessage="No results"
        emptyDescription="No items match the current filter."
      />
    </div>
  );
}
