import { z } from "zod";

// These are now just "default" or suggestive, as roles are dynamic in the backend.
export const STAFF_ROLES = [
    "OWNER", "MANAGER", "GENERAL_MANAGER", "ASSISTANT_MANAGER", "FB_MANAGER",
    "KITCHEN_MANAGER", "EXECUTIVE_CHEF", "SOUS_CHEF", "CHEF_DE_PARTIE",
    "LINE_COOK", "PREP_COOK", "DISHWASHER", "MAITRE_D", "HOST",
    "BARTENDER", "BUSSER", "RUNNER", "SENIOR_SERVER", "JUNIOR_SERVER",
] as const;

export const CreateStaffSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
    role: z.string().min(1, "Select a valid role"),
});

export type CreateStaffRequest = z.infer<typeof CreateStaffSchema>;

export const UpdateRoleSchema = z.object({
    role: z.string().min(1, "Select a valid role"),
});

export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;

export interface StaffMemberResponse {
    id: string;
    fullName: string;
    role: string;
    permissions: string[];
    active: boolean;
    lastLoginAt: string | null;
    createdAt: string;
}

export interface RoleResponse {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    parentRoleId?: string;
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
}
