import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuItemsApi } from "../api/menuApi";
import type { CreateMenuItemRequest } from "../schema/menuSchema";

export const menuItemKeys = {
    all: ["menuItems"] as const,
    drafts: ["menuItems", "drafts"] as const,
    published: ["menuItems", "published"] as const,
    byId: (id: string) => [...menuItemKeys.all, id] as const,
};

export const useDraftMenuItems = () => {
    return useQuery({
        queryKey: menuItemKeys.drafts,
        queryFn: menuItemsApi.getDrafts,
    });
};

export const usePublishedMenuItems = () => {
    return useQuery({
        queryKey: menuItemKeys.published,
        queryFn: menuItemsApi.getPublished,
    });
};

export const useMenuItem = (id: string) => {
    return useQuery({
        queryKey: menuItemKeys.byId(id),
        queryFn: () => menuItemsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMenuItemRequest) => menuItemsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuItemKeys.drafts });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.published });
        },
    });
};

export const useUpdateMenuItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateMenuItemRequest }) =>
            menuItemsApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuItemKeys.byId(variables.id) });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.drafts });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.published });
        },
    });
};

export const useUpdateMenuItemStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            menuItemsApi.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuItemKeys.byId(variables.id) });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.drafts });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.published });
        },
    });
};

export const useUploadMenuItemPhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) =>
            menuItemsApi.uploadPhoto(id, file),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuItemKeys.byId(variables.id) });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.drafts });
            queryClient.invalidateQueries({ queryKey: menuItemKeys.published });
        },
    });
};
