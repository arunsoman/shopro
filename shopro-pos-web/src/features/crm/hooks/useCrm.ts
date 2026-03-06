import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crmApi } from "../api/crmApi";
import type { CreateCustomerRequest } from "../schema/crmSchema";

export const useCustomerSearch = (phone: string) => {
    return useQuery({
        queryKey: ["customers", "search", phone],
        queryFn: () => crmApi.searchByPhone(phone),
        enabled: phone.length >= 8,
        retry: false,
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
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["customers", id] });
        },
    });
};
