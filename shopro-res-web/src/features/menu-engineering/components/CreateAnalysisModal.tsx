// ─────────────────────────────────────────────────────────────
// components/CreateAnalysisModal.tsx (ME.12)
// Quick-create modal for new analysis (shorter version of ME.1).
// BE: POST /periods only accepts periodName, startDate, endDate.
// costGroupId and popularityFactor are NOT accepted by the backend.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { DateRange } from "react-day-picker";
import { addDays, subDays, format } from "date-fns";
import { useCreatePeriod, useRunPeriod } from "../hooks/useMenuEngineering";
import { useRestaurantId } from "@/providers";
import type { CreatePeriodRequest, MenuEngineeringPeriod } from "@/types/menuEngineering.types";
import { Calendar, TrendingUp, Clock, CalendarDays } from "lucide-react";

interface CreateAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (periodId: number) => void;
}

export function CreateAnalysisModal({
  open,
  onClose,
  onCreated,
}: CreateAnalysisModalProps) {
  const restaurantId = useRestaurantId();
  const createPeriod = useCreatePeriod(restaurantId);
  const runAnalysisMut = useRunPeriod(restaurantId);

  const [periodName, setPeriodName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7), // Default to last 7 days (weekly)
    to: new Date(),
  });

  // Quick select presets
  const quickRanges: { label: string; days: number; icon: React.ReactNode }[] = [
    { label: "7 Days", days: 7, icon: <Calendar className="h-3 w-3" /> },
    { label: "30 Days", days: 30, icon: <TrendingUp className="h-3 w-3" /> },
    { label: "90 Days", days: 90, icon: <Clock className="h-3 w-3" /> },
    { label: "1 Year", days: 365, icon: <CalendarDays className="h-3 w-3" /> },
  ];

  const handleQuickSelect = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  const handleSubmit = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    // NOTE: BE createPeriod only accepts periodName, startDate, endDate.
    // costGroupId and popularityFactor are NOT part of the BE contract.
    const body: CreatePeriodRequest = {
      periodName: periodName || undefined,
      startDate: format(dateRange.from, "yyyy-MM-dd"),
      endDate:   format(dateRange.to,   "yyyy-MM-dd"),
    };

    // Type assertion: createAnalysis returns MenuEngineeringPeriod
    const period = (await createPeriod.mutateAsync(body)) as MenuEngineeringPeriod;
    await runAnalysisMut.mutateAsync(period.id);
    onCreated?.(period.id);
    onClose();
  };

  const isSubmitting = createPeriod.isPending || runAnalysisMut.isPending;

  return (
    <Modal open={open} onOpenChange={(v) => !v && onClose()}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>New Analysis</ModalTitle>
          <ModalDescription>Quick-create a menu engineering analysis cycle.</ModalDescription>
        </ModalHeader>

        <div className="space-y-4 py-2">
          {/* Period Name */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest">Period Name</Label>
            <Input
              value={periodName}
              onChange={(e) => setPeriodName(e.target.value)}
              placeholder={`Period ${format(new Date(), "yyyy-MM-dd")}`}
              className="h-10 rounded-xl"
            />
          </div>

          {/* Date Range */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest">Period</Label>
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
          </div>

          {/* Quick Select Presets */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest">Quick Select</Label>
            <div className="flex flex-wrap gap-2">
              {quickRanges.map((preset) => (
                <Button
                  key={preset.days}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(preset.days)}
                  className="text-xs"
                >
                  {preset.icon}
                  <span className="ml-1">{preset.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !dateRange?.from || !dateRange?.to}
            className="rounded-xl"
          >
            {isSubmitting ? "Creating…" : "Create & Run"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
