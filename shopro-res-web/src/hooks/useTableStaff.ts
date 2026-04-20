// ─────────────────────────────────────────────────────────────
// hooks/useTableStaff.ts — React Query hooks for Table-Staff Mapping
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/tableStaff.api";

export const tableStaffKeys = {
  all: (rId: number) => ["tableStaff", rId] as const,
  byTable: (rId: number, tableId: number) => ["tableStaff", rId, "table", tableId] as const,
  byStaff: (rId: number, staffId: string) => ["tableStaff", rId, "staff", staffId] as const,
  byStaffList: (rId: number) => ["tableStaff", rId, "byStaff"] as const,
};

export function useAllTableStaff(restaurantId: number) {
  return useQuery({
    queryKey: tableStaffKeys.all(restaurantId),
    queryFn: () => api.getAllTableStaff(restaurantId),
    enabled: restaurantId > 0,
  });
}

export function useTableStaffByTable(restaurantId: number, tableId: number) {
  return useQuery({
    queryKey: tableStaffKeys.byTable(restaurantId, tableId),
    queryFn: () => api.getTableStaffByTable(restaurantId, tableId),
    enabled: restaurantId > 0 && tableId > 0,
  });
}

export function useTableStaffByStaff(restaurantId: number, staffId: string) {
  return useQuery({
    queryKey: tableStaffKeys.byStaff(restaurantId, staffId),
    queryFn: () => api.getTableStaffByStaff(restaurantId, staffId),
    enabled: restaurantId > 0 && !!staffId,
  });
}

export function useMappingsByStaff(restaurantId: number) {
  return useQuery({
    queryKey: tableStaffKeys.byStaffList(restaurantId),
    queryFn: () => api.getMappingsByStaff(restaurantId),
    enabled: restaurantId > 0,
  });
}

export function useAssignRandomStaff(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedBy?: string) => api.assignRandomStaff(restaurantId, assignedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableStaffKeys.all(restaurantId) });
      qc.invalidateQueries({ queryKey: tableStaffKeys.byStaffList(restaurantId) });
    },
  });
}

export function useReassignTable(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, newStaffId, reassignedBy }: {
      tableId: number;
      newStaffId: string;
      reassignedBy: string;
    }) => api.reassignTable(restaurantId, tableId, newStaffId, reassignedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableStaffKeys.all(restaurantId) });
      qc.invalidateQueries({ queryKey: tableStaffKeys.byStaffList(restaurantId) });
    },
  });
}

export function useUnassignStaff(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, staffId, unassignedBy }: {
      tableId: number;
      staffId: string;
      unassignedBy: string;
    }) => api.unassignStaff(restaurantId, tableId, staffId, unassignedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tableStaffKeys.all(restaurantId) });
      qc.invalidateQueries({ queryKey: tableStaffKeys.byStaffList(restaurantId) });
    },
  });
}

// Staff Active Shifts (for clocked-in status)
export function useActiveShifts(restaurantId: number) {
  return useQuery({
    queryKey: ["activeShifts", restaurantId],
    queryFn: () => api.getActiveShifts(restaurantId),
    enabled: restaurantId > 0,
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useClockInStaff(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, clockInTime }: { staffId: string; clockInTime?: string }) =>
      api.clockInStaff(restaurantId, staffId, clockInTime),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeShifts", restaurantId] });
    },
  });
}

export function useClockOutStaff(restaurantId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, clockOutTime }: { staffId: string; clockOutTime?: string }) =>
      api.clockOutStaff(restaurantId, staffId, clockOutTime),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeShifts", restaurantId] });
    },
  });
}
