// ─────────────────────────────────────────────────────────────
// pages/PeriodSetupPage.tsx (ME.1)
// Multi-step wizard to create a new analysis period.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { PlusCircle, Play, Calendar, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { StepRail, type Step } from "@/components/ui/StepRail";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { Button } from "@/components/ui/Button";
import { useCreatePeriod, useRunPeriod } from "../hooks/useMenuEngineering";
import { useAppStore } from "@/App";
import { useRestaurantId } from "@/providers";
import type { CreatePeriodRequest } from "@/types/menuEngineering.types";
import type { DateRange } from "react-day-picker";
import { subDays, format } from "date-fns";
import { toast } from "sonner";

const STEPS: Step[] = [
  { id: "period", label: "Define Period", description: "Set dates and scope", status: "current" as const },
  { id: "config", label: "Configure", description: "Exclusions & thresholds", status: "upcoming" as const },
  { id: "review", label: "Review & Run", description: "Confirm and execute", status: "upcoming" as const },
];

interface PeriodSetupPageProps {
  onBack?: () => void;
}

export default function PeriodSetupPage({ onBack }: PeriodSetupPageProps) {
  const restaurantId = useRestaurantId();
  const back = useAppStore((s) => s.back);
  const createMutation = useCreatePeriod(restaurantId);
  const runMutation = useRunPeriod(restaurantId);
  const [step, setStep] = useState(0);
  const [periodName, setPeriodName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Quick select presets
  const quickRanges: { label: string; days: number; icon: React.ReactNode }[] = [
    { label: "Week", days: 7, icon: <Calendar className="h-3 w-3" /> },
    { label: "Month", days: 30, icon: <TrendingUp className="h-3 w-3" /> },
    { label: "Quarter", days: 90, icon: <Clock className="h-3 w-3" /> },
    { label: "Year", days: 365, icon: <CalendarDays className="h-3 w-3" /> },
  ];

  const handleQuickSelect = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  const updatedSteps: Step[] = STEPS.map((s, i) => ({
    ...s,
    status: i < step ? "complete" as const : i === step ? "current" as const : "upcoming" as const,
  }));

  const canProceed = dateRange?.from && dateRange?.to;
  const isCreating = createMutation.isPending || runMutation.isPending;

  const handleProceed = () => {
    if (step === 0 && !canProceed) return;
    setStep((s) => s + 1);
  };

  const handleCreate = async () => {
    const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
    const endDate   = dateRange?.to   ? format(dateRange.to,   "yyyy-MM-dd") : undefined;
    if (!startDate || !endDate) return;

    const body: CreatePeriodRequest = {
      periodName: periodName || `Period ${format(new Date(), "yyyy-MM-dd")}`,
      startDate,
      endDate,
    };

    try {
      const period = await createMutation.mutateAsync(body);
      toast.success("Analysis created. Running…");
      await runMutation.mutateAsync(period.id);
      toast.success("Analysis complete!");
      void useAppStore.getState().openEngineeringDetail(period.id);
    } catch {
      toast.error("Failed to run analysis");
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
      <SubScreenHeader
        title="New Analysis"
        subtitle="Create a menu engineering analysis cycle"
        icon={PlusCircle}
        onBack={onBack ?? back}
      />

      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-2xl mx-auto w-full space-y-8">
        <StepRail steps={updatedSteps} orientation="horizontal" />

        {/* Step 1: Define Period */}
        {step === 0 && (
          <Card className="p-6 space-y-5">
            <h3 className="text-base font-bold text-foreground">Define Period</h3>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Period Name</Label>
              <Input
                value={periodName}
                onChange={(e) => setPeriodName(e.target.value)}
                placeholder={`Period ${format(new Date(), "yyyy-MM-dd")}`}
                className="h-10 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">Optional. Defaults to "Period yyyy-MM-dd".</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest">Date Range</Label>
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
              <p className="text-[10px] text-muted-foreground">Minimum 7 days, maximum 12 months.</p>
            </div>
            
            {/* Quick Select */}
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
                    className="text-xs gap-1"
                  >
                    {preset.icon}
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleProceed}
                disabled={!canProceed}
                className="rounded-xl"
              >
                Next: Configure →
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Configure */}
        {step === 1 && (
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">Configure</h3>
            <p className="text-sm text-muted-foreground">
              Popularity thresholds and cost settings are managed in <strong>Engineering Settings</strong>.
              You can adjust them after the first analysis.
            </p>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(0)} className="rounded-xl">
                ← Back
              </Button>
              <Button onClick={handleProceed} className="rounded-xl">
                Next: Review →
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Review & Run */}
        {step === 2 && (
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground">Review & Run</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">
                  {periodName || `Period ${format(new Date(), "yyyy-MM-dd")}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">
                  {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">
                  {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "—"}
                </span>
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl">
                ← Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="rounded-xl gap-2"
              >
                <Play size={14} />
                {isCreating ? "Running…" : "Run Analysis"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
