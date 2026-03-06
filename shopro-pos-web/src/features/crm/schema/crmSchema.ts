import { z } from "zod";

export const CreateCustomerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    preferenceNotes: z.string().optional(),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;

export interface CustomerProfileResponse {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    tierName: string;
    pointMultiplier: number;
    lifetimeSpend: number;
    availablePoints: number;
    preferenceNotes?: string;
}

export interface LoyaltyTierResponse {
    id: string;
    name: string;
    spendThreshold: number;
    pointMultiplier: number;
}
