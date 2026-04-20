// TableStaffMapPage.tsx — Table ↔ Staff Assignment Management
import { useState, useMemo } from "react";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import {
  useAllTableStaff,
  useMappingsByStaff,
  useAssignRandomStaff,
  useReassignTable,
  useUnassignStaff,
} from "@/hooks/useTableStaff";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Suspendable } from "@/components/shared/Suspendable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Table2,
  Users,
  Search,
  RefreshCw,
  Shuffle,
  Trash2,
  UserPlus,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ASSIGNMENT_COLORS: Record<string, string> = {
  PRIMARY: "bg-green-500/10 text-green-600 border-green-500/20",
  SECONDARY: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  SUPPORT: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

const ROLE_COLORS: Record<string, string> = {
  SENIOR_SERVER: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
  JUNIOR_SERVER: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  HOST: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  RUNNER: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  BARTENDER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  MAITRE_D: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

function getAssignmentColor(type: string) {
  return ASSIGNMENT_COLORS[type] || "border-slate-200";
}

function getRoleColor(role: string) {
  return ROLE_COLORS[role] || "border-slate-200";
}

function AssignmentBadge({ type }: { type: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", getAssignmentColor(type))}>
      {type}
    </Badge>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", getRoleColor(role))}>
      {role.replace(/_/g, " ")}
    </Badge>
  );
}

function TableStaffRow({
  tableNumber,
  tableId,
  primaryStaff,
  secondaryStaff,
  supportStaff,
  onUnassign,
  isProcessing,
}: {
  tableNumber: string;
  tableId: number;
  primaryStaff?: { name: string; staffId: string };
  secondaryStaff: { name: string; staffId: string }[];
  supportStaff: { name: string; staffId: string }[];
  onUnassign: (staffId: string) => void;
  isProcessing: boolean;
}) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Table2 className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{tableNumber}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        {primaryStaff ? (
          <div className="flex items-center gap-2">
            <span>{primaryStaff.name}</span>
            <AssignmentBadge type="PRIMARY" />
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-400 hover:text-red-600"
              onClick={() => onUnassign(primaryStaff.staffId)}
              disabled={isProcessing}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {secondaryStaff.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {secondaryStaff.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-sm">{s.name}</span>
                <AssignmentBadge type="SECONDARY" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-red-300 hover:text-red-500"
                  onClick={() => onUnassign(s.staffId)}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        {supportStaff.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {supportStaff.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-sm">{s.name}</span>
                <AssignmentBadge type="SUPPORT" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-red-300 hover:text-red-500"
                  onClick={() => onUnassign(s.staffId)}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <Button variant="outline" size="sm" className="gap-1">
          <UserPlus className="h-3 w-3" />
          Add
        </Button>
      </td>
    </tr>
  );
}

function StaffTableRow({
  staffName,
  staffId,
  role,
  tableCount,
  tableNumbers,
}: {
  staffName: string;
  staffId: string;
  role: string;
  tableCount: number;
  tableNumbers: string[];
}) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{staffName}</div>
            <div className="text-xs text-muted-foreground">ID: {String(staffId).slice(0, 8)}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <RoleBadge role={role} />
      </td>
      <td className="py-3 px-4">
        <span className="font-medium">{tableCount}</span>
      </td>
      <td className="py-3 px-4">
        {tableNumbers.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tableNumbers.map((num, i) => (
              <span key={i} className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded">
                {num}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </td>
    </tr>
  );
}

export default function TableStaffMapPage() {
  const restaurantId = useRestaurantId();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"tables" | "staff">("tables");

  const allMappings = useAllTableStaff(restaurantId);
  const staffMappings = useMappingsByStaff(restaurantId);
  const assignRandom = useAssignRandomStaff(restaurantId);
  const unassign = useUnassignStaff(restaurantId);

  // Group by table
  const tableGroups = useMemo(() => {
    if (!allMappings.data) return {};
    const groups: Record<
      number,
      {
        tableNumber: string;
        primary?: { name: string; staffId: string };
        secondary: { name: string; staffId: string }[];
        support: { name: string; staffId: string }[];
      }
    > = {};

    allMappings.data.forEach((m) => {
      if (!groups[m.tableId]) {
        groups[m.tableId] = {
          tableNumber: m.tableNumber,
          primary: undefined,
          secondary: [],
          support: [],
        };
      }
      if (m.assignmentType === "PRIMARY") {
        groups[m.tableId].primary = { name: m.staffName, staffId: m.staffId };
      } else if (m.assignmentType === "SECONDARY") {
        groups[m.tableId].secondary.push({ name: m.staffName, staffId: m.staffId });
      } else if (m.assignmentType === "SUPPORT") {
        groups[m.tableId].support.push({ name: m.staffName, staffId: m.staffId });
      }
    });
    return groups;
  }, [allMappings.data]);

  // Filter by search
  const filteredTableGroups = useMemo(() => {
    if (!searchQuery) return tableGroups;
    const q = searchQuery.toLowerCase();
    const filtered: typeof tableGroups = {};
    Object.entries(tableGroups).forEach(([tableId, data]) => {
      if (
        data.tableNumber.toLowerCase().includes(q) ||
        data.primary?.name.toLowerCase().includes(q) ||
        data.secondary.some((s) => s.name.toLowerCase().includes(q)) ||
        data.support.some((s) => s.name.toLowerCase().includes(q))
      ) {
        filtered[Number(tableId)] = data;
      }
    });
    return filtered;
  }, [tableGroups, searchQuery]);

  const filteredStaffMappings = useMemo(() => {
    if (!staffMappings.data) return [];
    if (!searchQuery) return staffMappings.data;
    const q = searchQuery.toLowerCase();
    return staffMappings.data.filter(
      (m) =>
        m.staffName.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q)
    );
  }, [staffMappings.data, searchQuery]);

  const handleAssignRandom = () => {
    assignRandom.mutate(undefined);
  };

  const handleUnassign = (tableId: number, staffId: string) => {
    unassign.mutate({ tableId, staffId, unassignedBy: "admin" });
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Table ↔ Staff Assignments"
        subtitle="Manage which staff serve which tables"
        icon={Table2}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search by ${viewMode === "tables" ? "table number or staff" : "staff name or role"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAssignRandom}
              disabled={assignRandom.isPending}
              className="gap-2"
            >
              <Shuffle className="h-4 w-4" />
              {assignRandom.isPending ? "Assigning..." : "Auto Assign"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                allMappings.refetch();
                staffMappings.refetch();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="tables" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Tables → Staff
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2">
              <List className="h-4 w-4" />
              Staff → Tables
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="mt-4">
            <Suspendable isLoading={allMappings.isLoading}>
              {Object.keys(filteredTableGroups).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? "No tables match your search"
                    : "No table assignments yet. Click 'Auto Assign' to assign staff to tables."}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <th className="py-3 px-4">Table</th>
                        <th className="py-3 px-4">Primary Server</th>
                        <th className="py-3 px-4">Secondary</th>
                        <th className="py-3 px-4">Support</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(filteredTableGroups).map(([tableId, data]) => (
                        <TableStaffRow
                          key={tableId}
                          tableId={Number(tableId)}
                          tableNumber={data.tableNumber}
                          primaryStaff={data.primary}
                          secondaryStaff={data.secondary}
                          supportStaff={data.support}
                          onUnassign={(staffId) => handleUnassign(Number(tableId), staffId)}
                          isProcessing={unassign.isPending}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Suspendable>
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <Suspendable isLoading={staffMappings.isLoading}>
              {filteredStaffMappings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? "No staff match your search"
                    : "No staff assignments yet. Click 'Auto Assign' to assign tables to staff."}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Tables</th>
                        <th className="py-3 px-4">Table Numbers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaffMappings.map((staff) => (
                        <StaffTableRow
                          key={staff.staffId}
                          staffId={staff.staffId}
                          staffName={staff.staffName}
                          role={staff.role}
                          tableCount={staff.tableCount}
                          tableNumbers={staff.assignments.map((a) => a.tableNumber)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Suspendable>
          </TabsContent>
        </Tabs>

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          {viewMode === "tables"
            ? `Showing ${Object.keys(filteredTableGroups).length} tables with ${allMappings.data?.length || 0} total assignments`
            : `Showing ${filteredStaffMappings.length} staff members`}
        </div>
      </div>
    </div>
  );
}
