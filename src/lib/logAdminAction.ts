import { supabase } from '@/lib/supabaseClient';

export async function logAdminAction(
  action: string,
  table: string,
  id: string,
  details: Record<string, any>
) {
  const { error } = await supabase.from('admin_action_logs').insert({
    action,
    table,
    record_id: id,
    details,
  });

  if (error) {
    console.error('Error logging admin action:', error);
  }
}