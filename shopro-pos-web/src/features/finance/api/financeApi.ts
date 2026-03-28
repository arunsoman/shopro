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
    getBalanceSheet: async (): Promise<any> => {
        const res = await apiClient.get("/finance/balance-sheet");
        return res.data;
    },
    postEntry: async (data: { description: string; entryDate: string; lines: any[] }): Promise<void> => {
        await apiClient.post("/finance/entries", data);
    },
    replenishPettyCash: async (amount: number, initiatedBy: string): Promise<void> => {
        await apiClient.post("/finance/actions/petty-cash", { amount, initiatedBy });
    },
    recordExpense: async (amount: number, category: string, initiatedBy: string): Promise<void> => {
        await apiClient.post("/finance/actions/expense", { amount, category, initiatedBy });
    },
    payStaffAdvance: async (amount: number, staffName: string, initiatedBy: string): Promise<void> => {
        await apiClient.post("/finance/actions/staff-advance", { amount, staffName, initiatedBy });
    },
};
