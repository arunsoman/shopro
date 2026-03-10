import { useEffect, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import type { InAppNotification } from '../types';
import type { IMessage, IFrame } from '@stomp/stompjs';

export interface NotificationUser {
    id: string;
    role: string;
}

export function useNotifications(user?: NotificationUser) {
    const { session } = useAuth();
    const currentUser = user || (session ? { id: session.id, role: session.role } : null);

    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!currentUser?.id) return;
        
        const fetchHistory = async () => {
            try {
                // Fetch page 0, size 50
                const res = await fetch(`/api/v1/notifications?userId=${currentUser.id}&page=0&size=50`);
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.content || []);
                    setUnreadCount((data.content || []).filter((n: InAppNotification) => !n.isRead).length);
                }
            } catch (err) {
                console.error('Failed to fetch notification history:', err);
            }
        };
        fetchHistory();
    }, [currentUser?.id]);

    const onNotificationReceived = useCallback((notification: InAppNotification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        toast.info(notification.title, {
            description: notification.message,
            action: {
                label: 'View',
                onClick: () => console.log('View notification', notification.id),
            },
        });
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const socket = new SockJS('/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSockets');

                // Subscribe to user-specific notifications
                client.subscribe(`/user/queue/notifications`, (message: IMessage) => {
                    onNotificationReceived(JSON.parse(message.body));
                });

                // Subscribe to role-specific notifications
                client.subscribe(`/topic/role/${currentUser.role}/notifications`, (message: IMessage) => {
                    onNotificationReceived(JSON.parse(message.body));
                });

                // Subscribe to recall commands (if any globally)
                client.subscribe('/topic/notifications/recall', (message: IMessage) => {
                    const { correlationId } = JSON.parse(message.body);
                    setNotifications(prev => {
                        const removed = prev.filter(n => n.correlationId === correlationId);
                        const unreadRemoved = removed.filter(n => !n.isRead).length;
                        if (unreadRemoved > 0) {
                            setUnreadCount(c => Math.max(0, c - unreadRemoved));
                        }
                        return prev.filter(n => n.correlationId !== correlationId);
                    });
                });

                // Subscribe to sync commands (Read, Dismiss, Cancel)
                client.subscribe(`/user/queue/notifications/sync`, (message: IMessage) => {
                    const { id, correlationId, action } = JSON.parse(message.body);
                    
                    if (action === 'READ') {
                        setNotifications(prev => {
                            const isUnread = prev.find(n => n.id === id && !n.isRead);
                            if (isUnread) setUnreadCount(c => Math.max(0, c - 1));
                            return prev.map(n => n.id === id ? { ...n, isRead: true } : n);
                        });
                    } else if (action === 'DISMISSED') {
                        setNotifications(prev => {
                            const isUnread = prev.find(n => n.id === id && !n.isRead);
                            if (isUnread) setUnreadCount(c => Math.max(0, c - 1));
                            return prev.filter(n => n.id !== id);
                        });
                    } else if (action === 'CANCEL') {
                        setNotifications(prev => {
                            const removed = prev.filter(n => n.correlationId === correlationId);
                            const unreadRemoved = removed.filter(n => !n.isRead).length;
                            if (unreadRemoved > 0) {
                                setUnreadCount(c => Math.max(0, c - unreadRemoved));
                            }
                            return prev.filter(n => n.correlationId !== correlationId);
                        });
                    }
                });
            },
            onStompError: (frame: IFrame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
        };
    }, [currentUser?.id, currentUser?.role, onNotificationReceived]);

    const markAsRead = async (id: string) => {
        // Optimistic UI
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.isRead) {
                setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.map(n => n.id === id ? { ...n, isRead: true } : n);
        });

        try {
            await fetch(`/api/v1/notifications/${id}/read`, { method: 'PATCH' });
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const dismiss = async (id: string) => {
        // Optimistic UI
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.isRead) {
                setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== id);
        });

        try {
            await fetch(`/api/v1/notifications/${id}/dismiss`, { method: 'PATCH' });
        } catch (error) {
            console.error('Failed to dismiss', error);
        }
    };

    return { notifications, unreadCount, markAsRead, dismiss };
}
