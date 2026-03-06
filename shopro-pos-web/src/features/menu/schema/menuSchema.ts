import { z } from "zod";

// DTO Schemas matching the Backend Records

export const MenuCategoryResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    displayOrder: z.number(),
});

export type MenuCategoryResponse = z.infer<typeof MenuCategoryResponseSchema>;

export const CreateMenuCategoryRequestSchema = z.object({
    name: z.string().min(1, "Name is required").max(40, "Maximum 40 characters"),
});

export type CreateMenuCategoryRequest = z.infer<typeof CreateMenuCategoryRequestSchema>;

export const ReorderCategoriesRequestSchema = z.object({
    categoryIds: z.array(z.string().uuid()),
});

export type ReorderCategoriesRequest = z.infer<typeof ReorderCategoriesRequestSchema>;

// -- ITEMS --

export const MenuItemResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().optional().nullable(),
    basePrice: z.number(),
    categoryId: z.string().uuid(),
    categoryName: z.string(),
    status: z.enum(["DRAFT", "PUBLISHED", "EIGHTY_SIXED", "ARCHIVED"]),
    photoUrl: z.string().optional().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type MenuItemResponse = z.infer<typeof MenuItemResponseSchema>;

export const CreateMenuItemRequestSchema = z.object({
    name: z.string().min(1, "Name is required").max(60, "Maximum 60 characters"),
    description: z.string().max(500, "Maximum 500 characters").optional().nullable(),
    basePrice: z.number().min(0, "Price must be positive"),
    categoryId: z.string().uuid("Category is required"),
    photoUrl: z.string().optional().nullable(),
    modifierGroupIds: z.array(z.string().uuid()).optional(),
});

export type CreateMenuItemRequest = z.infer<typeof CreateMenuItemRequestSchema>;

export const DuplicateCheckResponseSchema = z.object({
    exists: z.boolean(),
    categoryName: z.string().nullable(),
});

export type DuplicateCheckResponse = z.infer<typeof DuplicateCheckResponseSchema>;

// -- MODIFIERS --

export const ModifierOptionResponseSchema = z.object({
    id: z.string().uuid(),
    label: z.string(),
    upchargeAmount: z.number(),
    displayOrder: z.number(),
});

export type ModifierOptionResponse = z.infer<typeof ModifierOptionResponseSchema>;

export const ModifierGroupResponseSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    required: z.boolean(),
    minSelections: z.number(),
    maxSelections: z.number(),
    options: z.array(ModifierOptionResponseSchema),
});

export type ModifierGroupResponse = z.infer<typeof ModifierGroupResponseSchema>;

export const CreateModifierOptionRequestSchema = z.object({
    label: z.string().min(1, "Option label is required").max(80, "Maximum 80 characters"),
    upchargeAmount: z.number().min(0, "Upcharge cannot be negative"),
    displayOrder: z.number().min(0),
});

export type CreateModifierOptionRequest = z.infer<typeof CreateModifierOptionRequestSchema>;

export const CreateModifierGroupRequestSchema = z.object({
    name: z.string().min(1, "Group name is required").max(80, "Maximum 80 characters"),
    required: z.boolean(),
    minSelections: z.number().min(0),
    maxSelections: z.number().min(1),
    options: z.array(CreateModifierOptionRequestSchema).min(1, "At least one option is required"),
}).refine(data => data.maxSelections >= data.minSelections, {
    message: "Max selections cannot be less than min selections",
    path: ["maxSelections"],
}).refine(data => !data.required || data.minSelections >= 1, {
    message: "Required modifier must have a minimum selection of at least 1",
    path: ["minSelections"],
});

export type CreateModifierGroupRequest = z.infer<typeof CreateModifierGroupRequestSchema>;
