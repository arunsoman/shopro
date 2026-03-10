export type NotificationCategory = 'ORDER' | 'INVENTORY' | 'SYSTEM' | 'SECURITY' | 'CRM';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RecipientType = 'ROLE' | 'USER';

export interface InAppNotification {
    id: string;
    title: string;
    message: string;
    category: NotificationCategory;
    priority: NotificationPriority;
    isRead: boolean;
    isDismissed: boolean;
    data?: Record<string, any>;
    correlationId?: string;
    createdAt: string;
}
