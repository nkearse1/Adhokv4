import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@supabase/supabaseClient';

interface EscrowHistoryEntry {
  id: string;
  action: 'requested' | 'approved' | 'rejected' | 'disputed' | 'overridden';
  timestamp: Date;
  actor: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export function useEscrow(projectId: string) {
  const [escrowStatus, setEscrowStatus] = useState<'idle' | 'requested' | 'approved' | 'rejected' | 'disputed' | 'flagged'>('idle');
  const [escrowHistory, setEscrowHistory] = useState<EscrowHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Load escrow data on mount
  useEffect(() => {
    if (projectId) {
      loadEscrowData();
    }
  }, [projectId]);

  const loadEscrowData = async () => {
    try {
      setLoading(true);
      
      // Load current escrow status
      const { data: escrowData, error: escrowError } = await supabase
        .from('escrow_transactions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (escrowData && !escrowError) {
        setEscrowStatus(escrowData.status);
      }

      // Load escrow history
      const { data: historyData, error: historyError } = await supabase
        .from('escrow_history')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (historyData && !historyError) {
        setEscrowHistory(historyData.map(entry => ({
          id: entry.id,
          action: entry.action,
          timestamp: new Date(entry.created_at),
          actor: entry.actor_name || 'Unknown',
          reason: entry.reason,
          metadata: entry.metadata
        })));
      }
    } catch (error) {
      console.error('Error loading escrow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (userId: string, type: string, title: string, message: string) => {
    try {
      await supabase.from('notifications').insert({
        user_id: userId,
        type,
        title,
        message,
        metadata: { project_id: projectId, escrow_related: true }
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const logEscrowAction = async (action: string, reason?: string, metadata?: Record<string, any>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('escrow_history').insert({
        project_id: projectId,
        action,
        actor_id: user?.id,
        actor_name: user?.user_metadata?.full_name || 'Unknown',
        reason,
        metadata
      });

      // Reload history
      loadEscrowData();
    } catch (error) {
      console.error('Error logging escrow action:', error);
    }
  };

  const requestEscrowRelease = useCallback(async () => {
    try {
      setLoading(true);
      
      // Update escrow status in database
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ status: 'requested' })
        .eq('project_id', projectId);

      if (error) throw error;

      // Get project details for notifications
      const { data: project } = await supabase
        .from('projects')
        .select('client_id, title')
        .eq('id', projectId)
        .single();

      if (project?.client_id) {
        await createNotification(
          project.client_id,
          'escrow_request',
          '💰 Payment Release Requested',
          `Talent has requested payment release for "${project.title}"`
        );
      }

      await logEscrowAction('requested');
      
      setEscrowStatus('requested');
      toast.success('Escrow release requested - client will be notified');
    } catch (error) {
      console.error('Error requesting escrow release:', error);
      toast.error('Failed to request escrow release');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const approveEscrowRelease = useCallback(async () => {
    try {
      setLoading(true);
      
      // Update escrow status
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ 
          status: 'approved',
          released_at: new Date().toISOString()
        })
        .eq('project_id', projectId);

      if (error) throw error;

      // Get project details for notifications
      const { data: project } = await supabase
        .from('projects')
        .select('talent_id, title')
        .eq('id', projectId)
        .single();

      if (project?.talent_id) {
        await createNotification(
          project.talent_id,
          'escrow_approved',
          '✅ Payment Released!',
          `Your payment for "${project.title}" has been released from escrow`
        );
      }

      await logEscrowAction('approved');
      
      setEscrowStatus('approved');
      toast.success('Payment released from escrow');
    } catch (error) {
      console.error('Error approving escrow release:', error);
      toast.error('Failed to approve escrow release');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const rejectEscrowRelease = useCallback(async (reason: string) => {
    try {
      setLoading(true);
      
      // Update escrow status
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ status: 'rejected' })
        .eq('project_id', projectId);

      if (error) throw error;

      // Get project details for notifications
      const { data: project } = await supabase
        .from('projects')
        .select('talent_id, title')
        .eq('id', projectId)
        .single();

      if (project?.talent_id) {
        await createNotification(
          project.talent_id,
          'escrow_rejected',
          '❌ Payment Release Rejected',
          `Payment release for "${project.title}" was rejected: ${reason}`
        );
      }

      await logEscrowAction('rejected', reason);
      
      setEscrowStatus('rejected');
      toast.warning(`Escrow release rejected: ${reason}`);
    } catch (error) {
      console.error('Error rejecting escrow release:', error);
      toast.error('Failed to reject escrow release');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const overrideEscrow = useCallback(async (action: 'release' | 'cancel', reason?: string) => {
    try {
      setLoading(true);
      
      const newStatus = action === 'release' ? 'approved' : 'disputed';
      
      // Update escrow status
      const { error } = await supabase
        .from('escrow_transactions')
        .update({ 
          status: newStatus,
          ...(action === 'release' && { released_at: new Date().toISOString() })
        })
        .eq('project_id', projectId);

      if (error) throw error;

      // Get project details for notifications
      const { data: project } = await supabase
        .from('projects')
        .select('talent_id, client_id, title')
        .eq('id', projectId)
        .single();

      // Notify both parties of admin override
      const notificationTitle = action === 'release' 
        ? '⚠️ Admin Override: Payment Released' 
        : '⚠️ Admin Override: Escrow Cancelled';
      
      const notificationMessage = `Admin has ${action === 'release' ? 'released' : 'cancelled'} escrow for "${project?.title}"${reason ? `: ${reason}` : ''}`;

      if (project?.talent_id) {
        await createNotification(project.talent_id, 'admin_override', notificationTitle, notificationMessage);
      }
      if (project?.client_id) {
        await createNotification(project.client_id, 'admin_override', notificationTitle, notificationMessage);
      }

      await logEscrowAction('overridden', reason, { override_action: action });
      
      setEscrowStatus(newStatus);
      
      if (action === 'release') {
        toast.success('Admin override: Payment released');
      } else {
        toast.error('Admin override: Escrow cancelled');
      }
    } catch (error) {
      console.error('Error overriding escrow:', error);
      toast.error('Failed to override escrow');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const flagProjectForReview = useCallback(async (reason: string) => {
    try {
      setLoading(true);
      
      // Update project flag status
      const { error: projectError } = await supabase
        .from('projects')
        .update({ flagged: true })
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Freeze escrow
      const { error: escrowError } = await supabase
        .from('escrow_transactions')
        .update({ status: 'flagged' })
        .eq('project_id', projectId);

      if (escrowError) throw escrowError;

      // Notify admins
      const { data: admins } = await supabase
        .from('admin_users')
        .select('id');

      if (admins) {
        for (const admin of admins) {
          await createNotification(
            admin.id,
            'fraud_alert',
            '🚨 Project Flagged for Review',
            `Project has been flagged for potential fraud: ${reason}`
          );
        }
      }

      await logEscrowAction('flagged', reason);
      
      setEscrowStatus('flagged');
      toast.warning('Project flagged for review - payments frozen');
    } catch (error) {
      console.error('Error flagging project:', error);
      toast.error('Failed to flag project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    escrowStatus,
    escrowHistory,
    loading,
    requestEscrowRelease,
    approveEscrowRelease,
    rejectEscrowRelease,
    overrideEscrow,
    flagProjectForReview
  };
}