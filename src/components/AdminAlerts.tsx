import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, UserX, DollarSign, MessageCircle } from 'lucide-react';

interface AlertItem {
  id: string;
  type: 'flagged_project' | 'disqualified_talent' | 'payment_issue' | 'negative_review';
  message: string;
  timestamp: string;
}

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    type: 'flagged_project',
    message: 'Project "SEO Overhaul" has been flagged for review.',
    timestamp: '2025-06-12T14:20:00Z',
  },
  {
    id: '2',
    type: 'disqualified_talent',
    message: 'John Smith has been disqualified from bidding.',
    timestamp: '2025-06-12T13:00:00Z',
  },
  {
    id: '3',
    type: 'payment_issue',
    message: 'Payment issue reported by client Acme Corp.',
    timestamp: '2025-06-12T11:45:00Z',
  },
  {
    id: '4',
    type: 'negative_review',
    message: 'Negative review submitted for "Landing Page Optimization".',
    timestamp: '2025-06-11T17:15:00Z',
  },
];

const iconMap: Record<AlertItem['type'], React.ReactNode> = {
  flagged_project: <AlertTriangle className="text-red-500 w-5 h-5" />,
  disqualified_talent: <UserX className="text-yellow-600 w-5 h-5" />,
  payment_issue: <DollarSign className="text-blue-500 w-5 h-5" />,
  negative_review: <MessageCircle className="text-pink-500 w-5 h-5" />,
};

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString();
}

export default function AdminAlerts() {
  return (
    <div className="space-y-4">
      {mockAlerts.map((alert) => (
        <Card key={alert.id} className="border-l-4 border-[#2E3A8C]">
          <CardContent className="flex items-start gap-4 p-4">
            <div>{iconMap[alert.type]}</div>
            <div className="space-y-1">
              <p className="text-sm text-gray-800 font-medium">{alert.message}</p>
              <p className="text-xs text-gray-500">{formatTime(alert.timestamp)}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
