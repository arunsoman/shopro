import { z } from "zod";

export const STAFF_ROLES = [
    "OWNER", "MANAGER", "HOST", "HOSTESS", "SERVER",
    "CASHIER", "BUSSER", "CHEF", "LINE_COOK", "EXPEDITOR",
] as const;

export type StaffRoleType = typeof STAFF_ROLES[number];

export const CreateStaffSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
    role: z.enum(STAFF_ROLES, { message: "Select a valid role" }),
});

export type CreateStaffRequest = z.infer<typeof CreateStaffSchema>;

export const UpdateRoleSchema = z.object({
    role: z.enum(STAFF_ROLES),
});

export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;

export interface StaffMemberResponse {
    id: string;
    fullName: string;
    role: StaffRoleType;
    active: boolean;
    lastLoginAt: string | null;
    createdAt: string;
}
