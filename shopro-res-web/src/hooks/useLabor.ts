// ─────────────────────────────────────────────────────────────
// hooks/useLabor.ts — React Query wrappers for LaborService
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/labor.api";
import type {
  UpsertWeeklyHoursRequest,
  UpsertShiftRequest,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from "../types";

export const laborKeys = {
  employees:       (rId: number)               => ["labor", rId, "employees"]         as const,
  weeklySummary:   (rId: number, ws: string)   => ["labor", rId, "summary", ws]       as const,
  shifts:          (rId: number, ws: string)   => ["labor", rId, "shifts", ws]        as const,
  scheduleSummary: (rId: number, ws: string)   => ["labor", rId, "schedule", ws]      as const,
  scheduleVsActual:(rId: number, ws: string)   => ["labor", rId, "sva", ws]           as const,
};

export function useEmployees(restaurantId: number) {
  return useQuery({
    queryKey: laborKeys.employees(restaurantId),
    queryFn:  () => api.listEmployees(restaurantId),
    enabled:  restaurantId > 0,
    staleTime: Infinity, // employees rarely change
  });
}

export function useWeeklyLaborSummary(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: laborKeys.weeklySummary(restaurantId, weekStart),
    queryFn: async () => {
      const resp = (await api.getWeeklyLaborSummary(restaurantId, weekStart)) as any;
      return {
        ...resp,
        weekStart: resp.weekStartDate || weekStart,
        employees: (resp.employees || []).map((row: any) => ({
          ...row,
          laborRecord: {
            hours: {
              mon: row.dailyHours?.[0] || 0,
              tue: row.dailyHours?.[1] || 0,
              wed: row.dailyHours?.[2] || 0,
              thu: row.dailyHours?.[3] || 0,
              fri: row.dailyHours?.[4] || 0,
              sat: row.dailyHours?.[5] || 0,
              sun: row.dailyHours?.[6] || 0,
            },
            dailyCosts: {
              mon: row.dailyCosts?.[0] || 0,
              tue: row.dailyCosts?.[1] || 0,
              wed: row.dailyCosts?.[2] || 0,
              thu: row.dailyCosts?.[3] || 0,
              fri: row.dailyCosts?.[4] || 0,
              sat: row.dailyCosts?.[5] || 0,
              sun: row.dailyCosts?.[6] || 0,
            }
          }
        }))
      };
    },
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 2 * 60 * 1000,
  });
}

export function useShifts(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: laborKeys.shifts(restaurantId, weekStart),
    queryFn:  () => api.listShifts(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 5 * 60 * 1000,
  });
}

export function useScheduleSummary(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: laborKeys.scheduleSummary(restaurantId, weekStart),
    queryFn:  () => api.getScheduleSummary(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 5 * 60 * 1000,
  });
}

export function useScheduleVsActual(restaurantId: number, weekStart: string) {
  return useQuery({
    queryKey: laborKeys.scheduleVsActual(restaurantId, weekStart),
    queryFn:  () => api.compareScheduleVsActual(restaurantId, weekStart),
    enabled:  restaurantId > 0 && !!weekStart,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Mutations ──────────────────────────────────────────────────

export function useLaborMutations(restaurantId: number) {
  const qc = useQueryClient();

  const invalidateWeek = (weekStart: string) => {
    qc.invalidateQueries({ queryKey: laborKeys.weeklySummary(restaurantId, weekStart) });
    qc.invalidateQueries({ queryKey: laborKeys.scheduleVsActual(restaurantId, weekStart) });
    // Also invalidate prime cost — labor feeds into it
    qc.invalidateQueries({ queryKey: ["prime-cost", restaurantId, "weekly", weekStart] });
    qc.invalidateQueries({ queryKey: ["prime-cost", restaurantId, "live"] });
  };

  const upsertHours = useMutation({
    mutationFn: ({ 
      employeeId, 
      req 
    }: { 
      employeeId: number; 
      req: UpsertWeeklyHoursRequest 
    }) =>
      api.upsertWeeklyHours(restaurantId, employeeId, req.weekStartDate, {
        hoursMon: req.hours.mon || 0,
        hoursTue: req.hours.tue || 0,
        hoursWed: req.hours.wed || 0,
        hoursThu: req.hours.thu || 0,
        hoursFri: req.hours.fri || 0,
        hoursSat: req.hours.sat || 0,
        hoursSun: req.hours.sun || 0,
      }),
    onSuccess: (_, { req }) => invalidateWeek(req.weekStartDate),
  });

  const upsertShift = useMutation({
    mutationFn: (req: UpsertShiftRequest) => api.upsertShift(restaurantId, req),
    onSuccess: (_, req) => {
      qc.invalidateQueries({ queryKey: laborKeys.shifts(restaurantId, req.shiftDate) });
      qc.invalidateQueries({ queryKey: laborKeys.scheduleSummary(restaurantId, req.shiftDate) });
    },
  });

  const deleteShift = useMutation({
    mutationFn: ({ shiftId, weekStart }: { shiftId: number; weekStart: string }) =>
      api.deleteShift(restaurantId, shiftId),
    onSuccess: (_, { weekStart }) => {
      qc.invalidateQueries({ queryKey: laborKeys.shifts(restaurantId, weekStart) });
      qc.invalidateQueries({ queryKey: laborKeys.scheduleSummary(restaurantId, weekStart) });
    },
  });

  const createEmployee = useMutation({
    mutationFn: (req: CreateEmployeeRequest) => api.createEmployee(restaurantId, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: laborKeys.employees(restaurantId) }),
  });

  const updateEmployee = useMutation({
    mutationFn: ({ employeeId, req }: { employeeId: number; req: UpdateEmployeeRequest }) =>
      api.updateEmployee(restaurantId, employeeId, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: laborKeys.employees(restaurantId) }),
  });

  const deactivateEmployee = useMutation({
    mutationFn: (employeeId: number) => api.deactivateEmployee(restaurantId, employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: laborKeys.employees(restaurantId) }),
  });

  return { upsertHours, upsertShift, deleteShift, createEmployee, updateEmployee, deactivateEmployee };
}
