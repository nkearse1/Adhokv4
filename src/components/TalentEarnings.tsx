import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const weeklyEarnings = [150, 300, 400, 250];
const timeTracking = [
  { project: 'SEO Audit', hours: 6 },
  { project: 'Site Audit', hours: 8 },
];
const payouts = [
  { date: '04/05', amount: '$200', status: 'Paid' },
  { date: '04/19', amount: '$400', status: 'Paid' },
  { date: '05/03', amount: '$600', status: 'Pending' },
];

export default function TalentEarnings() {
  return (
    <Card className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-[#2E3A8C]">Earnings Overview</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold">$400</p>
          <p className="text-xs text-gray-500">3 Projects Completed</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">All-Time</p>
          <p className="text-2xl font-bold">$1,200</p>
          <p className="text-xs text-gray-500">7 Total Projects</p>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Weekly Earnings</p>
        <div className="grid grid-cols-4 gap-3 h-24 items-end">
          {weeklyEarnings.map((val, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="bg-[#00A499] w-4" style={{ height: `${val / 5}px` }}></div>
              <p className="text-xs mt-1 text-gray-500">W{i + 1}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Filter & Export</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">Week</Button>
          <Button size="sm" variant="outline">Month</Button>
          <Button size="sm" variant="outline" disabled>Custom</Button>
          <Button size="sm" variant="secondary">Export CSV</Button>
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Time Tracking</p>
        <ul className="text-sm space-y-1">
          {timeTracking.map((entry, i) => (
            <li key={i}>{entry.project} – {entry.hours} hrs</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Payouts</p>
        <ul className="text-sm space-y-1">
          {payouts.map((entry, i) => (
            <li key={i}>{entry.date} – {entry.amount} ({entry.status})</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
