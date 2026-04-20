// StaffLaborPage.tsx — Live Staff Attendance & Table Assignments
import { useState, useMemo } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useEmployees } from "@/hooks/useLabor";
import { useActiveShifts, useClockInStaff, useClockOutStaff, useAllTableStaff } from "@/hooks/useTableStaff";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { KpiCard } from "@/components/shared/cards/KpiCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Users,
  Clock,
  UserX,
  Search,
  RefreshCw,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

interface StaffWithStatus {
  id: string;
  name: string;
  role: string;
  employeeType?: string;
  hourlyRate?: number | null;
  annualSalary?: number | null;
  active?: boolean;
  createdAt?: string;
  isClockedIn: boolean;
  clockInTime?: string;
  tables: string[];
}

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  MANAGER: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  GENERAL_MANAGER: "bg-violet-600/10 text-violet-700 border-violet-600/20",
  ASSISTANT_MANAGER: "bg-violet-400/10 text-violet-500 border-violet-400/20",
  FB_MANAGER: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  KITCHEN_MANAGER: "bg-orange-600/10 text-orange-700 border-orange-600/20",
  EXECUTIVE_CHEF: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  SOUS_CHEF: "bg-orange-400/10 text-orange-500 border-orange-400/20",
  CHEF_DE_PARTIE: "bg-orange-300/10 text-orange-400 border-orange-300/20",
  LINE_COOK: "bg-orange-200/10 text-orange-300 border-orange-200/20",
  PREP_COOK: "bg-slate-200/10 text-slate-400 border-slate-200/20",
  DISHWASHER: "bg-slate-300/10 text-slate-400 border-slate-300/20",
  MAITRE_D: "bg-cyan-600/10 text-cyan-700 border-cyan-600/20",
  HOST: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  BARTENDER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  BUSSER: "bg-slate-200/10 text-slate-400 border-slate-200/20",
  RUNNER: "bg-emerald-400/10 text-emerald-500 border-emerald-400/20",
  SENIOR_SERVER: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
  JUNIOR_SERVER: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

const SERVICE_ROLES = ["SENIOR_SERVER", "JUNIOR_SERVER", "HOST", "RUNNER", "BARTENDER", "MAITRE_D"];

function getRoleColor(role: string) {
  return ROLE_COLORS[role] || "border-slate-200 dark:border-white/10";
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", getRoleColor(role))}>
      {role.replace(/_/g, " ")}
    </Badge>
  );
}

