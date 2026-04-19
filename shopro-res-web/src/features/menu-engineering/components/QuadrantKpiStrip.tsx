// ─────────────────────────────────────────────────────────────
// components/QuadrantKpiStrip.tsx (ME.4)
// 4 × KpiCard strip for Stars / Puzzles / Plow Horses / Dogs.
// ─────────────────────────────────────────────────────────────

import { Star, Puzzle, Tractor, Dog } from "lucide-react";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import type { MenuEngClassification } from "@/types/enums.types";

interface QuadrantKpiStripProps {
  winnerCount: number;
  opportunityCount: number;
  workhorseCount: number;
  loserCount: number;
  onClassificationClick?: (cls: MenuEngClassification) => void;
  loading?: boolean;
}

export function QuadrantKpiStrip({
  winnerCount,
  opportunityCount,
  workhorseCount,
  loserCount,
  onClassificationClick,
  loading,
}: QuadrantKpiStripProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <KpiCard
        title="⭐ Stars"
        value={winnerCount.toString()}
        icon={Star}
        delta="High GP · High Mix"
        deltaDir="up"
        onClick={onClassificationClick ? () => onClassificationClick("WINNER") : undefined}
        loading={loading}
      />
      <KpiCard
        title="🧩 Puzzles"
        value={opportunityCount.toString()}
        icon={Puzzle}
        delta="High GP · Low Mix"
        deltaDir="up"
        onClick={onClassificationClick ? () => onClassificationClick("OPPORTUNITY") : undefined}
        loading={loading}
      />
      <KpiCard
        title="🐴 Plow Horses"
        value={workhorseCount.toString()}
        icon={Tractor}
        delta="Low GP · High Mix"
        deltaDir="down"
        onClick={onClassificationClick ? () => onClassificationClick("WORKHORSE") : undefined}
        loading={loading}
      />
      <KpiCard
        title="🐶 Dogs"
        value={loserCount.toString()}
        icon={Dog}
        delta="Low GP · Low Mix"
        deltaDir="down"
        onClick={onClassificationClick ? () => onClassificationClick("LOSER") : undefined}
        loading={loading}
      />
    </div>
  );
}
