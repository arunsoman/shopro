import { apiClient } from "@/lib/api/client";

export interface TablesideSessionDto {
    id: string;
    tableId: string;
    qrToken: string;
    status: string;
}

export interface TableQrResponse {
    tableId: string;
    tableName: string;
    qrCodeBase64: string;
    targetUrl: string;
}

export const tablesideApi = {
    getQrCode: async (tableId: string): Promise<TableQrResponse> => {
        const res = await apiClient.get(`/tableside/qr/table/${tableId}`);
        return res.data;
    },
    getAllQrCodes: async (): Promise<TableQrResponse[]> => {
        const res = await apiClient.get("/tableside/qr/all");
        return res.data;
    },
    getPendingSessions: async (): Promise<TablesideSessionDto[]> => {
        const res = await apiClient.get("/tableside/sessions/pending");
        return res.data;
    },
    approveSession: async (sessionId: string): Promise<void> => {
        await apiClient.post(`/tableside/session/${sessionId}/approve`);
    },
    rejectSession: async (sessionId: string): Promise<void> => {
        await apiClient.post(`/tableside/session/${sessionId}/reject`);
    },
    getTables: async (): Promise<any[]> => {
        const res = await apiClient.get("/floor-plan/tables");
        return res.data;
    },
};
