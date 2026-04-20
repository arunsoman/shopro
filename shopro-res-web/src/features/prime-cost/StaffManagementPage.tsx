// SS5 — Staff Management Landing Page (Read-only - hours calculated from clock-in/clock-out)
import React, { useState, useMemo, type FC } from "react";
import { format, parseISO, addWeeks, startOfWeek, addDays } from "date-fns";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useEmployees, useWeeklyLaborSummary, useClockedInStaff, useLaborMutations } from "@/hooks/useLabor";
import { useAppStore } from "@/App";
import { SubScreenHeader } from "@/components/shared/headers/SubScreenHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Users, ChevronLeft, ChevronRight, UserPlus, Pencil, Trash2, DollarSign, Shield, Activity, Search, Clock, Calendar } from "lucide-react";
import { cn, currency } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider";
import type { Employee, CreateEmployeeRequest } from "@/types";

// Date helpers
function getWeekStart() { return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"); }
function weekLabel(ws: string) {
  const d = parseISO(ws);
  return `${format(d, "MMM d")} – ${format(addDays(d, 6), "MMM d, yyyy")}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Tab = "staff" | "hours" | "clocked";

type EmployeeFormData = {
  name: string;
  role: string;
  hourlyRate: string;
};

// KPI Pill
function KpiPill({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-4 flex-1 min-w-[130px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">{label}</p>
      <p className={cn("text-base font-bold font-mono tabular-nums", accent)}>{value}</p>
    </div>
  );
}

const StaffManagementPage: FC = () => {
  const navigate = useAppStore(s => s.navigate);
  const restaurantId = useRestaurantId();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>("staff");
  const [weekStart, setWeekStart] = useState(getWeekStart);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [staffForm, setStaffForm] = useState<EmployeeFormData>({
    name: "",
    role: "",
    hourlyRate: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const employees = useEmployees(restaurantId);
  const clockedIn = useClockedInStaff(restaurantId);
  const summary = useWeeklyLaborSummary(restaurantId, weekStart);
  const { createEmployee, deactivateEmployee } = useLaborMutations(restaurantId);

  // Transform weekly summary data for the hours table
  const laborByStaff = useMemo(() => {
    const staffList = summary.data?.staffList || [];
    return staffList.map((row: any) => ({
      staffId: row.staffId,
      name: row.staff?.staffName || "Unknown",
      role: row.staff?.role || "STAFF",
      hourlyRate: row.staff?.hourlyRate || 0,
      totalMinutes: (row.totalHours || 0) * 60,
      totalCost: row.totalCost || 0,
      dailyHours: row.dailyHours || [],
      dailyCosts: row.dailyCosts || [],
    }));
  }, [summary.data]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalHours: summary.data?.totalHours || 0,
      totalCost: (summary.data?.totalHourlyLaborCost || 0) + (summary.data?.totalManagementLaborCost || 0),
    };
  }, [summary.data]);

  const filteredEmployees = (employees.data || []).filter(emp => {
    const matchesSearch = !searchQuery || emp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const roles = useMemo(() => {
    const r = new Set((employees.data || []).map(e => e.role).filter(Boolean));
    return Array.from(r);
  }, [employees.data]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim()) {
      toast.error("Please enter a staff name");
      return;
    }

    try {
      const req: CreateEmployeeRequest = {
        name: staffForm.name.trim(),
        employeeType: "HOURLY", // Default to HOURLY since role and type are the same
        hourlyRate: parseFloat(staffForm.hourlyRate) || 0,
      };

      await createEmployee.mutateAsync(req);
      toast.success(`${staffForm.name} has been added`);
      setStaffForm({ name: "", role: "", hourlyRate: "" });
      setEmployeeModalOpen(false);
    } catch (err) {
      toast.error("Failed to add staff");
    }
  };

  const handleDeactivate = async (emp: Employee) => {
    if (!confirm(`Deactivate ${emp.name}?`)) return;
    try {
      await deactivateEmployee.mutateAsync(emp.id);
      toast.success(`${emp.name} has been deactivated`);
    } catch (err) {
      toast.error("Failed to deactivate staff");
    }
  };

  const formatMinutes = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="absolute inset-0 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
      <SubScreenHeader
        title="Staff Management"
        subtitle="Onboarding, Roles & Labor"
        icon={Users}
        onBack={() => navigate("prime-cost")}
      >
        {tab !== "staff" && (
          <>
            <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), -1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10">
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs font-bold text-foreground min-w-[120px] text-center tabular-nums">{weekLabel(weekStart)}</span>
            <Button variant="outline" size="icon" onClick={() => setWeekStart(w => format(addWeeks(parseISO(w), 1), "yyyy-MM-dd"))} className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10 mr-2">
              <ChevronRight size={14} />
            </Button>
          </>
        )}
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => { setSelectedEmployee(null); setStaffForm({ name: "", role: "", hourlyRate: "" }); setEmployeeModalOpen(true); }} 
          className="rounded-xl h-8 gap-1.5"
        >
          <UserPlus size={14} />
          Add Staff
        </Button>
      </SubScreenHeader>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 px-6 shrink-0">
        {(["staff", "clocked", "hours"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "py-3 px-4 text-xs font-bold border-b-2 transition-colors",
              tab === t
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "staff" ? "Staff List" : t === "clocked" ? "Clocked In" : "Hours & Cost"}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6 sm:p-8 no-scrollbar space-y-6">
        {/* Loading state */}
        {employees.isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading staff...</p>
          </div>
        )}

        {/* Staff List Tab */}
        {tab === "staff" && !employees.isLoading && (
          <>
            <div className="flex gap-3 flex-wrap">
              <KpiPill label="Total Staff" value={`${(employees.data || []).length}`} />
              <KpiPill label="Active" value={`${(employees.data || []).filter(e => e.active).length}`} accent="text-emerald-600" />
              <KpiPill label="Clocked In" value={`${(clockedIn.data || []).length}`} accent="text-blue-600" />
              <KpiPill label="Avg Hourly" value={currency((employees.data || []).reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / (employees.data?.length || 1))} accent="text-amber-600" />
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter || "all"} onValueChange={(v) => setRoleFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEmployees.map(emp => (
                <Card key={emp.id} className={cn("hover:shadow-md transition-shadow", !emp.active && "opacity-60")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm font-bold border border-amber-500/20">
                          {(emp.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-base">{emp.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">{emp.role}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedEmployee(emp); setStaffForm({ name: emp.name, role: emp.role, hourlyRate: emp.hourlyRate?.toString() || "" }); setEmployeeModalOpen(true); }}>
                          <Pencil size={14} />
                        </Button>
                        {emp.active && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeactivate(emp)}>
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <DollarSign size={14} /> Hourly Rate
                      </span>
                      <span className="font-mono font-medium">
                        {emp.hourlyRate ? currency(emp.hourlyRate) : "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Activity size={14} /> Status
                      </span>
                      <Badge variant={emp.active ? "default" : "secondary"}>
                        {emp.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No staff found</p>
                  <p className="text-sm">Click "Add Staff" to get started</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Hours & Cost Tab - READ ONLY - calculated from clock-in/clock-out */}
        {tab === "hours" && (
          <>
            <div className="flex gap-3 flex-wrap">
              <KpiPill label="Total Hours" value={`${totals.totalHours.toFixed(1)} hrs`} accent="text-blue-600" />
              <KpiPill label="Total Labor Cost" value={currency(totals.totalCost)} accent="text-amber-600" />
              <KpiPill label="Active Staff" value={`${laborByStaff.length}`} />
              <KpiPill label="Est. Benefits" value={currency(summary.data?.estimatedBenefitsCost || 0)} />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Weekly Hours (Calculated from Clock-In/Clock-Out)
                </h3>
                <span className="text-xs text-muted-foreground">{weekLabel(weekStart)}</span>
              </div>
              
              {summary.isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading labor data...</p>
                </div>
              ) : laborByStaff.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No clock-in/clock-out data</p>
                  <p className="text-sm">Staff need to clock in/out to generate hours</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Employee</th>
                        <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Role</th>
                        {DAY_LABELS.map(d => (
                          <th key={d} className="text-right px-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{d}</th>
                        ))}
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Total</th>
                        <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {laborByStaff.map(staff => {
                        const totalHours = staff.totalMinutes / 60;
                        return (
                          <tr key={staff.staffId} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{staff.name}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground/60">{staff.role}</td>
                            {DAY_LABELS.map((day, idx) => {
                              const hours = staff.dailyHours[idx] || 0;
                              return (
                                <td key={day} className="px-2 py-3 text-right font-mono tabular-nums text-xs">
                                  {hours > 0 ? `${hours.toFixed(1)}h` : "—"}
                                </td>
                              );
                            })}
                            <td className={cn("px-4 py-3 text-right font-mono tabular-nums font-bold", totalHours > 40 ? "text-rose-600" : "text-foreground")}>
                              {totalHours.toFixed(1)}h
                            </td>
                            <td className="px-4 py-3 text-right font-mono tabular-nums text-amber-600 font-medium">
                              {currency(staff.totalCost)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 dark:bg-black/20 font-bold">
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-right">TOTAL</td>
                        {DAY_LABELS.map((day, idx) => {
                          const dayTotal = laborByStaff.reduce((sum, s) => sum + (s.dailyHours[idx] || 0), 0);
                          return (
                            <td key={day} className="px-2 py-3 text-right font-mono tabular-nums text-xs">
                              {dayTotal > 0 ? `${dayTotal.toFixed(1)}h` : "—"}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-right font-mono tabular-nums">{totals.totalHours.toFixed(1)}h</td>
                        <td className="px-4 py-3 text-right font-mono tabular-nums text-amber-600">{currency(totals.totalCost)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Clocked In Tab */}
        {tab === "clocked" && (
          <>
            <div className="flex gap-3 flex-wrap">
              <KpiPill 
                label="Currently Clocked In" 
                value={`${(clockedIn.data || []).length}`} 
                accent="text-emerald-600" 
              />
              <KpiPill 
                label="Active Staff" 
                value={`${(employees.data || []).filter(e => e.active).length}`} 
              />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Currently On Shift
                </h3>
              </div>
              
              {clockedIn.isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (clockedIn.data || []).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No staff currently clocked in</p>
                  <p className="text-sm">Staff can clock in from the POS screen</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {(clockedIn.data || []).map((shift: any) => (
                    <div key={shift.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm font-bold border border-emerald-500/20">
                          {(shift.staff?.displayName || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{shift.staff?.displayName || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">
                            Clocked in: {shift.clockIn ? format(parseISO(shift.clockIn), "h:mm a") : "--"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        <Activity className="h-3 w-3 mr-1" />
                        On Shift
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Add/Edit Staff Modal */}
      <Dialog open={employeeModalOpen} onOpenChange={setEmployeeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? "Edit Staff" : "Add New Staff"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={staffForm.name}
                onChange={(e) => setStaffForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. John Smith"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={staffForm.role} onValueChange={(v) => setStaffForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVER">Server</SelectItem>
                  <SelectItem value="LINE_COOK">Line Cook</SelectItem>
                  <SelectItem value="PREP_COOK">Prep Cook</SelectItem>
                  <SelectItem value="DISHWASHER">Dishwasher</SelectItem>
                  <SelectItem value="HOST">Host</SelectItem>
                  <SelectItem value="BARTENDER">Bartender</SelectItem>
                  <SelectItem value="BUSSER">Busser</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="GENERAL_MANAGER">General Manager</SelectItem>
                  <SelectItem value="EXECUTIVE_CHEF">Executive Chef</SelectItem>
                  <SelectItem value="SOUS_CHEF">Sous Chef</SelectItem>
                  <SelectItem value="KITCHEN_MANAGER">Kitchen Manager</SelectItem>
                  <SelectItem value="FB_MANAGER">F&B Manager</SelectItem>
                  <SelectItem value="OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={staffForm.hourlyRate}
                  onChange={(e) => setStaffForm(f => ({ ...f, hourlyRate: e.target.value }))}
                  placeholder="0.00"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEmployeeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? "Saving..." : selectedEmployee ? "Update" : "Add Staff"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagementPage;
