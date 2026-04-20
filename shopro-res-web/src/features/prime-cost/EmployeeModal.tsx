// SS5.6b — Employee Modal (Add/Edit with Hourly Rate)
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useRestaurantId } from "@/providers/RestaurantProvider";
import { useEmployees, useLaborMutations } from "@/hooks/useLabor";
import type { Employee, CreateEmployeeRequest } from "@/types";
import { DollarSign, UserPlus, Pencil } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null; // null for add, Employee for edit
}

export const EmployeeModal: React.FC<Props> = ({ isOpen, onClose, employee }) => {
  const restaurantId = useRestaurantId();
  const { createEmployee, updateEmployee, deactivateEmployee } = useLaborMutations(restaurantId);
  
  const [name, setName] = useState("");
  const [employeeType, setEmployeeType] = useState<"HOURLY" | "MANAGEMENT">("HOURLY");
  const [hourlyRate, setHourlyRate] = useState("");
  const [annualSalary, setAnnualSalary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const isEdit = !!employee;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setName(employee.name);
        setEmployeeType(employee.employeeType);
        setHourlyRate(employee.hourlyRate?.toString() ?? "");
        setAnnualSalary(employee.annualSalary?.toString() ?? "");
      } else {
        setName("");
        setEmployeeType("HOURLY");
        setHourlyRate("");
        setAnnualSalary("");
      }
      setShowDelete(false);
    }
  }, [isOpen, employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const req: CreateEmployeeRequest = {
        name: name.trim(),
        employeeType,
        hourlyRate: employeeType === "HOURLY" ? parseFloat(hourlyRate) || 0 : undefined,
        annualSalary: employeeType === "MANAGEMENT" ? parseFloat(annualSalary) || 0 : undefined,
      };

      if (isEdit && employee) {
        await updateEmployee.mutateAsync({ employeeId: employee.id, req });
      } else {
        await createEmployee.mutateAsync(req);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save employee:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!employee || !confirm(`Deactivate ${employee.name}? This cannot be undone.`)) return;
    try {
      await deactivateEmployee.mutateAsync(employee.id);
      onClose();
    } catch (err) {
      console.error("Failed to deactivate employee:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isEdit ? "Edit Employee" : "Add Employee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Smith"
              required
            />
          </div>

          {/* Employee Type */}
          <div className="space-y-2">
            <Label htmlFor="employeeType">Type</Label>
            <Select
              value={employeeType}
              onValueChange={(v) => setEmployeeType(v as "HOURLY" | "MANAGEMENT")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOURLY">Hourly</SelectItem>
                <SelectItem value="MANAGEMENT">Management (Salaried)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Hourly Rate - for HOURLY */}
          {employeeType === "HOURLY" && (
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                  required={employeeType === "HOURLY"}
                />
              </div>
            </div>
          )}

          {/* Annual Salary - for MANAGEMENT */}
          {employeeType === "MANAGEMENT" && (
            <div className="space-y-2">
              <Label htmlFor="annualSalary">Annual Salary *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="annualSalary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(e.target.value)}
                  placeholder="0.00"
                  className="pl-9"
                  required={employeeType === "MANAGEMENT"}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Update" : "Add Employee"}
              </Button>
            </div>
            
            {/* Deactivate button - only for edit mode */}
            {isEdit && employee && employee.active && (
              <div className="flex justify-center pt-2 border-t">
                {!showDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setShowDelete(true)}
                  >
                    Deactivate Employee
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-destructive">Confirm?</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDelete(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeactivate}
                      disabled={deactivateEmployee.isPending}
                    >
                      Yes, Deactivate
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
