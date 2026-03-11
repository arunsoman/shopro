import { useNotificationContext, type NotificationUser as ContextUser } from '../contexts/NotificationContext';

export type NotificationUser = ContextUser;

export function useNotifications(_user?: NotificationUser) {
    const { notifications, unreadCount, markAsRead, dismiss } = useNotificationContext();
    return { notifications, unreadCount, markAsRead, dismiss };
}
