// ─────────────────────────────────────────────────────────────
// HistoricalDeltaModal.tsx (ME.9)
// Modal showing delta summary between two periods.
// ─────────────────────────────────────────────────────────────

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "../hooks/useMenuEngineering";
import type { ComparisonDto } from "@/types/menuEngineering.types";

interface HistoricalDeltaModalProps {
  open: boolean;
  onClose: () => void;
  comparison: ComparisonDto | null;
}

export function HistoricalDeltaModal({ open, onClose, comparison }: HistoricalDeltaModalProps) {
  if (!comparison) return null;

  const rows = comparison.rows ?? [];
  const changedRows = rows.filter((r) => r.changed);
  const improved = changedRows.filter((r) => r.grossProfitP2 > r.grossProfitP1).length;
  const declined  = changedRows.filter((r) => r.grossProfitP2 < r.grossProfitP1).length;

  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Period Delta Summary</ModalTitle>
          <ModalDescription>
            {comparison.periodName1} vs {comparison.periodName2}
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            <KpiCard
              title="Revenue Δ"
              value={formatCurrency(comparison.revenueDelta)}
              delta={comparison.revenueDelta >= 0 ? "+" : ""}
              deltaDir={comparison.revenueDelta >= 0 ? "up" : "down"}
            />
            <KpiCard title="Improved" value={String(improved)} deltaDir="up" />
            <KpiCard title="Declined"  value={String(declined)} deltaDir="down" />
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Classification Migration</h4>
            {changedRows.length === 0 ? (
              <p className="text-xs text-muted-foreground">No classification changes between periods.</p>
            ) : (
              <div className="space-y-1">
                {changedRows.slice(0, 10).map((r) => (
                  <div key={r.menuItemId} className="flex items-center gap-2 text-xs">
                    <span className="font-semibold truncate flex-1">{r.itemName}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {r.classificationPeriod1} → {r.classificationPeriod2}
                    </span>
                  </div>
                ))}
                {changedRows.length > 10 && (
                  <p className="text-[10px] text-muted-foreground/60">
                    +{changedRows.length - 10} more changes
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <ModalFooter>
          <Button onClick={onClose} className="rounded-xl">Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
