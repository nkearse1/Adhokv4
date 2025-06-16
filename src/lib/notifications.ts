import { supabase } from '@supabase/supabaseClient';

export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, newStatus: string) {
  const { data, error } = await supabase
    .from('users')
    .update({ status: newStatus })
    .eq('id', userId);

  if (error) throw error;
  return data;
}