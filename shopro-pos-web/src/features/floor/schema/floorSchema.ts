import { z } from 'zod';

// --- Section ---
export const createSectionSchema = z.object({
    name: z.string().min(1, 'Section name is required.').max(80, 'Section name must be 80 characters or fewer.'),
});
export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export interface SectionResponse {
    id: string;
    name: string;
    tableCount: number;
}

// --- Table Shape ---
export const createTableShapeSchema = z.object({
    sectionId: z.string().uuid('A valid section must be selected.'),
    name: z.string().min(1, 'Table name is required.').regex(/^[a-zA-Z0-9\-]+$/, 'Name can only contain letters, numbers, and hyphens.'),
    capacity: z.number().int().min(1, 'Capacity must be at least 1.').max(50, 'Capacity cannot exceed 50.'),
    posX: z.number().int().min(0),
    posY: z.number().int().min(0),
    width: z.number().int().min(10),
    height: z.number().int().min(10),
    shapeType: z.enum(['RECTANGLE', 'CIRCLE', 'ROUND', 'OVAL', 'DECOR']),
});
export type CreateTableShapeInput = z.infer<typeof createTableShapeSchema>;

export type TableStatus =
    | 'AVAILABLE'
    | 'RESERVED'
    | 'HELD'
    | 'OCCUPIED'
    | 'ORDER_PLACED'
    | 'FOOD_DELIVERED'
    | 'DESSERT_COURSE'
    | 'CHECK_DROPPED'
    | 'PAYING'
    | 'DIRTY'
    | 'CLEANING'
    | 'MAINTENANCE'
    | 'INACTIVE';

export interface TableShapeResponse {
    id: string;
    name: string;
    capacity: number;
    status: TableStatus;
    sectionId: string;
    sectionName: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
    shapeType: 'RECTANGLE' | 'CIRCLE' | 'ROUND' | 'OVAL' | 'DECOR';
}

// --- Waitlist ---
export const createWaitlistEntrySchema = z.object({
    guestName: z.string().min(1, 'Guest name is required.').max(120),
    partySize: z.number().int().min(1, 'Party size must be at least 1.').max(50),
    guestPhone: z
        .string()
        .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format.')
        .optional()
        .or(z.literal('')),
});
export type CreateWaitlistEntryInput = z.infer<typeof createWaitlistEntrySchema>;

export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'SEATED' | 'CANCELLED';

export interface WaitlistEntryResponse {
    id: string;
    guestName: string;
    partySize: number;
    guestPhone?: string;
    estimatedWaitMinutes?: number;
    status: WaitlistStatus;
    notifiedAt?: string;
    seatedAtTableId?: string;
    seatedAtTableName?: string;
    handledByName?: string;
    createdAt: string;
}

// --- Reservation ---
export const createReservationSchema = z.object({
    tableId: z.string().uuid('A table must be selected.'),
    guestName: z.string().min(1, 'Guest name is required.').max(120),
    partySize: z.number().int().min(1).max(50),
    guestPhone: z
        .string()
        .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone number format.')
        .optional()
        .or(z.literal('')),
    reservationStart: z.string().min(1, 'Reservation time is required.'),
});
export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export type ReservationStatus = 'CONFIRMED' | 'SEATED' | 'NO_SHOW' | 'CANCELLED';

export interface ReservationResponse {
    id: string;
    tableId: string;
    tableName: string;
    guestName: string;
    partySize: number;
    guestPhone?: string;
    reservationStart: string;
    status: ReservationStatus;
    cancellationReason?: string;
    createdByName?: string;
    createdAt: string;
}
