import React from 'react';
import { Clock, CheckCircle, FileText, Target, TrendingUp, Play, Pause } from 'lucide-react';
import { format, formatDistanceToNow, formatDuration } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TimeEntry {
  startTime: Date;
  endTime?: Date;
  hoursLogged?: number;
}

interface Deliverable {
  id: string;
  title: string;
  description: string;
  problem?: string;
  kpis?: string[];
  status: 'recommended' | 'scoped' | 'in_progress' | 'approved' | 'performance_tracking';
  estimatedHours: number;
  actualHours: number;
  timeEntries: TimeEntry[];
  dueDate?: Date;
  submittedFiles?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  isTracking?: boolean;
  currentSession?: {
    startTime: Date;
  };
}

interface KanbanBoardProps {
  deliverables: Deliverable[];
  projectStartDate: Date;
  projectDeadline: Date;
  onDeliverableMove?: (event: any) => void;
  onStatusChange?: (id: string, newStatus: Deliverable['status']) => void;
  onTrackingStart?: (id: string) => void;
  onTrackingStop?: (id: string, hoursLogged: number) => void;
  onLogActivity?: (message: string) => void;
  role?: 'client' | 'talent' | 'admin';
}

const columns: Deliverable['status'][] = [
  'recommended',
  'scoped',
  'in_progress',
  'approved',
  'performance_tracking',
];

const columnTitles = {
  recommended: 'Recommended',
  scoped: 'Scoped',
  in_progress: 'In Progress',
  approved: 'Approved',
  performance_tracking: 'Performance Tracking'
};

const columnColors = {
  recommended: 'bg-purple-50/50 border-purple-200',
  scoped: 'bg-blue-50/50 border-blue-200',
  in_progress: 'bg-yellow-50/50 border-yellow-200',
  approved: 'bg-green-50/50 border-green-200',
  performance_tracking: 'bg-gray-50/50 border-gray-200'
};

