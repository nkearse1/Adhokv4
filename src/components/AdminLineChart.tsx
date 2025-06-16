import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  period: string;
  totalProjects: number;
  estRevenue: number;
  activeTalent: number;
  revenuePerTalent: number;
  flaggedProjects: number;
  negativeReviews: number;
}

const mockData: ChartDataPoint[] = [
  {
    period: 'Jan',
    totalProjects: 45,
    estRevenue: 125000,
    activeTalent: 28,
    revenuePerTalent: 4464,
    flaggedProjects: 2,
    negativeReviews: 3
  },
  {
    period: 'Feb',
    totalProjects: 52,
    estRevenue: 148000,
    activeTalent: 32,
    revenuePerTalent: 4625,
    flaggedProjects: 1,
    negativeReviews: 2
  },
  {
    period: 'Mar',
    totalProjects: 61,
    estRevenue: 175000,
    activeTalent: 38,
    revenuePerTalent: 4605,
    flaggedProjects: 3,
    negativeReviews: 4
  },
  {
    period: 'Apr',
    totalProjects: 58,
    estRevenue: 162000,
    activeTalent: 35,
    revenuePerTalent: 4629,
    flaggedProjects: 2,
    negativeReviews: 1
  },
  {
    period: 'May',
    totalProjects: 67,
    estRevenue: 195000,
    activeTalent: 42,
    revenuePerTalent: 4643,
    flaggedProjects: 1,
    negativeReviews: 2
  },
  {
    period: 'Jun',
    totalProjects: 73,
    estRevenue: 218000,
    activeTalent: 45,
    revenuePerTalent: 4844,
    flaggedProjects: 0,
    negativeReviews: 1
  }
];

interface AdminLineChartProps {
  selectedMetrics: string[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{`${label} 2024`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {`${entry.name}: ${
              entry.dataKey === 'estRevenue' || entry.dataKey === 'revenuePerTalent' 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value
            }`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const metricConfig = {
  totalProjects: {
    stroke: '#2E3A8C',
    name: 'Total Projects',
    strokeWidth: 3,
    isDashed: false
  },
  estRevenue: {
    stroke: '#00A499',
    name: 'Est. Revenue ($)',
    strokeWidth: 3,
    isDashed: false
  },
  activeTalent: {
    stroke: '#10B981',
    name: 'Active Talent',
    strokeWidth: 2,
    isDashed: false
  },
  revenuePerTalent: {
    stroke: '#8B5CF6',
    name: 'Revenue per Talent ($)',
    strokeWidth: 2,
    isDashed: false
  },
  flaggedProjects: {
    stroke: '#F59E0B',
    name: 'Flagged Projects',
    strokeWidth: 2,
    isDashed: true
  },
  negativeReviews: {
    stroke: '#EF4444',
    name: 'Negative Reviews',
    strokeWidth: 2,
    isDashed: true
  }
};

export default function AdminLineChart({ selectedMetrics }: AdminLineChartProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Analytics Overview</h3>
          <p className="text-sm text-gray-600">Key metrics tracking over the past 6 months</p>
        </div>
        
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="period" 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              
              {/* Render only selected metrics */}
              {selectedMetrics.map((metric) => {
                const config = metricConfig[metric as keyof typeof metricConfig];
                if (!config) return null;
                
                return (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric} 
                    stroke={config.stroke} 
                    strokeWidth={config.strokeWidth}
                    strokeDasharray={config.isDashed ? "5 5" : "0"}
                    name={config.name}
                    dot={{ fill: config.stroke, strokeWidth: 2, r: config.strokeWidth === 3 ? 4 : 3 }}
                    activeDot={{ r: config.strokeWidth === 3 ? 6 : 5, stroke: config.stroke, strokeWidth: 2 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#2E3A8C]"></div>
            <span className="text-gray-600">Projects (Primary)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#00A499]"></div>
            <span className="text-gray-600">Revenue (Primary)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#10B981]"></div>
            <span className="text-gray-600">Talent Growth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#8B5CF6]"></div>
            <span className="text-gray-600">Efficiency</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#F59E0B] opacity-60" style={{borderTop: '2px dashed #F59E0B'}}></div>
            <span className="text-gray-600">Risk Indicators</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}