import { apiClient } from "@/lib/api/client";
import type {
    SectionResponse,
    CreateSectionInput,
    TableShapeResponse,
    CreateTableShapeInput,
    WaitlistEntryResponse,
    CreateWaitlistEntryInput,
    ReservationResponse,
    CreateReservationInput,
} from "../schema/floorSchema";

// --- Sections ---
export const sectionsApi = {
    getAll: async (): Promise<SectionResponse[]> => {
        const res = await apiClient.get("/floor-plan/sections");
        return res.data;
    },
    create: async (data: CreateSectionInput): Promise<SectionResponse> => {
        const res = await apiClient.post("/floor-plan/sections", data);
        return res.data;
    },
};

// --- Tables ---
export const tablesApi = {
    getAll: async (): Promise<TableShapeResponse[]> => {
        const res = await apiClient.get("/floor-plan/tables");
        return res.data;
    },
    create: async (data: CreateTableShapeInput): Promise<TableShapeResponse> => {
        const res = await apiClient.post("/floor-plan/tables", data);
        return res.data;
    },
    update: async (id: string, data: CreateTableShapeInput): Promise<TableShapeResponse> => {
        const res = await apiClient.put(`/floor-plan/tables/${id}`, data);
        return res.data;
    },
    updateStatus: async (id: string, status: string): Promise<TableShapeResponse> => {
        const res = await apiClient.patch(`/floor-plan/tables/${id}/status`, { status });
        return res.data;
    },
    updatePosition: async (id: string, posX: number, posY: number): Promise<TableShapeResponse> => {
        const res = await apiClient.patch(`/floor-plan/tables/${id}/position`, { posX, posY });
        return res.data;
    },
    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/floor-plan/tables/${id}`);
    },
};

// --- Waitlist ---
export const waitlistApi = {
    getActive: async (): Promise<WaitlistEntryResponse[]> => {
        const res = await apiClient.get("/waitlist");
        return res.data;
    },
    add: async (data: CreateWaitlistEntryInput): Promise<WaitlistEntryResponse> => {
        const res = await apiClient.post("/waitlist", data);
        return res.data;
    },
    notify: async (id: string): Promise<WaitlistEntryResponse> => {
        const res = await apiClient.post(`/waitlist/${id}/notify`);
        return res.data;
    },
    remove: async (id: string): Promise<void> => {
        await apiClient.delete(`/waitlist/${id}`);
    },
    seatParty: async (tableId: string, waitlistEntryId: string): Promise<TableShapeResponse> => {
        const res = await apiClient.post(`/waitlist/tables/${tableId}/seat?waitlistEntryId=${waitlistEntryId}`);
        return res.data;
    },
    markClean: async (tableId: string): Promise<TableShapeResponse> => {
        const res = await apiClient.post(`/waitlist/tables/${tableId}/clean`);
        return res.data;
    },
};

// --- Reservations ---
export const reservationsApi = {
    getForTable: async (tableId: string): Promise<ReservationResponse[]> => {
        const res = await apiClient.get(`/reservations/tables/${tableId}`);
        return res.data;
    },
    create: async (data: CreateReservationInput): Promise<ReservationResponse> => {
        const res = await apiClient.post("/reservations", data);
        return res.data;
    },
    cancel: async (id: string, reason: string): Promise<ReservationResponse> => {
        const res = await apiClient.delete(`/reservations/${id}?reason=${encodeURIComponent(reason)}`);
        return res.data;
    },
};
