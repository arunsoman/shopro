import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuCategoriesApi } from "../api/menuApi";
import type { CreateMenuCategoryRequest, ReorderCategoriesRequest } from "../schema/menuSchema";

export const menuCategoryKeys = {
    all: ["menuCategories"] as const,
    byId: (id: string) => [...menuCategoryKeys.all, id] as const,
};

export const useMenuCategories = () => {
    return useQuery({
        queryKey: menuCategoryKeys.all,
        queryFn: menuCategoriesApi.getAll,
    });
};

export const useCreateMenuCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMenuCategoryRequest) => menuCategoriesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
        },
    });
};

export const useUpdateMenuCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateMenuCategoryRequest }) =>
            menuCategoriesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
            queryClient.invalidateQueries({ queryKey: menuCategoryKeys.byId(variables.id) });
        },
    });
};

export const useDeleteMenuCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => menuCategoriesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
        },
    });
};

export const useReorderMenuCategories = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ReorderCategoriesRequest) => menuCategoriesApi.reorder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuCategoryKeys.all });
        },
    });
};
