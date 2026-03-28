import { apiClient } from "@/lib/api/client";

export const financeApi = {
    getAccounts: async (): Promise<any[]> => {
        const res = await apiClient.get("/finance/accounts");
        return res.data;
    },
    getLedger: async (from?: string, to?: string): Promise<any[]> => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const res = await apiClient.get(`/finance/ledger?${params.toString()}`);
        return res.data;
    },
    getPnL: async (from?: string, to?: string): Promise<any> => {
        const params = new URLSearchParams();
        if (from) params.append("from", from);
        if (to) params.append("to", to);
        const res = await apiClient.get(`/finance/pnl?${params.toString()}`);
        return res.data;
    },
};
