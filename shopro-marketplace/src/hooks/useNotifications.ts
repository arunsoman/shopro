import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  typeCode: string;
  title: string;
  body: string;
  data?: any;
  createdAt: string;
  read: boolean;
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const resp = await fetch(`/api/notifications?userId=${userId}`);
      const data = await resp.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();

    if (!userId) return;

    // WebSocket Setup
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?userId=${userId}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Play a subtle sound or show a toast if needed
    };

    return () => socket.close();
  }, [userId, fetchNotifications]);

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const dismiss = async (id: string) => {
    await fetch(`/api/notifications/${id}/dismiss`, { method: 'PATCH' });
    setNotifications(prev => prev.filter(n => n.id !== id));
    // If it was unread, decrement the count
    const wasUnread = notifications.find(n => n.id === id && !n.read);
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markRead, dismiss, refresh: fetchNotifications };
}
