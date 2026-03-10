import { apiClient } from "@/lib/api/client";
import type { CreateStaffRequest, StaffMemberResponse, RoleResponse, Permission } from "../schema/staffSchema";

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

    // Dynamic Roles & Permissions
    getRoles: async (): Promise<RoleResponse[]> => {
        const res = await apiClient.get("/roles");
        return res.data;
    },
    getPermissions: async (): Promise<Permission[]> => {
        const res = await apiClient.get("/roles/permissions");
        return res.data;
    },
    createRole: async (data: any): Promise<RoleResponse> => {
        const res = await apiClient.post("/roles", data);
        return res.data;
    },
    updateRoleEntity: async (id: string, data: any): Promise<RoleResponse> => {
        const res = await apiClient.put(`/roles/${id}`, data);
        return res.data;
    },
    deleteRole: async (id: string): Promise<void> => {
        await apiClient.delete(`/roles/${id}`);
    }
};
