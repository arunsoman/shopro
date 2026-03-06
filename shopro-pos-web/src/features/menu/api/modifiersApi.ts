import { apiClient } from "@/lib/api/client";
import type { CreateModifierGroupRequest, ModifierGroupResponse } from "../schema/menuSchema";

export const modifiersApi = {
    getAll: async () => {
        const response = await apiClient.get<ModifierGroupResponse[]>("/modifier-groups");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ModifierGroupResponse>(`/modifier-groups/${id}`);
        return response.data;
    },

    create: async (data: CreateModifierGroupRequest) => {
        const response = await apiClient.post<ModifierGroupResponse>("/modifier-groups", data);
        return response.data;
    },
};
