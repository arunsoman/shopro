import { apiClient } from "@/lib/api/client";
import type {
    CustomerProfileResponse,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerSearchResponse,
    Page,
    DietaryTagType,
    OccasionType,
    LoyaltyConfigResponse,
    LoyaltyTierResponse,
    LoyaltyBalanceResponse,
    LoyaltyTransactionResponse,
    BonusEventResponse,
    SegmentResponse,
    CreateSegmentRequest,
    PromoCodeResponse,
    CreatePromoCodeRequest,
    ValidatePromoResponse,
    AutomatedCampaignResponse,
    CreateCampaignRequest,
    FeedbackResponse,
    SubmitFeedbackRequest,
    FeedbackStatsResponse,
    ServerFeedbackStatsResponse,
    CrmDashboardStatsResponse
} from "../schema/crmSchema";

export const crmApi = {
    // --- Customers ---
    searchByPhone: async (phone: string): Promise<CustomerProfileResponse> => {
        const res = await apiClient.get(`/customers/phone?phone=${encodeURIComponent(phone)}`);
        return res.data;
    },
    searchCustomers: async (query: string, page = 0, size = 10): Promise<Page<CustomerSearchResponse>> => {
        const res = await apiClient.get(`/customers?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
        return res.data;
    },
    getById: async (id: string): Promise<CustomerProfileResponse> => {
        const res = await apiClient.get(`/customers/${id}`);
        return res.data;
    },
    create: async (data: CreateCustomerRequest): Promise<CustomerProfileResponse> => {
        const res = await apiClient.post("/customers", data);
        return res.data;
    },
    update: async (id: string, data: UpdateCustomerRequest): Promise<CustomerProfileResponse> => {
        const res = await apiClient.put(`/customers/${id}`, data);
        return res.data;
    },
    updateNotes: async (id: string, notes: string): Promise<void> => {
        await apiClient.patch(`/customers/${id}/notes`, notes);
    },

    // --- Tags & Occasions ---
    addDietaryTag: async (id: string, data: { tagType: DietaryTagType, customDescription?: string }): Promise<void> => {
        await apiClient.post(`/customers/${id}/dietary-tags`, data);
    },
    removeDietaryTag: async (id: string, tagId: string): Promise<void> => {
        await apiClient.delete(`/customers/${id}/dietary-tags/${tagId}`);
    },
    addOccasion: async (id: string, data: { occasionType: OccasionType, occasionMonth: number, occasionDay: number, occasionYear?: number }): Promise<void> => {
        await apiClient.post(`/customers/${id}/occasions`, data);
    },
    removeOccasion: async (id: string, occasionId: string): Promise<void> => {
        await apiClient.delete(`/customers/${id}/occasions/${occasionId}`);
    },

    // --- Loyalty ---
    getLoyaltyConfig: async (): Promise<LoyaltyConfigResponse> => {
        const res = await apiClient.get("/loyalty/config");
        return res.data;
    },
    updateLoyaltyConfig: async (data: Partial<LoyaltyConfigResponse>): Promise<LoyaltyConfigResponse> => {
        const res = await apiClient.put("/loyalty/config", data);
        return res.data;
    },
    getLoyaltyTiers: async (): Promise<LoyaltyTierResponse[]> => {
        const res = await apiClient.get("/loyalty/tiers");
        return res.data;
    },
    getLoyaltyBalance: async (customerId: string): Promise<LoyaltyBalanceResponse> => {
        const res = await apiClient.get(`/loyalty/customers/${customerId}/balance`);
        return res.data;
    },
    getLoyaltyTransactions: async (customerId: string): Promise<LoyaltyTransactionResponse[]> => {
        const res = await apiClient.get(`/loyalty/customers/${customerId}/transactions`);
        return res.data;
    },
    getActiveBonusEvents: async (): Promise<BonusEventResponse[]> => {
        const res = await apiClient.get("/loyalty/events/active");
        return res.data;
    },

    // --- Merging ---
    mergeProfiles: async (sourceId: string, targetId: string): Promise<void> => {
        await apiClient.post("/customers/merge", { sourceProfileId: sourceId, targetProfileId: targetId });
    },

    // --- Phase 2: Segments ---
    getSegments: async (): Promise<SegmentResponse[]> => {
        const res = await apiClient.get("/crm/segments");
        return res.data;
    },
    getSegmentById: async (id: string): Promise<SegmentResponse> => {
        const res = await apiClient.get(`/crm/segments/${id}`);
        return res.data;
    },
    createSegment: async (data: CreateSegmentRequest): Promise<SegmentResponse> => {
        const res = await apiClient.post("/crm/segments", data);
        return res.data;
    },
    deleteSegment: async (id: string): Promise<void> => {
        await apiClient.delete(`/crm/segments/${id}`);
    },

    // --- Phase 2: Promos ---
    getPromoCodes: async (): Promise<PromoCodeResponse[]> => {
        const res = await apiClient.get("/crm/promos");
        return res.data;
    },
    getPromoCodeById: async (id: string): Promise<PromoCodeResponse> => {
        const res = await apiClient.get(`/crm/promos/${id}`);
        return res.data;
    },
    createPromoCode: async (data: CreatePromoCodeRequest): Promise<PromoCodeResponse> => {
        const res = await apiClient.post("/crm/promos", data);
        return res.data;
    },
    deletePromoCode: async (id: string): Promise<void> => {
        await apiClient.delete(`/crm/promos/${id}`);
    },
    validatePromo: async (code: string, customerId: string): Promise<ValidatePromoResponse> => {
        const res = await apiClient.get(`/crm/promos/validate?code=${encodeURIComponent(code)}&customerId=${customerId}`);
        return res.data;
    },

    // --- Phase 2: Campaigns ---
    getCampaigns: async (): Promise<AutomatedCampaignResponse[]> => {
        const res = await apiClient.get("/crm/campaigns");
        return res.data;
    },
    createCampaign: async (data: CreateCampaignRequest): Promise<AutomatedCampaignResponse> => {
        const res = await apiClient.post("/crm/campaigns", data);
        return res.data;
    },
    deleteCampaign: async (id: string): Promise<void> => {
        await apiClient.delete(`/crm/campaigns/${id}`);
    },

    // --- Phase 2: Feedback ---
    submitFeedback: async (data: SubmitFeedbackRequest): Promise<FeedbackResponse> => {
        const res = await apiClient.post("/crm/feedback", data);
        return res.data;
    },
    getCustomerFeedback: async (customerId: string, page = 0, size = 10): Promise<Page<FeedbackResponse>> => {
        const res = await apiClient.get(`/crm/feedback/customer/${customerId}?page=${page}&size=${size}`);
        return res.data;
    },
    getFeedbackStats: async (): Promise<FeedbackStatsResponse> => {
        const res = await apiClient.get("/crm/feedback/stats");
        return res.data;
    },
    getServerFeedbackStats: async (): Promise<ServerFeedbackStatsResponse[]> => {
        const res = await apiClient.get("/crm/feedback/server-stats");
        return res.data;
    },

    // --- Phase 2: Analytics ---
    getCrmDashboardStats: async (): Promise<CrmDashboardStatsResponse> => {
        const res = await apiClient.get("/crm/analytics/dashboard-stats");
        return res.data;
    },
    getAtRiskCustomers: async (): Promise<CustomerProfileResponse[]> => {
        const res = await apiClient.get("/crm/analytics/at-risk");
        return res.data;
    }
};
