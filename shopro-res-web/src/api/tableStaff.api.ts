// ─────────────────────────────────────────────────────────────
// api/tableStaff.api.ts — Table-Staff Assignment API
// ─────────────────────────────────────────────────────────────

import { apiGet, apiPost, apiPut, apiDelete } from "./client";

const BASE = "/restaurants";

// Types
export interface TableStaffMapResponse {
  id: number;
  tableId: number;
  tableNumber: string;
  staffId: string;
  staffName: string;
  staffRole: string;
  assignmentType: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
}

export interface StaffTableMappingResponse {
  staffId: string;
  staffName: string;
  role: string;
  tableCount: number;
  assignments: TableStaffSummaryResponse[];
}

export interface TableStaffSummaryResponse {
  id: number;
  tableId: number;
  tableNumber: string;
  assignmentType: string;
  assignedAt: string;
  isActive: boolean;
}

export interface AssignRandomResponse {
  restaurantId: number;
  assignedCount: number;
  assignments: TableStaffSummaryResponse[];
}

// API Functions
export const getAllTableStaff = (restaurantId: number): Promise<TableStaffMapResponse[]> =>
  apiGet(`${BASE}/${restaurantId}/table-staff`);

export const getTableStaffByTable = (restaurantId: number, tableId: number): Promise<TableStaffMapResponse[]> =>
  apiGet(`${BASE}/${restaurantId}/table-staff/table/${tableId}`);

export const getTableStaffByStaff = (restaurantId: number, staffId: string): Promise<StaffTableMappingResponse> =>
  apiGet(`${BASE}/${restaurantId}/table-staff/staff/${staffId}`);

export const getMappingsByStaff = (restaurantId: number): Promise<StaffTableMappingResponse[]> =>
  apiGet(`${BASE}/${restaurantId}/table-staff/by-staff`);

export const assignRandomStaff = (restaurantId: number, assignedBy?: string): Promise<AssignRandomResponse> => {
  const url = assignedBy
    ? `${BASE}/${restaurantId}/table-staff/assign-random?assignedBy=${assignedBy}`
    : `${BASE}/${restaurantId}/table-staff/assign-random`;
  return apiPost(url, {});
};

export const reassignTable = (
  restaurantId: number,
  tableId: number,
  newStaffId: string,
  reassignedBy: string
): Promise<TableStaffMapResponse> =>
  apiPut(`${BASE}/${restaurantId}/table-staff/table/${tableId}/reassign`, {
    newStaffId,
    reassignedBy,
  });

export const unassignStaff = (
  restaurantId: number,
  tableId: number,
  staffId: string,
  unassignedBy: string
): Promise<void> =>
  apiDelete(
    `${BASE}/${restaurantId}/table-staff/table/${tableId}/staff/${staffId}/unassign?unassignedBy=${unassignedBy}`
  );

// Staff Clock In/Out API
export const clockInStaff = (restaurantId: number, staffId: string, clockInTime?: string): Promise<any> => {
  const params = clockInTime ? `?clockInTime=${clockInTime}` : "";
  return apiPost(`${BASE}/${restaurantId}/prime-cost/labor/employees/${staffId}/clock-in${params}`, {});
};

export const clockOutStaff = (restaurantId: number, staffId: string, clockOutTime?: string): Promise<any> => {
  const params = clockOutTime ? `?clockOutTime=${clockOutTime}` : "";
  return apiPost(`${BASE}/${restaurantId}/prime-cost/labor/employees/${staffId}/clock-out${params}`, {});
};

export const getActiveShifts = (restaurantId: number): Promise<any[]> =>
  apiGet(`${BASE}/${restaurantId}/staff/shifts/active`);
