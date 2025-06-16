import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@supabase/supabaseClient';
import { useAuth } from '@/lib/useAuth';

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  problem?: string;
  kpis?: string[];
  status: 'recommended' | 'scoped' | 'in_progress' | 'approved' | 'performance_tracking';
  estimatedHours: number;
  actualHours: number;
  timeEntries: Array<{
    startTime: Date;
    endTime?: Date;
    hoursLogged?: number;
  }>;
  dueDate?: Date;
  files?: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  isTracking?: boolean;
  currentSession?: {
    startTime: Date;
  };
}

export interface Message {
  id: string;
  text: string;
  sender: 'client' | 'talent';
  timestamp: Date;
  deliverableId?: string;
}

const accessibleStatuses = ['Picked Up', 'Scope Defined', 'In Progress', 'Submitted', 'Revisions', 'Final Payment', 'Approved', 'Performance Tracking', 'Complete'];

export function useProjectStatus(projectId?: string) {
  const [projectStatus, setProjectStatus] = useState<string>('Loading...');
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasTrackingInfo, setHasTrackingInfo] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isAssignedToTalent, setIsAssignedToTalent] = useState(false);
  const [statusReady, setStatusReady] = useState(false);
  const { userId } = useAuth();

  const calculateProjectStatus = useCallback(
    (items: Deliverable[], hasTracking: boolean, archived: boolean, assigned: boolean): string => {
      if (!assigned) return 'Live';
      if (items.length === 0) return 'Picked Up';

      const allApproved = items.every(d => d.status === 'approved' || d.status === 'performance_tracking');
      const anyInProgress = items.some(d => d.status === 'in_progress');
      const anyScoped = items.some(d => d.status === 'scoped');
      const anyRecommended = items.some(d => d.status === 'recommended');

      if (allApproved && hasTracking) return 'Complete';
      if (allApproved) return 'Approved';
      if (anyInProgress) return 'In Progress';
      if (anyScoped) return 'Scope Defined';
      if (anyRecommended) return 'Picked Up';
      return 'Picked Up';
    },
    []
  );

  useEffect(() => {
    if (projectId && userId) {
      fetchProjectData();
    }
  }, [projectId, userId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        return;
      }

      // Check if project is assigned to talent
      const isAssigned = projectData.talent_id !== null;
      setIsAssignedToTalent(isAssigned);

      // Fetch deliverables
      const { data: deliverablesData, error: deliverablesError } = await supabase
        .from('project_deliverables')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (deliverablesError) {
        console.error('Error fetching deliverables:', deliverablesError);
      }

      const formattedDeliverables: Deliverable[] = deliverablesData?.map(d => ({
        id: d.id,
        title: d.title,
        description: d.description,
        problem: d.notes || '',
        kpis: [],
        status: d.status as Deliverable['status'],
        estimatedHours: 8, // Default value
        actualHours: 0,
        timeEntries: [],
        files: []
      })) || [];

      setDeliverables(formattedDeliverables);

      // Calculate project status
      const calculatedStatus = calculateProjectStatus(
        formattedDeliverables,
        hasTrackingInfo,
        isArchived,
        isAssigned
      );

      setProjectStatus(calculatedStatus);
      setStatusReady(true);

      // Fetch activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (activityError) {
        console.error('Error fetching activity logs:', activityError);
      } else {
        setActivityLog(activityData?.map(log => log.action) || []);
      }

      setMessages([
        {
          id: 'init-1',
          sender: 'client',
          text: 'Welcome to the workspace! Let us know when you\'re ready to begin.',
          timestamp: new Date(),
        }
      ]);

    } catch (error) {
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = statusReady && accessibleStatuses.includes(projectStatus);

  const updateDeliverableStatus = useCallback(async (id: string, newStatus: Deliverable['status']) => {
    try {
      const { error } = await supabase
        .from('project_deliverables')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setDeliverables(prev => {
        const updated = prev.map(d => d.id === id ? { ...d, status: newStatus } : d);
        const newProjectStatus = calculateProjectStatus(updated, hasTrackingInfo, isArchived, isAssignedToTalent);
        setProjectStatus(newProjectStatus);
        return updated;
      });
      
      setActivityLog(prev => [...prev, `Deliverable status updated: ${newStatus}`]);
    } catch (error) {
      console.error('Error updating deliverable status:', error);
    }
  }, [calculateProjectStatus, hasTrackingInfo, isArchived, isAssignedToTalent]);

  const addDeliverable = useCallback(async (deliverable: Partial<Deliverable>) => {
    try {
      const { data, error } = await supabase
        .from('project_deliverables')
        .insert({
          project_id: projectId,
          title: deliverable.title || '',
          description: deliverable.description || '',
          notes: deliverable.problem || '',
          status: 'recommended'
        })
        .select()
        .single();

      if (error) throw error;

      const newDeliverable: Deliverable = {
        id: data.id,
        title: data.title,
        description: data.description,
        problem: data.notes || '',
        kpis: deliverable.kpis || [],
        status: 'recommended',
        estimatedHours: deliverable.estimatedHours || 8,
        actualHours: 0,
        timeEntries: [],
        files: []
      };

      setDeliverables(prev => {
        const updated = [...prev, newDeliverable];
        const newProjectStatus = calculateProjectStatus(updated, hasTrackingInfo, isArchived, isAssignedToTalent);
        setProjectStatus(newProjectStatus);
        return updated;
      });
      
      setActivityLog(prev => [...prev, `New deliverable added: ${newDeliverable.title}`]);
    } catch (error) {
      console.error('Error adding deliverable:', error);
    }
  }, [projectId, calculateProjectStatus, hasTrackingInfo, isArchived, isAssignedToTalent]);

  const updateDeliverable = useCallback((id: string, updates: Partial<Deliverable>) => {
    setDeliverables(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    setActivityLog(prev => [...prev, 'Deliverable updated']);
  }, []);

  const addActivityLogEntry = useCallback((message: string) => {
    setActivityLog(prev => [...prev, message]);
  }, []);

  const addTrackingInfo = useCallback((trackingData: any) => {
    setHasTrackingInfo(true);
    setActivityLog(prev => [...prev, 'Performance tracking information added']);
    const newProjectStatus = calculateProjectStatus(deliverables, true, isArchived, isAssignedToTalent);
    setProjectStatus(newProjectStatus);
  }, [calculateProjectStatus, deliverables, isArchived, isAssignedToTalent]);

  const getApprovalProgress = useCallback(() => {
    const approvedCount = deliverables.filter(d => d.status === 'approved' || d.status === 'performance_tracking').length;
    const totalCount = deliverables.length;
    const percentage = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
    return { approved: approvedCount, total: totalCount, percentage };
  }, [deliverables]);

  return {
    projectStatus,
    deliverables,
    activityLog,
    messages,
    setMessages,
    loading,
    statusReady,
    hasTrackingInfo,
    isArchived,
    isAssignedToTalent,
    canAccess,
    updateDeliverableStatus,
    addDeliverable,
    updateDeliverable,
    addActivityLogEntry,
    addTrackingInfo,
    getApprovalProgress
  };
}