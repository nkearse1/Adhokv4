import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TimeEntry {
  startTime: Date;
  endTime: Date;
  hoursLogged: number;
}

interface Deliverable {
  id: string;
  title: string;
  estimatedHours: number;
  actualHours: number;
  timeEntries: TimeEntry[];
}

interface ActivityLogProps {
  role: 'talent' | 'client' | 'admin';
  deliverables: Deliverable[];
  activityLog: string[];
}

export default function ActivityLog({ role, deliverables, activityLog }: ActivityLogProps) {
  const getTotalEstimated = (): number => {
    return deliverables.reduce((total, d) => total + d.estimatedHours, 0);
  };

  const getTotalActual = (): number => {
    return deliverables.reduce((total, d) => total + d.actualHours, 0);
  };

  return (
    <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2E3A8C]">Activity Log</h3>
        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
          <Clock className="w-4 h-4 text-[#2E3A8C]" />
          <span className="text-sm font-medium text-[#2E3A8C]">
            {getTotalActual().toFixed(1)}h / {getTotalEstimated().toFixed(1)}h
          </span>
        </div>
      </div>

      {role === 'client' && (
        <p className="text-sm text-gray-600 mb-4">
          Summary of completed work and actual time logged compared to the initial estimate.
        </p>
      )}

      {role === 'admin' && (
        <p className="text-sm text-gray-600 mb-4">
          Full audit trail and work verification view across deliverables.
        </p>
      )}

      <div className="space-y-2">
        {/* PERMANENT: Activity log shows the same entries from centralized state */}
        {activityLog.map((log, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{log}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Deliverable Time Breakdown</h4>
        <div className="space-y-2">
          {/* PERMANENT: Shows the same deliverables from centralized state */}
          {deliverables.map((d) => (
            <div key={d.id} className="flex justify-between items-center border border-gray-100 p-3 rounded">
              <span className="text-sm font-medium text-gray-700">{d.title}</span>
              <Badge variant="secondary">
                {d.actualHours.toFixed(1)}h / {d.estimatedHours.toFixed(1)}h
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}