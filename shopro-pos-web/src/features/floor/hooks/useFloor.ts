import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsApi, tablesApi, waitlistApi, reservationsApi } from "../api/floorApi";
import type { CreateSectionInput, CreateTableShapeInput, CreateWaitlistEntryInput, CreateReservationInput } from "../schema/floorSchema";

// --- Query Keys ---
export const floorKeys = {
    sections: ["sections"] as const,
    tables: ["tables"] as const,
    waitlist: ["waitlist"] as const,
    reservations: (tableId: string) => ["reservations", tableId] as const,
};

// --- Sections ---
export function useSections() {
    return useQuery({ queryKey: floorKeys.sections, queryFn: sectionsApi.getAll });
}

export function useCreateSection() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateSectionInput) => sectionsApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.sections }),
    });
}

// --- Tables ---
export function useTables() {
    return useQuery({ queryKey: floorKeys.tables, queryFn: tablesApi.getAll });
}

export function useCreateTable() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTableShapeInput) => tablesApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

export function useUpdateTable() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateTableShapeInput }) => tablesApi.update(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

export function useUpdateTableStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => tablesApi.updateStatus(id, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

export function useUpdateTablePosition() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, posX, posY }: { id: string; posX: number; posY: number }) => tablesApi.updatePosition(id, posX, posY),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

export function useDeleteTable() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => tablesApi.delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

// --- Waitlist ---
export function useWaitlist() {
    return useQuery({ queryKey: floorKeys.waitlist, queryFn: waitlistApi.getActive });
}

export function useAddToWaitlist() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateWaitlistEntryInput) => waitlistApi.add(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.waitlist }),
    });
}

export function useNotifyGuest() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => waitlistApi.notify(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.waitlist }),
    });
}

export function useRemoveFromWaitlist() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => waitlistApi.remove(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.waitlist }),
    });
}

export function useSeatParty() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ tableId, waitlistEntryId }: { tableId: string; waitlistEntryId: string }) =>
            waitlistApi.seatParty(tableId, waitlistEntryId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: floorKeys.tables });
            qc.invalidateQueries({ queryKey: floorKeys.waitlist });
        },
    });
}

export function useMarkTableClean() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (tableId: string) => waitlistApi.markClean(tableId),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

// --- Reservations ---
export function useReservations(tableId: string) {
    return useQuery({
        queryKey: floorKeys.reservations(tableId),
        queryFn: () => reservationsApi.getForTable(tableId),
        enabled: !!tableId,
    });
}

export function useCreateReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateReservationInput) => reservationsApi.create(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}

export function useCancelReservation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => reservationsApi.cancel(id, reason),
        onSuccess: () => qc.invalidateQueries({ queryKey: floorKeys.tables }),
    });
}
