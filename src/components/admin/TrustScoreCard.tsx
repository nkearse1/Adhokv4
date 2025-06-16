import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ThumbsUp, 
  Users, 
  AlertTriangle,
  Shield
} from 'lucide-react';

interface TrustScoreProps {
  score: number;
  factors?: {
    completedProjects: number;
    adminComplaints: number;
    missedDeadlines: number;
    positiveRatings: number;
    responseTime: number;
    clientRetention: number;
  };
  lastUpdated?: string;
}

export default function TrustScoreCard({ score, factors, lastUpdated }: TrustScoreProps) {
  // Get trust score color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get trust score label based on score
  const getScoreLabel = () => {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Very Good';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Fair';
    if (score >= 30) return 'Poor';
    if (score >= 20) return 'Very Poor';
    return 'Critical';
  };

  // Get progress color based on score
  const getProgressColor = () => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-blue-600';
    if (score >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Trust Score
          </h3>
          <Badge variant="outline" className="text-xs">
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleDateString()}` : 'Not yet calculated'}
          </Badge>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-3xl font-bold ${getScoreColor()}`}>{score.toFixed(1)}</span>
            <span className="text-sm font-medium">{getScoreLabel()}</span>
          </div>
          <Progress value={score} className={`h-2 ${getProgressColor()}`} />
        </div>

        {factors && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Score Factors</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Completed Projects</p>
                  <p className="font-medium">{factors.completedProjects}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-gray-600">Positive Ratings</p>
                  <p className="font-medium">{factors.positiveRatings}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Repeat Clients</p>
                  <p className="font-medium">{factors.clientRetention}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Avg Response Time</p>
                  <p className="font-medium">{factors.responseTime.toFixed(1)}h</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Missed Deadlines</p>
                  <p className="font-medium">{factors.missedDeadlines}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Admin Complaints</p>
                  <p className="font-medium">{factors.adminComplaints}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {score < 40 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-sm font-medium text-red-800">Performance Improvement Plan Required</p>
            </div>
            <p className="text-xs text-red-700 mt-1">
              This talent's trust score is below the acceptable threshold. Consider removing from auction marketing and implementing a performance improvement plan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}