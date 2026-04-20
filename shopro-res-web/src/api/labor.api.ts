// ─────────────────────────────────────────────────────────────
// api/labor.api.ts — LaborService endpoints (Restaurant-Scoped)
// ─────────────────────────────────────────────────────────────

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type {
  Employee,
  WeeklyLaborSummary,
  ScheduleSummary,
  ScheduleVsActual,
  WeeklyHoursRequest, // use backend-compatible request
  UpsertShiftRequest,
  ScheduledShift,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "../types";

const BASE = "/restaurants";

// Handle UUID string conversion
function toUuid(id: string | number): string {
  return String(id);
}

export const listEmployees = (restaurantId: number): Promise<Employee[]> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/labor/employees`);

export const createEmployee = (restaurantId: number, req: CreateEmployeeRequest): Promise<Employee> =>
  apiPost(`${BASE}/${restaurantId}/prime-cost/labor/employees`, req);

export const updateEmployee = (restaurantId: number, employeeId: string | number, req: UpdateEmployeeRequest): Promise<Employee> =>
  apiPut(`${BASE}/${restaurantId}/prime-cost/labor/employees/${toUuid(employeeId)}`, req);

export const getEmployee = (restaurantId: number, employeeId: string | number): Promise<Employee> =>
  apiGet(`${BASE}/${restaurantId}/prime-cost/labor/employees/${toUuid(employeeId)}`);

export const deactivateEmployee = (restaurantId: number, employeeId: number): Promise<void> =>
  apiPost(`${BASE}/${restaurantId}/labor/employees/${employeeId}/deactivate`);

export const getWeeklyLaborSummary = (restaurantId: number, weekStart: string): Promise<WeeklyLaborSummary> =>
  apiGet(`${BASE}/${restaurantId}/labor/weekly-summary?weekStart=${weekStart}`);

export const upsertWeeklyHours = (
  restaurantId: number,
  employeeId: number,
  weekStart: string,
  req: WeeklyHoursRequest, // transformed in hook
): Promise<void> =>
  apiPost(`${BASE}/${restaurantId}/labor/employees/${employeeId}/hours?weekStart=${weekStart}`, req);

export const listShifts = (restaurantId: number, weekStart: string): Promise<ScheduledShift[]> =>
  apiGet(`${BASE}/${restaurantId}/labor/schedule?weekStart=${weekStart}`).then((d: any) => (d as ScheduleSummary).shifts || []);

export const upsertShift = (restaurantId: number, req: UpsertShiftRequest): Promise<ScheduledShift> =>
  apiPost(`${BASE}/${restaurantId}/labor/shifts`, req);

export const deleteShift = (restaurantId: number, shiftId: number): Promise<void> =>
  apiDelete(`${BASE}/${restaurantId}/labor/shifts/${shiftId}`);

export const getScheduleSummary = (restaurantId: number, weekStart: string): Promise<ScheduleSummary> =>
  apiGet<ScheduleSummary>(`${BASE}/${restaurantId}/labor/schedule?weekStart=${weekStart}`);

export const compareScheduleVsActual = (restaurantId: number, weekStart: string): Promise<ScheduleVsActual> =>
  apiGet<ScheduleVsActual>(`${BASE}/${restaurantId}/labor/variance?weekStart=${weekStart}`);

export interface ClockedInShift {
  id: string;
  staff: {
    staffId: string;
    displayName: string;
    role?: string;
    hourlyRate?: number;
  };
  clockIn: string;
  clockOut?: string;
  isActive: boolean;
  durationMinutes?: number;
  totalCost?: number;
}

export const getClockedInStaff = (restaurantId: number): Promise<ClockedInShift[]> =>
  apiGet(`${BASE}/${restaurantId}/labor/clocked-in`);

export const getActualLabor = (restaurantId: number, weekStart: string): Promise<ClockedInShift[]> =>
  apiGet(`${BASE}/${restaurantId}/labor/actual-labor?weekStart=${weekStart}`);
