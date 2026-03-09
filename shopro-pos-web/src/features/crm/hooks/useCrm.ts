import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "../api/crmApi";
import type { CreateCustomerRequest } from "../schema/crmSchema";

export const useCustomerSearch = (phone: string) => {
    return useQuery({
        queryKey: ["customers", "search", "phone", phone],
        queryFn: () => crmApi.searchByPhone(phone),
        enabled: phone.length >= 8,
        retry: false,
    });
};

export const useCustomers = (query: string, page: number, size = 10) => {
    return useQuery({
        queryKey: ["customers", "list", query, page, size],
        queryFn: () => crmApi.searchCustomers(query, page, size),
    });
};

export const useCustomerDetails = (id: string) => {
    return useQuery({
        queryKey: ["customers", id],
        queryFn: () => crmApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateCustomerRequest) => crmApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        },
    });
};

export const useUpdateCustomerNotes = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes: string }) =>
            crmApi.updateNotes(id, notes),
        onSuccess: (_data: void, variables: { id: string; notes: string }) => {
            queryClient.invalidateQueries({ queryKey: ["customers", variables.id] });
        },
    });
};

export const useCrmAnalytics = () => {
    return useQuery({
        queryKey: ["crm", "analytics", "dashboard"],
        queryFn: () => crmApi.getCrmDashboardStats(),
    });
};

export const useAtRiskCustomers = () => {
    return useQuery({
        queryKey: ["crm", "analytics", "at-risk"],
        queryFn: () => crmApi.getAtRiskCustomers(),
    });
};

export const useServerFeedbackStats = () => {
    return useQuery({
        queryKey: ["crm", "feedback", "server-stats"],
        queryFn: () => crmApi.getServerFeedbackStats(),
    });
};

export const useMergeProfiles = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ sourceId, targetId }: { sourceId: string; targetId: string }) =>
            crmApi.mergeProfiles(sourceId, targetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        },
    });
};
