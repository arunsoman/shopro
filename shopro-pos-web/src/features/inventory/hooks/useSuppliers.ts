import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type {
    Supplier,
    CreateSupplierRequest,
    SupplierCatalogImportRequest,
    PriceComparison,
    SupplierUser,
    InviteSupplierUserRequest,
    SupplierPolicy
} from '../api/types';
import { apiClient } from '@/lib/api/client';

const API_BASE = '/api/v1/inventory/suppliers';

export const useSuppliers = () => {
    return useQuery<Supplier[]>({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await axios.get(API_BASE);
            return data;
        }
    });
};

export const useSupplier = (id?: string) => {
    return useQuery<Supplier>({
        queryKey: ['supplier', id],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/${id}`);
            return data;
        },
        enabled: !!id
    });
};

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateSupplierRequest) => axios.post(API_BASE, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        }
    });
};

export const useImportCatalog = (supplierId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: SupplierCatalogImportRequest) =>
            axios.post(`${API_BASE}/${supplierId}/catalog`, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            // Also invalidate pricing if we have a query for that
            queryClient.invalidateQueries({ queryKey: ['price-comparison'] });
        }
    });
};

export const usePriceComparison = (ingredientId?: string) => {
    return useQuery<PriceComparison>({
        queryKey: ['price-comparison', ingredientId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/benchmarking/${ingredientId}`);
            return data;
        },
        enabled: !!ingredientId
    });
};

export const useSupplierUsers = (supplierId: string) => {
    return useQuery<SupplierUser[]>({
        queryKey: ['supplier-users', supplierId],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/${supplierId}/users`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useInviteSupplierUser = (supplierId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: InviteSupplierUserRequest) =>
            axios.post(`${API_BASE}/${supplierId}/users/invite`, request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-users', supplierId] });
        }
    });
};

export const useDeactivateSupplierUser = (supplierId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) =>
            axios.patch(`${API_BASE}/${supplierId}/users/${userId}/deactivate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['supplier-users', supplierId] });
        }
    });
};

export const useSupplierPolicy = (supplierId?: string) => {
    return useQuery<SupplierPolicy>({
        queryKey: ['supplier-policy', supplierId],
        queryFn: async () => {
            const { data } = await apiClient.get<SupplierPolicy>(`/inventory/suppliers/${supplierId}/policy`);
            return data;
        },
        enabled: !!supplierId
    });
};

export const useUpdateSupplierPolicy = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ supplierId, policy }: { supplierId: string, policy: Partial<SupplierPolicy> }) => {
            const { data } = await apiClient.put<SupplierPolicy>(`/inventory/suppliers/${supplierId}/policy`, policy);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['supplier-policy', variables.supplierId] });
        }
    });
};
