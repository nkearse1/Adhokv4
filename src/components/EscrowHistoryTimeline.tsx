import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Shield, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface EscrowHistoryEntry {
  id: string;
  action: 'requested' | 'approved' | 'rejected' | 'disputed' | 'overridden' | 'flagged';
  timestamp: Date;
  actor: string;
  reason?: string;
  metadata?: Record<string, any>;
}

interface EscrowHistoryTimelineProps {
  history: EscrowHistoryEntry[];
  className?: string;
}

export default function EscrowHistoryTimeline({ history, className = '' }: EscrowHistoryTimelineProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'requested':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'overridden':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'flagged':
        return <Flag className="w-4 h-4 text-orange-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'requested':
        return 'bg-blue-50 border-blue-200';
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'overridden':
        return 'bg-purple-50 border-purple-200';
      case 'flagged':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'requested':
        return 'Release Requested';
      case 'approved':
        return 'Payment Released';
      case 'rejected':
        return 'Release Rejected';
      case 'overridden':
        return 'Admin Override';
      case 'flagged':
        return 'Flagged for Review';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  if (history.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No escrow activity yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow History</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {history.map((entry, index) => (
          <div key={entry.id} className="relative flex items-start space-x-4 pb-6">
            {/* Timeline dot */}
            <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${getActionColor(entry.action)}`}>
              {getActionIcon(entry.action)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {getActionLabel(entry.action)}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {entry.actor}
                  </Badge>
                </div>
                <time className="text-xs text-gray-500">
                  {format(entry.timestamp, 'MMM d, yyyy h:mm a')}
                </time>
              </div>
              
              {entry.reason && (
                <p className="mt-1 text-sm text-gray-600">
                  <span className="font-medium">Reason:</span> {entry.reason}
                </p>
              )}
              
              {entry.metadata?.override_action && (
                <p className="mt-1 text-sm text-purple-600">
                  <span className="font-medium">Override Action:</span> {entry.metadata.override_action}
                </p>
              )}
              
              {index === 0 && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Latest
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}