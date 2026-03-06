import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffApi } from "../api/staffApi";
import type { CreateStaffRequest } from "../schema/staffSchema";

const STAFF_KEY = ["staff"];

export const useStaff = (roleFilter?: string) =>
    useQuery({
        queryKey: [...STAFF_KEY, roleFilter],
        queryFn: () => staffApi.getAll(roleFilter),
    });

export const useCreateStaff = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateStaffRequest) => staffApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
    });
};

export const useUpdateRole = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: string }) =>
            staffApi.updateRole(id, role),
        onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
    });
};

export const useUpdatePin = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, pin }: { id: string; pin: string }) =>
            staffApi.updatePin(id, pin),
        onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
    });
};

export const useDeactivateStaff = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => staffApi.deactivate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
    });
};

export const useReactivateStaff = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => staffApi.reactivate(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
    });
};
