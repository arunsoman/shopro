import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Ingredient, Recipe, CreateIngredientRequest, PurchaseOrder } from '../api/types';

const API_BASE = '/api/v1/inventory';

export const useIngredients = () => {
    return useQuery({
        queryKey: ['ingredients'],
        queryFn: async () => {
            const { data } = await axios.get<Ingredient[]>(`${API_BASE}/ingredients`);
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
