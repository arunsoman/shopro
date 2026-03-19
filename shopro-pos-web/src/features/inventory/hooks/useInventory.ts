import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Ingredient, Recipe, CreateIngredientRequest, PurchaseOrder, InventoryLocation, InventoryBatch, DemandForecast } from '../api/types';

const API_BASE = '/api/v1/inventory';

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export const useIngredients = (page: number = 0, size: number = 20) => {
    return useQuery({
        queryKey: ['ingredients', page, size],
        queryFn: async () => {
            const { data } = await axios.get<PageResponse<Ingredient>>(`${API_BASE}/ingredients`, {
                params: { page, size }
            });
            return data;
        },
    });
};

export const useIngredient = (id: string) => {
    return useQuery({
        queryKey: ['ingredients', id],
        queryFn: async () => {
            const { data } = await axios.get<Ingredient>(`${API_BASE}/ingredients/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useLowStockIngredients = () => {
    return useQuery({
        queryKey: ['ingredients', 'low-stock'],
        queryFn: async () => {
            const { data } = await axios.get<Ingredient[]>(`${API_BASE}/ingredients/low-stock`);
            return data;
        },
    });
};

export const useCreateIngredient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ingredient: CreateIngredientRequest) => {
            const { data } = await axios.post<Ingredient>(`${API_BASE}/ingredients`, ingredient);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });
};

export const useUpdateIngredient = (id: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (ingredient: import('../api/types').UpdateIngredientRequest) => {
            const { data } = await axios.patch<Ingredient>(`${API_BASE}/ingredients/${id}`, ingredient);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
            queryClient.invalidateQueries({ queryKey: ['ingredients', id] });
        },
    });
};

export const useSubRecipes = () => {
    return useQuery({
        queryKey: ['sub-recipes'],
        queryFn: async () => {
            const { data } = await axios.get<import('../api/types').SubRecipe[]>(`${API_BASE}/sub-recipes`);
            return data;
        },
    });
};

export const useRecipe = (id: string, isSubRecipe: boolean = false) => {
    return useQuery({
        queryKey: ['recipes', id],
        queryFn: async () => {
            const path = isSubRecipe ? 'sub-recipe' : 'menu-item';
            const { data } = await axios.get<Recipe>(`${API_BASE}/recipes/${path}/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useUpdateRecipe = (id: string, isSubRecipe: boolean = false) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: import('../api/types').UpdateRecipeRequest) => {
            const path = isSubRecipe ? 'sub-recipe' : 'menu-item';
            const { data } = await axios.post<Recipe>(`${API_BASE}/recipes/${path}/${id}`, request);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes', id] });
        },
    });
};

export const useLogWaste = () => {
    return useMutation({
        mutationFn: async (request: import('../api/types').LogWasteRequest) => {
            await axios.post(`${API_BASE}/waste`, request);
        },
    });
};

export const useMenuItems = () => {
    return useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const { data } = await axios.get<{ id: string; name: string; category?: string }[]>('/api/v1/menu-items/published');
            return data;
        },
    });
};

export const usePurchaseOrders = () => {
    return useQuery<PurchaseOrder[]>({
        queryKey: ['inventory', 'purchase-orders'],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE}/purchase-orders`);
            return data;
        },
    });
};

export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: import('../api/types').CreatePurchaseOrderRequest) => {
            const { data } = await axios.post<PurchaseOrder>(`${API_BASE}/purchase-orders`, request);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] });
        },
    });
};

export const useCreateRFQ = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (request: import('../api/types').CreateRFQRequest) => {
            const { data } = await axios.post(`${API_BASE}/rfqs`, request);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'rfqs'] });
        },
    });
};

export const useCancelPurchaseOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await axios.post(`${API_BASE}/purchase-orders/${id}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'purchase-orders'] });
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });
};

export const useCancelRFQ = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await axios.post(`${API_BASE}/rfqs/${id}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory', 'rfqs'] });
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });
};

export const useInventoryLocations = () => {
    return useQuery({
        queryKey: ['inventory', 'locations'],
        queryFn: async () => {
            const { data } = await axios.get<InventoryLocation[]>(`${API_BASE}/locations`);
            return data;
        },
    });
};

export const useWasteLog = () => {
    return useQuery({
        queryKey: ['inventory', 'waste-log'],
        queryFn: async () => {
            const { data } = await axios.get<import('../api/types').WasteLogResponse[]>(`${API_BASE}/waste`);
            return data;
        },
    });
};

export const useActiveBatches = () => {
    return useQuery({
        queryKey: ['inventory', 'batches', 'active'],
        queryFn: async () => {
            const { data } = await axios.get<InventoryBatch[]>(`${API_BASE}/batches/active`);
            return data;
        },
    });
};

export const useIngredientBatches = (ingredientId: string) => {
    return useQuery({
        queryKey: ['inventory', 'batches', ingredientId],
        queryFn: async () => {
            const { data } = await axios.get<InventoryBatch[]>(`${API_BASE}/batches/ingredient/${ingredientId}`);
            return data;
        },
        enabled: !!ingredientId,
    });
};

export const useIngredientForecast = (ingredientId: string, startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ['inventory', 'forecast', ingredientId, startDate, endDate],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/forecasts/${ingredientId}?startDate=${startDate}&endDate=${endDate}`);
            if (!response.ok) throw new Error('Failed to fetch ingredient forecast');
            return response.json() as Promise<DemandForecast[]>;
        },
        enabled: !!ingredientId && !!startDate && !!endDate,
    });
};

export const useDailyPerishables = () => {
    return useQuery({
        queryKey: ['inventory', 'daily-perishables'],
        queryFn: async () => {
            const response = await fetch(`${API_BASE}/ingredients/daily-perishables`);
            if (!response.ok) throw new Error('Failed to fetch daily perishables');
            return response.json() as Promise<Ingredient[]>;
        },
    });
};

export const useShelfLifeAnalytics = () => {
    return useQuery({
        queryKey: ['inventory', 'analytics', 'shelf-life'],
        queryFn: async () => {
            const { data } = await axios.get<import('../api/types').ShelfLifeAnalyticsResponse>(`${API_BASE}/analytics/shelf-life`);
            return data;
        },
    });
};

export const useYieldAnalysis = () => {
    return useQuery({
        queryKey: ['inventory', 'analytics', 'yield'],
        queryFn: async () => {
            const { data } = await axios.get<import('../api/types').YieldAnalysisResponse>(`${API_BASE}/analytics/yield`);
            return data;
        },
    });
};

export const useRestockAlerts = () => {
    return useQuery({
        queryKey: ['inventory', 'restock-alerts'],
        queryFn: async () => {
            const { data } = await axios.get<import('../api/types').RestockAlertResponse[]>(`/api/v1/inventory/alerts/restock`);
            return data;
        },
    });
};
