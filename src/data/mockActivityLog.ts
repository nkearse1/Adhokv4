// src/data/mockActivityLog.ts
export const mockActivityLog = [
  {
    id: '1',
    message: 'Project created',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: '2',
    message: 'Deliverable submitted',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: '3',
    message: 'Feedback received from client',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
];
