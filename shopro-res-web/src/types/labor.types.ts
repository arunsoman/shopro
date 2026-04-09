// ─────────────────────────────────────────────────────────────
// labor.types.ts
// Sourced from: Employee, EmployeeLaborRecord, ScheduledShift
//               JPA entities + LaborService
// ─────────────────────────────────────────────────────────────

import type { EmployeeType, KitchenStationType } from "./enums.types";

// ── Employee ──────────────────────────────────────────────────

export interface Employee {
  id: number;
  restaurantId: number;
  name: string;
  employeeType: EmployeeType;
  hourlyRate: number | null;      // null for MANAGEMENT (salaried)
  annualSalary: number | null;    // null for HOURLY
  active: boolean;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  employeeType: EmployeeType;
  hourlyRate?: number;
  annualSalary?: number;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

// ── Labor Record (actual hours) ───────────────────────────────

export interface DailyHours {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface DailyCosts {
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface EmployeeLaborRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeType: EmployeeType;
  restaurantId: number;
  weekStartDate: string;
  hours: DailyHours;
  rateSnapshot: number | null;    // hourly rate at time of entry
  // DERIVED:
  totalHours: number;
  dailyCosts: DailyCosts;
  totalCost: number;
  hasOvertime: boolean;           // totalHours > 40
  overtimeHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyHoursRequest {
  hoursMon: number;
  hoursTue: number;
  hoursWed: number;
  hoursThu: number;
  hoursFri: number;
  hoursSat: number;
  hoursSun: number;
}

export interface UpsertWeeklyHoursRequest {
  weekStartDate: string;
  hours: DailyHours;
}

// ── Scheduled Shift ───────────────────────────────────────────

export interface ScheduledShift {
  id: number;
  employeeId: number;
  employeeName: string;
  restaurantId: number;
  shiftDate: string;              // yyyy-MM-dd
  startTime: string;              // HH:mm
  endTime: string;                // HH:mm
  station: KitchenStationType | null;
  notes: string | null;
  // DERIVED:
  scheduledHours: number;
  scheduledCost: number;          // scheduledHours × employee.hourlyRate
  createdAt: string;
}

export interface UpsertShiftRequest {
  employeeId: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  station?: KitchenStationType;
  notes?: string;
}

// ── Weekly Labor Summary ──────────────────────────────────────

export interface EmployeeWeekRow {
  employee: Employee;
  laborRecord: EmployeeLaborRecord | null;  // populated by hook transformation
  scheduledHours: number;
  actualHours: number;
  hoursDelta: number;
  scheduledCost: number;
  actualCost: number;
  costDelta: number;
  dailyHours: number[];
  dailyCosts: number[];
}

export interface WeeklyLaborSummary {
  weekStart: string;
  restaurantId: number;
  employees: EmployeeWeekRow[];
  totalMgmtCost: number;
  totalHourlyCost: number;
  totalScheduledCost: number;
  totalActualCost: number;
  totalLaborVariance: number;
  totalHours: number;
  totalCovers: number;
  laborCostPerCover: number;
  salesPerLaborHour: number;
  estimatedBenefitsCost: number;
  totalLaborCost: number;
}

// ── Schedule vs Actual ────────────────────────────────────────

export interface ScheduleVsActualRow {
  employee: Employee;
  scheduledHours: number;
  actualHours: number;
  hoursDelta: number;
  scheduledCost: number;
  actualCost: number;
  costDelta: number;
  favorable: boolean;             // actualCost < scheduledCost
}

export interface ScheduleVsActual {
  weekStart: string;
  rows: ScheduleVsActualRow[];
  totalScheduledHours: number;
  totalActualHours: number;
  totalScheduledCost: number;
  totalActualCost: number;
  totalVariance: number;
}

// ── Schedule summary (day view) ───────────────────────────────

export interface DayShiftSummary {
  date: string;
  dayOfWeek: string;
  shifts: ScheduledShift[];
  totalScheduledHours: number;
  totalScheduledCost: number;
  employeeCount: number;
}

export interface ScheduleSummary {
  weekStartDate: string;
  shifts: ScheduledShift[];
  totalScheduledHours: number;
  totalScheduledCost: number;
}

// ── List params ───────────────────────────────────────────────

export interface LaborWeekParams {
  restaurantId: number;
  weekStart: string;
}
