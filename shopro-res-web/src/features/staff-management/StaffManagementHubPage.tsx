// StaffManagementHubPage.tsx — Staff Management Hub with Navigation Cards
import { type FC } from "react";
import { useAppStore } from "@/App";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useEmployees } from "@/hooks/useLabor";
import { useActiveShifts } from "@/hooks/useTableStaff";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { HubHeader } from "@/components/shared/headers/HubHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { ErrorState } from "@/components/shared/states/ErrorState";
import { Users, Clock, UserCheck, UserX, Calendar, MapPin, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const KPICards: { id: string; title: string; icon: typeof Users; href: string; variant?: 'default' | 'success' | 'warning' | 'info' }[] = [
  { 
    id: "attendance", 
    title: "Staff Attendance", 
    icon: Calendar, 
    href: "labor-staffing",
    variant: "info" as const
  },
  { 
    id: "table-staff", 
    title: "Table ↔ Staff Mapping", 
    icon: MapPin, 
    href: "table-staff-map",
    variant: "default" as const
  },
];

const StaffManagementHubPage: FC = () => {
  const navigate = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();

  const employees = useEmployees(restaurantId);
  const activeShifts = useActiveShifts(restaurantId);

  const totalStaff = employees.data?.length ?? 0;
  const clockedIn = activeShifts.data?.length ?? 0;

  if (employees.isError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <ErrorState message="Failed to load staff data" onRetry={() => employees.refetch()} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 font-sans">
      <HubHeader
        title="Staff Management"
        subtitle="Team Overview"
        icon={BarChart3}
        loading={employees.isLoading}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-10 space-y-10">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Total Staff"
            value={String(totalStaff)}
            icon={Users}
            className="bg-white dark:bg-slate-900"
          />
          <KpiCard
            title="Clocked In"
            value={String(clockedIn)}
            icon={Clock}
            className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30"
          />
          <KpiCard
            title="Off Duty"
            value={String(Math.max(0, totalStaff - clockedIn))}
            icon={UserX}
            className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/30"
          />
        </div>

        {/* Navigation Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KPICards.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(card.href as any)}
                className={cn(
                  "flex items-center gap-4 p-6 rounded-2xl border transition-all duration-200",
                  "hover:shadow-lg hover:-translate-y-1",
                  card.variant === "success" 
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30 hover:border-green-300"
                    : card.variant === "info"
                    ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/30 hover:border-cyan-300"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 hover:border-primary/30"
                )}
              >
                <div className={cn(
                  "p-3 rounded-xl",
                  card.variant === "success" 
                    ? "bg-green-500/10"
                    : card.variant === "info"
                    ? "bg-cyan-500/10"
                    : "bg-primary/10"
                )}>
                  <card.icon className={cn(
                    "w-6 h-6",
                    card.variant === "success" 
                      ? "text-green-600"
                      : card.variant === "info"
                      ? "text-cyan-600"
                      : "text-primary"
                  )} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground">{card.title}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffManagementHubPage;