export default function KanbanBoard({
  deliverables,
  projectStartDate,
  projectDeadline,
  onStatusChange,
  onTrackingStart,
  onTrackingStop,
  onLogActivity,
  role = 'talent'
}: KanbanBoardProps) {
  const getDeliverablesByStatus = (status: Deliverable['status']) => 
    deliverables.filter(d => d.status === status);

  const getRemainingHours = (deliverable: Deliverable) => {
    return Math.max(0, deliverable.estimatedHours - deliverable.actualHours);
  };

  const getProgressColor = (deliverable: Deliverable) => {
    const progress = (deliverable.actualHours / deliverable.estimatedHours) * 100;
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusCTA = (deliverable: Deliverable, role: string) => {
    const { status } = deliverable;
    
    switch (role) {
      case 'client':
        if (status === 'recommended') return { text: 'Approve Scope', action: () => onStatusChange?.(deliverable.id, 'scoped') };
        if (status === 'in_progress') return { text: 'Review Work', action: () => toast.info('Review submitted work') };
        if (status === 'scoped') return { text: 'Monitor Progress', action: () => toast.info('Work will begin soon') };
        if (status === 'approved') return { text: 'Approve Final', action: () => onStatusChange?.(deliverable.id, 'performance_tracking') };
        return null;
        
      case 'talent':
        if (status === 'scoped') return { text: 'Start Work', action: () => onStatusChange?.(deliverable.id, 'in_progress') };
        if (status === 'in_progress' && !deliverable.isTracking) return { text: 'Track Time', action: () => handleStartWorking(deliverable) };
        if (status === 'in_progress' && deliverable.isTracking) return { text: 'Stop Tracking', action: () => handleStopWorking(deliverable) };
        if (status === 'approved') return { text: 'View Results', action: () => toast.info('Work approved by client') };
        return null;
        
      case 'admin':
        return { text: 'Manage', action: () => toast.info('Admin management options') };
        
      default:
        return null;
    }
  };

  const handleStartWorking = (deliverable: Deliverable) => {
    if (deliverable.isTracking) return;
    
    onTrackingStart?.(deliverable.id);
    onLogActivity?.(`Started working on ${deliverable.title}`);
    toast.success('Time tracking started');
  };

  const handleStopWorking = (deliverable: Deliverable) => {
    if (!deliverable.isTracking || !deliverable.currentSession) return;

    const now = new Date();
    const duration = (now.getTime() - deliverable.currentSession.startTime.getTime()) / (1000 * 60 * 60);
    const hoursLogged = parseFloat(duration.toFixed(2));

    onTrackingStop?.(deliverable.id, hoursLogged);
    onLogActivity?.(`Completed work session on ${deliverable.title} (${hoursLogged}h logged)`);
    toast.success('Time tracking stopped');
  };

  const formatTimeTracked = (timeEntries: TimeEntry[]): string => {
    const totalHours = timeEntries.reduce((total, entry) => {
      if (entry.hoursLogged) return total + entry.hoursLogged;
      if (entry.endTime) {
        const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
        return total + duration;
      }
      return total;
    }, 0);

    return `${totalHours.toFixed(1)}h`;
  };

  // Add default problem and KPIs if not provided
  const enhanceDeliverable = (deliverable: Deliverable): Deliverable => ({
    ...deliverable,
    problem: deliverable.problem || `Addressing key challenges in ${deliverable.title.toLowerCase()}`,
    kpis: deliverable.kpis || [
      'Completion within estimated hours',
      'Client satisfaction score > 4.5/5',
      'Quality metrics met'
    ]
  });

  return (
    <div className="overflow-x-auto">
      {/* Mobile-responsive kanban board */}
      <div className="flex w-max gap-4 sm:gap-6 min-h-[600px]">
        {columns.map((status) => (
          <div 
            key={status}
            className={`w-[280px] sm:w-[350px] shrink-0 rounded-lg border ${columnColors[status]} flex flex-col`}
          >
            <div className="px-3 sm:px-4 py-3 border-b border-inherit">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {columnTitles[status]}
                </h3>
                <Badge 
                  variant="outline"
                  className="ml-2 bg-white/50 text-gray-600 border-gray-200 text-xs"
                >
                  {getDeliverablesByStatus(status).length}
                </Badge>
              </div>
            </div>

            <div className="p-2 sm:p-3 space-y-3 flex-1 overflow-y-auto">
              {getDeliverablesByStatus(status).map((deliverable) => {
                const enhanced = enhanceDeliverable(deliverable);
                const cta = getStatusCTA(enhanced, role);
                
                return (
                  <div
                    key={deliverable.id}
                    className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    <div className="space-y-3">
                      {/* Header with title and tracking status */}
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                          {deliverable.title}
                        </h4>
                        {deliverable.isTracking && (
                          <Badge variant="secondary" className="animate-pulse bg-yellow-100 text-yellow-700 shrink-0 text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>

                      {/* Problem Statement */}
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Target className="w-3 h-3 text-red-600" />
                          <span className="text-xs font-medium text-red-800">Problem</span>
                        </div>
                        <p className="text-xs text-red-700 line-clamp-2">
                          {enhanced.problem}
                        </p>
                      </div>

                      {/* Description */}
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">Description</span>
                        </div>
                        <p className="text-xs text-blue-700 line-clamp-2">
                          {deliverable.description}
                        </p>
                      </div>

                      {/* KPIs */}
                      <div className="bg-green-50 border border-green-200 rounded p-2">
                        <div className="flex items-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-800">KPIs</span>
                        </div>
                        <ul className="text-xs text-green-700 space-y-0.5">
                          {enhanced.kpis.slice(0, 2).map((kpi, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span className="line-clamp-1">{kpi}</span>
                            </li>
                          ))}
                          {enhanced.kpis.length > 2 && (
                            <li className="text-green-600 font-medium">
                              +{enhanced.kpis.length - 2} more
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Hours Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">Hours Progress</span>
                          <span className="font-medium text-gray-700">
                            {deliverable.actualHours.toFixed(1)}/{deliverable.estimatedHours}h
                          </span>
                        </div>

                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(deliverable)} transition-all`}
                            style={{ 
                              width: `${Math.min(100, (deliverable.actualHours / deliverable.estimatedHours) * 100)}%` 
                            }}
                          />
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{getRemainingHours(deliverable).toFixed(1)}h remaining</span>
                          {deliverable.timeEntries && deliverable.timeEntries.length > 0 && (
                            <span>{formatTimeTracked(deliverable.timeEntries)} tracked</span>
                          )}
                        </div>
                      </div>

                      {/* Status CTA Button */}
                      {cta && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            cta.action();
                          }}
                          size="sm"
                          className="w-full text-xs"
                          variant={status === 'in_progress' && deliverable.isTracking ? 'destructive' : 'default'}
                        >
                          {status === 'in_progress' && deliverable.isTracking ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              {cta.text}
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              {cta.text}
                            </>
                          )}
                        </Button>
                      )}

                      {/* Due Date */}
                      {deliverable.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 pt-1 border-t">
                          <Clock className="w-3 h-3" />
                          Due {format(deliverable.dueDate, 'MMM d')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}