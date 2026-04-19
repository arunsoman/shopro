// ─────────────────────────────────────────────────────────────
// pages/PeriodHistoryPage.tsx (ME.7)
// List all past analysis periods with actions.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { Clock, MoreHorizontal, Trash2, Lock } from "lucide-react";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { FinalisePeriodModal } from "../components/FinalisePeriodModal";
import { usePeriods, useDeletePeriod } from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import { useAppStore } from "@/App";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { ResponsiveDataList, type Column } from "@/components/shared/ResponsiveDataList";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/Select";
import type { MenuEngineeringPeriod } from "@/types/menuEngineering.types";
import { toast } from "sonner";

function toBadgeStatus(status: string): string {
  if (status === "COMPLETE" || status === "FINALIZED") return "FINALISED";
  return status;
}

export default function PeriodHistoryPage() {
  const restaurantId = useRestaurantId();
  const back = useAppStore((s) => s.back);
  const { data: periods, isLoading } = usePeriods(restaurantId);
  const deleteMutation = useDeletePeriod(restaurantId);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<MenuEngineeringPeriod | null>(null);
  const [finaliseTarget, setFinaliseTarget] = useState<MenuEngineeringPeriod | null>(null);

  const filtered = (periods ?? []).filter(
    (p) => filterStatus === "ALL" || toBadgeStatus(p.status) === filterStatus,
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    toast.success("Analysis deleted");
    setDeleteTarget(null);
  };

  const handleFinalise = async () => {
    setFinaliseTarget(null);
  };

  const columns: Column<MenuEngineeringPeriod>[] = [
    {
      header: "Period",
      accessorKey: "periodName",
      cell: (p) => (
        <div>
          <span className="font-semibold text-foreground">{p.periodName}</span>
          <div className="text-xs text-muted-foreground">{p.startDate} — {p.endDate}</div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (p) => <StatusBadge status={toBadgeStatus(p.status)} />,
    },
    {
      header: "Run At",
      accessorKey: "runAt",
      cell: (p) => <span className="text-xs text-muted-foreground">{p.runAt ?? "—"}</span>,
    },
    {
      header: "",
      accessorKey: "id",
      cell: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => useAppStore.getState().openEngineeringDetail(p.id)}>
              View Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {/* TODO */}}>
              Compare with…
            </DropdownMenuItem>
            {p.status === "DRAFT" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFinaliseTarget(p)}>
                  <Lock size={12} className="mr-1" /> Finalise
                </DropdownMenuItem>
                <DropdownMenuItem className="text-rose-600" onClick={() => setDeleteTarget(p)}>
                  <Trash2 size={12} className="mr-1" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      <SubScreenHeader title="Period History" subtitle="All menu engineering analyses" icon={Clock} onBack={back} />

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-[150px] text-xs rounded-xl" />
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="FINALISED">Finalised</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ResponsiveDataList
          data={filtered}
          columns={columns}
          isLoading={isLoading}
          searchable
          searchPlaceholder="Search periods…"
          onRowClick={(p) => useAppStore.getState().openEngineeringDetail(p.id)}
          emptyMessage="No analyses found"
          emptyDescription="Create your first analysis to get started."
        />
      </div>

      {/* Modals */}
      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Analysis?"
        description={`This will permanently delete "${deleteTarget?.periodName ?? "this analysis"}". This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {finaliseTarget && (
        <FinalisePeriodModal
          open
          onClose={() => setFinaliseTarget(null)}
          onConfirm={handleFinalise}
          periodLabel={finaliseTarget.periodName ?? `Period #${finaliseTarget.id}`}
        />
      )}
    </div>
  );
}
