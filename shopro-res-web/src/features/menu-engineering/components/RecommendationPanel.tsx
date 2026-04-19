// ─────────────────────────────────────────────────────────────
// components/RecommendationPanel.tsx (ME.11)
// SlideOver showing all recommendations for an item / period.
// BE: Recommendation.id is UUID string (NOT number).
// BE: updateRecommendationStatus uses PATCH /recommendations/{uuid}/status.
// ─────────────────────────────────────────────────────────────

import { Check, X, Play } from "lucide-react";
import {
  SlideOver,
  SlideOverContent,
  SlideOverHeader,
  SlideOverTitle,
  SlideOverDescription,
  SlideOverFooter,
} from "@/components/ui/SlideOver";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataList } from "@/components/shared/lists/DataList";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  useRecommendations,
  useUpdateRecommendationStatus,
  formatCurrency,
  RECOMMENDATION_STATUS_BADGE_MAP,
} from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { cn } from "@/lib/utils";
import type { Recommendation } from "@/types/menuEngineering.types";

interface RecommendationPanelProps {
  open: boolean;
  onClose: () => void;
  periodId: number;
  menuItemId?: number;
  itemName?: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH:   "bg-rose-500/10 text-rose-600 border-rose-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  LOW:    "bg-slate-500/10 text-slate-600 border-slate-500/20",
};

export function RecommendationPanel({
  open,
  onClose,
  periodId,
  menuItemId,
  itemName,
}: RecommendationPanelProps) {
  const restaurantId = useRestaurantId();
  const { data: recommendations, isLoading } = useRecommendations(restaurantId, periodId);
  const updateStatus = useUpdateRecommendationStatus(restaurantId);

  // BE: recommendationId is UUID string — use rec.id (string).
  const handleStatusChange = (rec: Recommendation, nextStatus: "IN_PROGRESS" | "COMPLETED" | "DISMISSED") => {
    updateStatus.mutate({ recommendationId: rec.id, status: nextStatus });
  };

  return (
    <SlideOver open={open} onOpenChange={(v) => !v && onClose()}>
      <SlideOverContent side="right" className="sm:max-w-md">
        <SlideOverHeader>
          <SlideOverTitle>Recommendations</SlideOverTitle>
          <SlideOverDescription>
            {itemName ? `For ${itemName}` : `All items in period #${periodId}`}
          </SlideOverDescription>
        </SlideOverHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <DataList divided loading={isLoading}>
            {recommendations?.map((rec) => (
              <div key={rec.id} className="py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-[10px] font-bold border uppercase", PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.LOW)}>
                    {rec.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{rec.recommendationType}</span>
                </div>
                <h4 className="text-sm font-bold text-foreground">{rec.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>

                {rec.actionPlan && (
                  <p className="text-[11px] text-muted-foreground italic leading-relaxed border-l-2 border-border-soft pl-2">
                    {rec.actionPlan}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[10px]">
                  {rec.projectedImpactProfit != null && rec.projectedImpactProfit > 0 && (
                    <span className="text-emerald-600 font-bold">
                      +{formatCurrency(rec.projectedImpactProfit)}/yr impact
                    </span>
                  )}
                  <StatusBadge status={RECOMMENDATION_STATUS_BADGE_MAP[rec.status] ?? rec.status} />
                  {rec.assignedTo && <span className="text-muted-foreground">→ {rec.assignedTo}</span>}
                  {rec.dueDate && <span className="text-muted-foreground">Due {rec.dueDate}</span>}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-1">
                  {rec.status === "PENDING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] rounded-lg gap-1"
                      onClick={() => handleStatusChange(rec, "IN_PROGRESS")}
                    >
                      <Play size={10} /> Start
                    </Button>
                  )}
                  {rec.status === "IN_PROGRESS" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] rounded-lg gap-1 text-emerald-600"
                      onClick={() => handleStatusChange(rec, "COMPLETED")}
                    >
                      <Check size={10} /> Done
                    </Button>
                  )}
                  {rec.status !== "DISMISSED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] rounded-lg gap-1 text-muted-foreground"
                      onClick={() => handleStatusChange(rec, "DISMISSED")}
                    >
                      <X size={10} /> Dismiss
                    </Button>
                  )}
                </div>
              </div>
            )) ?? []}

            {recommendations?.length === 0 && !isLoading && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No recommendations yet.
              </div>
            )}
          </DataList>
        </div>

        <SlideOverFooter>
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl">Close</Button>
        </SlideOverFooter>
      </SlideOverContent>
    </SlideOver>
  );
}
