import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modifiersApi } from "../api/modifiersApi";
import type { CreateModifierGroupRequest } from "../schema/menuSchema";

export const modifierKeys = {
    all: ["modifierGroups"] as const,
    byId: (id: string) => [...modifierKeys.all, id] as const,
};

export const useModifierGroups = () => {
    return useQuery({
        queryKey: modifierKeys.all,
        queryFn: modifiersApi.getAll,
    });
};

export const useModifierGroup = (id: string) => {
    return useQuery({
        queryKey: modifierKeys.byId(id),
        queryFn: () => modifiersApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateModifierGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateModifierGroupRequest) => modifiersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: modifierKeys.all });
        },
    });
};
