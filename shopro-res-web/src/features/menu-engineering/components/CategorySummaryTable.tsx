// ─────────────────────────────────────────────────────────────
// components/CategorySummaryTable.tsx (ME.5)
// Category-level summary with food-cost progress bars.
// BE: CategoryDistributionMap fields: category, itemCount, avgMargin.
// ─────────────────────────────────────────────────────────────

import { ClassificationBadge } from "./ClassificationBadge";
import { formatCurrency } from "../hooks/useMenuEngineering";
import type { CategoryDistributionMap } from "@/types/menuEngineering.types";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";

interface CategorySummaryTableProps {
  /** categories must have id field (assigned from index before passing). */
  categories: CategoryDistributionMap[];
  onRowClick?: (category: string) => void;
  loading?: boolean;
}

export function CategorySummaryTable({ categories, onRowClick, loading }: CategorySummaryTableProps) {
  // Assign id from array index — ResponsiveDataList requires T.id.
  const items = categories.map((c, i) => ({ ...c, id: c.id ?? i }));

  const columns: Column<CategoryDistributionMap>[] = [
    {
      header: "Cost Group",
      accessorKey: "category",
      cell: (c) => <span className="font-semibold text-foreground">{c.category}</span>,
    },
    {
      header: "Items",
      accessorKey: "itemCount",
      cell: (c) => <span className="tabular-nums">{c.itemCount}</span>,
    },
    {
      header: "Revenue",
      accessorKey: "totalRevenue",
      cell: (c) => <span className="tabular-nums">{formatCurrency(c.totalRevenue)}</span>,
    },
    {
      header: "Profit",
      accessorKey: "totalProfit",
      cell: (c) => <span className="tabular-nums font-semibold">{formatCurrency(c.totalProfit)}</span>,
    },
    {
      header: "Avg Margin",
      accessorKey: "avgMargin",
      cell: (c) => <span className="tabular-nums text-xs text-muted-foreground">{formatCurrency(c.avgMargin)}</span>,
    },
    {
      header: "⭐",
      accessorKey: "classification",
      cell: (c) => c.classification.WINNER > 0
        ? <ClassificationBadge classification="WINNER">{c.classification.WINNER}</ClassificationBadge>
        : <span className="text-muted-foreground/30">0</span>,
    },
    {
      header: "🧩",
      accessorKey: "classification",
      cell: (c) => c.classification.OPPORTUNITY > 0
        ? <ClassificationBadge classification="OPPORTUNITY">{c.classification.OPPORTUNITY}</ClassificationBadge>
        : <span className="text-muted-foreground/30">0</span>,
    },
    {
      header: "🐴",
      accessorKey: "classification",
      cell: (c) => c.classification.WORKHORSE > 0
        ? <ClassificationBadge classification="WORKHORSE">{c.classification.WORKHORSE}</ClassificationBadge>
        : <span className="text-muted-foreground/30">0</span>,
    },
    {
      header: "🐶",
      accessorKey: "classification",
      cell: (c) => c.classification.LOSER > 0
        ? <ClassificationBadge classification="LOSER">{c.classification.LOSER}</ClassificationBadge>
        : <span className="text-muted-foreground/30">0</span>,
    },
  ];

  return (
    <ResponsiveDataList
      data={items}
      columns={columns}
      isLoading={loading}
      onRowClick={(c) => onRowClick?.(c.category)}
      emptyMessage="No categories"
      emptyDescription="No cost group breakdown available."
    />
  );
}
