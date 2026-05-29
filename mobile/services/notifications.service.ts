import api from './api';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  orderId: string | null;
  read: boolean;
  createdAt: string;
  readAt?: string;
};

export async function getMyNotifications(): Promise<AppNotification[]> {
  const res = await api.get('/notifications');
  return (res as any).data ?? [];
}

export async function getUnreadCount(): Promise<number> {
  try {
    const res = await api.get('/notifications/unread');
    return ((res as any).data?.count) ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = await api.patch('/notifications/read-all');
  return ((res as any).data?.updated) ?? 0;
}

export async function deleteNotification(id: string): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
