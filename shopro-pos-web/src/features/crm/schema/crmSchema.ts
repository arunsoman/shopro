import { z } from "zod";

export const CreateCustomerSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().optional(),
    phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number format"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    preferenceNotes: z.string().optional(),
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.extend({
    smsOptIn: z.boolean().default(false),
    emailOptIn: z.boolean().default(false),
});

export type UpdateCustomerRequest = z.infer<typeof UpdateCustomerSchema>;

export type DietaryTagType = 
    | "GLUTEN_FREE" | "NUT_ALLERGY" | "DAIRY_FREE" | "SHELLFISH" 
    | "VEGAN" | "VEGETARIAN" | "HALAL" | "KOSHER" | "OTHER";

export interface CustomerDietaryTag {
    id: string;
    tagType: DietaryTagType;
    customDescription?: string;
}

export type OccasionType = "BIRTHDAY" | "ANNIVERSARY";

export interface CustomerOccasion {
    id: string;
    occasionType: OccasionType;
    occasionMonth: number;
    occasionDay: number;
    occasionYear?: number;
}

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
    visitCount: number;
    smsOptIn: boolean;
    emailOptIn: boolean;
    lastVisitAt?: string;
    dietaryTags: CustomerDietaryTag[];
    occasions: CustomerOccasion[];
}

// --- Phase 2: Segments ---

export type SegmentField = "LTV" | "LAST_VISIT" | "TIER" | "TAG" | "VISIT_COUNT";
export type SegmentOperator = "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS" | "IN";

export interface SegmentRuleDto {
    id?: string;
    field: SegmentField;
    operator: SegmentOperator;
    ruleValue: string;
}

export interface SegmentResponse {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    rules: SegmentRuleDto[];
    createdAt: string;
    updatedAt: string;
}

export const CreateSegmentSchema = z.object({
    name: z.string().min(1, "Segment name is required"),
    description: z.string().optional(),
    rules: z.array(z.object({
        field: z.string(),
        operator: z.string(),
        ruleValue: z.string().min(1, "Value is required"),
    })).min(1, "At least one rule is required"),
});

export type CreateSegmentRequest = z.infer<typeof CreateSegmentSchema>;

// --- Phase 2: Promos ---

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface PromoCodeResponse {
    id: string;
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    maxUses?: number;
    currentUses: number;
    validFrom?: string;
    validUntil?: string;
    isActive: boolean;
    segmentId?: string;
}

export const CreatePromoCodeSchema = z.object({
    code: z.string().min(1, "Promo code is required").toUpperCase(),
    description: z.string().optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.number().positive("Value must be positive"),
    maxUses: z.number().optional(),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    segmentId: z.string().optional(),
});

export type CreatePromoCodeRequest = z.infer<typeof CreatePromoCodeSchema>;

export interface ValidatePromoResponse {
    isValid: boolean;
    message: string;
    discountType?: DiscountType;
    discountValue?: number;
}

// --- Phase 2: Campaigns ---

export type TriggerEvent = "BIRTHDAY" | "ANNIVERSARY" | "INACTIVE_30_DAYS" | "INACTIVE_60_DAYS" | "FIRST_VISIT";

export interface AutomatedCampaignResponse {
    id: string;
    name: string;
    triggerEvent: TriggerEvent;
    delayHours: number;
    templateId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const CreateCampaignSchema = z.object({
    name: z.string().min(1, "Campaign name is required"),
    triggerEvent: z.enum(["BIRTHDAY", "ANNIVERSARY", "INACTIVE_30_DAYS", "INACTIVE_60_DAYS", "FIRST_VISIT"]),
    delayHours: z.number().min(0),
    templateId: z.string().optional(),
    isActive: z.boolean().default(true),
});

export type CreateCampaignRequest = z.infer<typeof CreateCampaignSchema>;

// --- Phase 2: Feedback ---

export type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";
export type FeedbackSource = "EMAIL" | "SMS" | "APP" | "IN_STORE" | "RECEIPT_LINK";

export interface FeedbackResponse {
    id: string;
    customerId: string;
    customerName: string;
    orderId?: string;
    rating: number;
    comments?: string;
    sentiment?: Sentiment;
    source: FeedbackSource;
    createdAt: string;
}

export interface FeedbackStatsResponse {
    averageRating: number;
    totalFeedbackCount: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    recentFeedback: FeedbackResponse[];
}

export const SubmitFeedbackSchema = z.object({
    customerId: z.string(),
    orderId: z.string().optional(),
    rating: z.number().min(1).max(5),
    comments: z.string().optional(),
    source: z.enum(["EMAIL", "SMS", "APP", "IN_STORE", "RECEIPT_LINK"]),
});

export type SubmitFeedbackRequest = z.infer<typeof SubmitFeedbackSchema>;

export interface CustomerSearchResponse {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email?: string;
    tierName: string;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export interface LoyaltyTierResponse {
    id: string;
    name: string;
    spendThreshold: number;
    pointMultiplier: number;
}

export interface LoyaltyConfigResponse {
    id: string;
    earningRate: number;
    redemptionValue: number;
    minimumRedemptionPoints: number;
    pointExpirationDays: number;
    defaultSmsOptIn: boolean;
    defaultEmailOptIn: boolean;
    feedbackWindowHours: number;
    smsGatewayEnabled: boolean;
    emailGatewayEnabled: boolean;
}

export type BonusPointEventScope = "ALL" | "CATEGORY" | "ITEM";

export interface BonusEventResponse {
    id: string;
    name: string;
    multiplier: number;
    scope: BonusPointEventScope;
    scopeReferenceId?: string;
    startsAt: string;
    endsAt: string;
    active: boolean;
}

export type LoyaltyTransactionType = "EARN" | "REDEEM" | "BONUS" | "ADJUSTMENT";

export interface LoyaltyTransactionResponse {
    id: string;
    points: number;
    description: string;
    transactionType: LoyaltyTransactionType;
    orderTicketId?: string;
    bonusEventId?: string;
    createdAt: string;
}

export interface LoyaltyBalanceResponse {
    customerId: string;
    availablePoints: number;
    lifetimeSpend: number;
    tierName: string;
    pointMultiplier: number;
    nextTierThreshold?: number;
    spendToNextTier?: number;
}

export interface ServerFeedbackStatsResponse {
    serverId: string;
    serverName: string;
    ratingCount: number;
    averageRating: number;
}

export interface CrmDashboardStatsResponse {
    avgClv: number;
    activeMembers: number;
    newEnrollments: number;
    totalPointsLiability: number;
    redemptionRate: number;
}
