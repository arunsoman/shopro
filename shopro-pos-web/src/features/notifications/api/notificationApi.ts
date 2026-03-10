import { apiClient } from "@/lib/api/client";

export interface NotificationManualTriggerRequest {
    typeCode: string;
    recipientId?: string;
    recipientGroup?: string;
    payload: string;
}

export const notificationApi = {
    dispatchNotification: async (data: NotificationManualTriggerRequest) => {
        return apiClient.post('/notifications/dispatch', data);
    },
    getNotificationTypes: async () => {
        return apiClient.get('/notifications/types');
    },
};
