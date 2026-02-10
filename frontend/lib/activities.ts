import api from './api';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description?: string;
  meta_data?: string;
  created_at: string;
  read: number;
}

export async function fetchActivities(limit: number = 10): Promise<Activity[]> {
  const response = await api.get(`/api/activities/?limit=${limit}`);
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await api.get('/api/activities/unread-count');
  return response.data.count;
}

export async function markAsRead(activityId: string): Promise<void> {
  await api.patch(`/api/activities/${activityId}/read`);
}

export async function createActivity(data: {
  activity_type: string;
  title: string;
  description?: string;
  meta_data?: string;
}): Promise<Activity> {
  const response = await api.post('/api/activities/', {
    ...data,
    user_id: 'current' // Backend pega do token
  });
  return response.data;
}
