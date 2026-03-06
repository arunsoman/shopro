import { apiClient } from "@/lib/api/client";
import type {
    CustomerProfileResponse,
    CreateCustomerRequest
} from "../schema/crmSchema";

export const crmApi = {
    searchByPhone: async (phone: string): Promise<CustomerProfileResponse> => {
        const res = await apiClient.get(`/customers/search?phone=${encodeURIComponent(phone)}`);
        return res.data;
    },
    getById: async (id: string): Promise<CustomerProfileResponse> => {
        const res = await apiClient.get(`/customers/${id}`);
        return res.data;
    },
    create: async (data: CreateCustomerRequest): Promise<CustomerProfileResponse> => {
        const res = await apiClient.post("/customers", data);
        return res.data;
    },
    updateNotes: async (id: string, notes: string): Promise<void> => {
        await apiClient.patch(`/customers/${id}/notes`, notes);
    },
};
