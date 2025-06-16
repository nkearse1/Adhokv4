import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Users, Flag, Briefcase, DollarSign, ThumbsDown, Shield } from 'lucide-react';
import { supabase } from '@supabase/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import { toast } from 'sonner';
import AdminTalentList from '@/components/AdminTalentList';
import AdminProjectList from '@/components/AdminProjectList';
import RevenuePanel from '@/components/RevenuePanel';
import AdminClientList from '@/components/AdminClientList';
import AdminAlerts from '@/components/AdminAlerts';
import TrustScoreList from '@/components/admin/TrustScoreList';

interface DashboardMetrics {
  totalProjects: number;
  activeTalents: number;
  flaggedProjects: number;
  estRevenue: number;
  revPerTalent: number;
  negReviews: number;
  lowTrustTalents: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjects: 0,
    activeTalents: 0,
    flaggedProjects: 0,
    estRevenue: 0,
    revPerTalent: 0,
    negReviews: 0,
    lowTrustTalents: 0
  });
  const [loading, setLoading] = useState(true);
  const { isAdmin, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchDashboardMetrics();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);

      // Fetch total projects
      const { count: projectCount, error: projectError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Fetch active talents
      const { count: talentCount, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_qualified', true);

      // Fetch flagged projects
      const { count: flaggedCount, error: flaggedError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('flagged', true);

      // Fetch revenue data
      const { data: revenueData, error: revenueError } = await supabase
        .from('projects')
        .select('project_budget')
        .not('project_budget', 'is', null);

      // Fetch negative reviews
      const { count: negReviewCount, error: reviewError } = await supabase
        .from('project_reviews')
        .select('*', { count: 'exact', head: true })
        .lt('rating', 3);
        
      // Fetch low trust score talents
      const { count: lowTrustCount, error: trustError } = await supabase
        .from('talent_profiles')
        .select('*', { count: 'exact', head: true })
        .lt('trust_score', 40)
        .not('trust_score', 'is', null);

      if (projectError || talentError || flaggedError || revenueError || reviewError || trustError) {
        console.error('Error fetching metrics:', { projectError, talentError, flaggedError, revenueError, reviewError, trustError });
        toast.error('Failed to load dashboard metrics');
        return;
      }

      const totalRevenue = revenueData?.reduce((sum, project) => sum + (project.project_budget || 0), 0) || 0;
      const platformRevenue = totalRevenue * 0.15; // 15% platform fee
      const activeTalentCount = talentCount || 0;

      setMetrics({
        totalProjects: projectCount || 0,
        activeTalents: activeTalentCount,
        flaggedProjects: flaggedCount || 0,
        estRevenue: platformRevenue,
        revPerTalent: activeTalentCount > 0 ? platformRevenue / activeTalentCount : 0,
        negReviews: negReviewCount || 0,
        lowTrustTalents: lowTrustCount || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-red-600">Unauthorized access. Admin privileges required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3A8C]">Admin Dashboard</h1>
        <Button className="w-full sm:w-auto" onClick={() => setActiveTab('projects')}>
          Manage Projects
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold">{metrics.totalProjects}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Talents</p>
              <p className="text-2xl font-bold">{metrics.activeTalents}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Platform Revenue</p>
              <p className="text-2xl font-bold">${metrics.estRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <Flag className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Flagged Projects</p>
              <p className="text-2xl font-bold">{metrics.flaggedProjects}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <Shield className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Low Trust Talents</p>
              <p className="text-2xl font-bold">{metrics.lowTrustTalents}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center">
            <ThumbsDown className="h-8 w-8 text-pink-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Negative Reviews</p>
              <p className="text-2xl font-bold">{metrics.negReviews}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="talent">Talent</TabsTrigger>
          <TabsTrigger value="trust">Trust Scores</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <AdminAlerts />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenuePanel />
        </TabsContent>

        <TabsContent value="talent">
          <AdminTalentList />
        </TabsContent>
        
        <TabsContent value="trust">
          <TrustScoreList />
        </TabsContent>

        <TabsContent value="clients">
          <AdminClientList />
        </TabsContent>

        <TabsContent value="projects">
          <AdminProjectList />
        </TabsContent>
      </Tabs>
    </div>
  );
}