function StaffCard({
  name,
  role,
  isClockedIn,
  clockInTime,
  tablesCount,
  onClockIn,
  onClockOut,
  isProcessing,
}: {
  name: string;
  role: string;
  isClockedIn: boolean;
  clockInTime?: string;
  tablesCount?: number;
  onClockIn: () => void;
  onClockOut: () => void;
  isProcessing: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="font-medium text-foreground">{name}</div>
          <RoleBadge role={role} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isClockedIn && (
          <>
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Clocked In
              </div>
              {clockInTime && (
                <div className="text-xs text-muted-foreground">
                  since {formatTime(clockInTime)}
                </div>
              )}
            </div>
            {tablesCount !== undefined && tablesCount > 0 && (
              <div className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                {tablesCount} table{tablesCount !== 1 ? "s" : ""}
              </div>
            )}
          </>
        )}

        {!isClockedIn && (
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <div className="w-2 h-2 bg-slate-400 rounded-full" />
            Off Duty
          </div>
        )}

        <div className="flex gap-1">
          {isClockedIn ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onClockOut}
              disabled={isProcessing}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Out
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onClockIn}
              disabled={isProcessing}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
            >
              <LogIn className="h-4 w-4 mr-1" />
              In
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StaffTableRow({
  name,
  role,
  isClockedIn,
  clockInTime,
  tableNumbers,
  onClockIn,
  onClockOut,
  isProcessing,
}: {
  name: string;
  role: string;
  isClockedIn: boolean;
  clockInTime?: string;
  tableNumbers?: string[];
  onClockIn: () => void;
  onClockOut: () => void;
  isProcessing: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <RoleBadge role={role} />
      </td>
      <td className="py-3 px-4">
        {isClockedIn ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-600 text-sm">{formatTime(clockInTime || "")}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {tableNumbers && tableNumbers.length > 0 ? (
          <div className="flex gap-1 flex-wrap">
            {tableNumbers.map((num, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded"
              >
                {num}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {isClockedIn ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onClockOut}
            disabled={isProcessing}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onClockIn}
            disabled={isProcessing}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <LogIn className="h-3.5 w-3.5" />
          </Button>
        )}
      </td>
    </tr>
  );
}

export default function StaffLaborPage() {
  const restaurantId = useRestaurantId();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"clocked-in" | "off-duty">("clocked-in");
  const [roleFilter, setRoleFilter] = useState("");

  const employees = useEmployees(restaurantId);
  const activeShifts = useActiveShifts(restaurantId);
  const tableStaff = useAllTableStaff(restaurantId);
  const clockIn = useClockInStaff(restaurantId);
  const clockOut = useClockOutStaff(restaurantId);

  // Build staff with clock-in status
  const staffWithStatus = useMemo(() => {
    if (!employees.data || !activeShifts.data) return [];

    const activeStaffMap = new Map<string, { staffId: string; clockInTime: string }>();
    activeShifts.data.forEach((s: any) => {
      activeStaffMap.set(String(s.staffId), { staffId: s.staffId, clockInTime: s.clockInTime });
    });

    const staffWithTables: Record<string, string[]> = {};
    if (tableStaff.data) {
      tableStaff.data.forEach((ts) => {
        if (!staffWithTables[ts.staffId]) {
          staffWithTables[ts.staffId] = [];
        }
        staffWithTables[ts.staffId].push(ts.tableNumber);
      });
    }

    return (employees.data || []).map((emp) => {
      const activeInfo = activeStaffMap.get(String(emp.id));
      return {
        id: emp.id,
        name: emp.staffName || emp.name || 'Unknown',
        role: emp.role || 'STAFF',
        employeeType: emp.employeeType,
        hourlyRate: emp.hourlyRate,
        annualSalary: emp.annualSalary,
        active: emp.active,
        createdAt: emp.createdAt,
        isClockedIn: !!activeInfo,
        clockInTime: activeInfo?.clockInTime,
        tables: staffWithTables[String(emp.id)] || [],
      } as StaffWithStatus;
    });
  }, [employees.data, activeShifts.data, tableStaff.data]);

  // Filter by role and search
  const filteredStaff = useMemo((): StaffWithStatus[] => {
    return staffWithStatus.filter((staff) => {
      // Role filter
      if (roleFilter && staff.role !== roleFilter) return false;

      // Active roles filter
      const showServiceOnly = !roleFilter;
      if (showServiceOnly && !SERVICE_ROLES.includes(staff.role)) return false;

      // Search filter
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !staff.name?.toLowerCase().includes(q) &&
          !staff.role?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Tab filter
      if (activeTab === "clocked-in") return staff.isClockedIn;
      return !staff.isClockedIn;
    });
  }, [staffWithStatus, searchQuery, activeTab, roleFilter]);

  const stats = useMemo(() => {
    const serviceStaff = staffWithStatus.filter((s) =>
      SERVICE_ROLES.includes(s.role)
    );
    return {
      total: serviceStaff.length,
      clockedIn: serviceStaff.filter((s) => s.isClockedIn).length,
      offDuty: serviceStaff.filter((s) => !s.isClockedIn).length,
    };
  }, [staffWithStatus]);

  const handleClockIn = (staffId: string) => {
    clockIn.mutate({ staffId });
  };

  const handleClockOut = (staffId: string) => {
    clockOut.mutate({ staffId });
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Staff & Labor"
        subtitle="Live attendance & table assignments"
        icon={Users}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            title="Service Staff"
            value={String(stats.total)}
            icon={Users}
            className="bg-white dark:bg-slate-900"
          />
          <KpiCard
            title="Clocked In"
            value={String(stats.clockedIn)}
            icon={Clock}
            className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/30"
          />
          <KpiCard
            title="Off Duty"
            value={String(stats.offDuty)}
            icon={UserX}
            className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/30"
          />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="">All Service Roles</option>
              {SERVICE_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                employees.refetch();
                activeShifts.refetch();
                tableStaff.refetch();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="clocked-in" className="gap-2">
              <Clock className="h-4 w-4" />
              Clocked In ({stats.clockedIn})
            </TabsTrigger>
            <TabsTrigger value="off-duty" className="gap-2">
              <UserX className="h-4 w-4" />
              Off Duty ({stats.offDuty})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clocked-in" className="mt-4">
            <Suspendable isLoading={employees.isLoading || activeShifts.isLoading}>
              {filteredStaff.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No staff currently clocked in
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStaff.map((staff) => (
                    <StaffCard
                      key={staff.id}
                      name={staff.name}
                      role={staff.role}
                      isClockedIn={staff.isClockedIn}
                      clockInTime={staff.clockInTime}
                      tablesCount={staff.tables.length}
                      onClockIn={() => handleClockIn(staff.id)}
                      onClockOut={() => handleClockOut(staff.id)}
                      isProcessing={clockIn.isPending || clockOut.isPending}
                    />
                  ))}
                </div>
              )}
            </Suspendable>
          </TabsContent>

          <TabsContent value="off-duty" className="mt-4">
            <Suspendable isLoading={employees.isLoading}>
              {filteredStaff.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No staff off duty
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStaff.map((staff) => (
                    <StaffCard
                      key={staff.id}
                      name={staff.name}
                      role={staff.role}
                      isClockedIn={staff.isClockedIn}
                      tablesCount={staff.tables.length}
                      onClockIn={() => handleClockIn(staff.id)}
                      onClockOut={() => handleClockOut(staff.id)}
                      isProcessing={clockIn.isPending || clockOut.isPending}
                    />
                  ))}
                </div>
              )}
            </Suspendable>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
