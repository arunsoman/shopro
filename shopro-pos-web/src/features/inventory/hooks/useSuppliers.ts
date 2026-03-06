import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Supplier, CreateSupplierRequest, SupplierCatalogImportRequest, PriceComparison } from '../api/types';

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
