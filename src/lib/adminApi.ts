import { supabase } from '@supabase/supabaseClient';
import { logAdminAction } from '@/lib/logAdminAction';

export async function updateUserStatusAPI(userId: string, newStatus: string) {
  try {
    const { error } = await supabase
      .from('talent_profiles')
      .update({ status: newStatus })
      .eq('id', userId);

    if (error) throw error;

    // Log the admin action
    await logAdminAction(
      `update_user_status_${newStatus}`,
      'talent_profiles',
      userId,
      { newStatus }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function updateProjectStatusAPI(projectId: string, newStatus: string) {
  try {
    const { error } = await supabase
        .from('projects')
      .update({ status: newStatus })
      .eq('id', projectId);

    if (error) throw error;

    // Log the admin action
    await logAdminAction(
      `update_project_status_${newStatus}`,
      'projects',
      projectId,
      { newStatus }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
}