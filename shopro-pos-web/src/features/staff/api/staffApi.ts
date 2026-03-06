import { apiClient } from "@/lib/api/client";
import type { CreateStaffRequest, StaffMemberResponse } from "../schema/staffSchema";

export const staffApi = {
    getAll: async (role?: string): Promise<StaffMemberResponse[]> => {
        const params = role ? `?role=${role}` : "";
        const res = await apiClient.get(`/staff${params}`);
        return res.data;
    },
    getById: async (id: string): Promise<StaffMemberResponse> => {
        const res = await apiClient.get(`/staff/${id}`);
        return res.data;
    },
    create: async (data: CreateStaffRequest): Promise<StaffMemberResponse> => {
        const res = await apiClient.post("/staff", data);
        return res.data;
    },
    updateRole: async (id: string, role: string): Promise<StaffMemberResponse> => {
        const res = await apiClient.patch(`/staff/${id}/role`, { role });
        return res.data;
    },
    updatePin: async (id: string, pin: string): Promise<StaffMemberResponse> => {
        const res = await apiClient.patch(`/staff/${id}/pin`, { pin });
        return res.data;
    },
    deactivate: async (id: string): Promise<void> => {
        await apiClient.delete(`/staff/${id}`);
    },
    reactivate: async (id: string): Promise<StaffMemberResponse> => {
        const res = await apiClient.post(`/staff/${id}/reactivate`);
        return res.data;
    },
};
