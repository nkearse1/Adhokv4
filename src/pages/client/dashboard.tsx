import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';
import { supabase } from '@supabase/supabaseClient';
import { toast } from 'sonner';
import { Plus, Briefcase, CheckCircle, Clock } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: string;
  deadline: string;
  project_budget: number;
  bids?: number;
}

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { authUser, userId, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchProjects();
    }
  }, [isAuthenticated, userId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          status,
          deadline,
          project_budget,
          project_bids(count)
        `)
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
        return;
      }

      const formattedProjects = data?.map(project => ({
        ...project,
        bids: project.project_bids?.[0]?.count || 0
      })) || [];

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

  const getProjectUrl = (project: Project) => {
    const userId = authUser?.id;
    const workspacePhases = ['picked_up', 'submitted', 'revisions', 'approved', 'completed'];
    return workspacePhases.includes(project.status)
      ? `/client/${userId}/projects/${project.id}/workspace`
      : `/client/${userId}/projects/${project.id}/details`;
  };

  const getButtonText = (status: string) => {
    const workspacePhases = ['picked_up', 'submitted', 'revisions', 'approved', 'completed'];
    return workspacePhases.includes(status) ? 'View Workspace' : 'View Details';
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      draft: 'Draft',
      open: 'Open',
      picked_up: 'Picked Up',
      submitted: 'Submitted',
      revisions: 'Revisions',
      approved: 'Approved',
      completed: 'Completed'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status: string) => {
    const isActive = ['open', 'picked_up', 'submitted', 'revisions'].includes(status);
    const isComplete = ['approved', 'completed'].includes(status);

    if (isComplete) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (isActive) {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      {/* Mobile-responsive header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-neutral">Client Dashboard</h1>
        <Button 
          onClick={() => navigate('/upload')} 
          className="w-full sm:w-auto bg-[#00D1C1] text-white hover:bg-[#00b4ab]"
        >
          <Plus className="mr-2 w-4 h-4" /> Post New Project
        </Button>
      </div>

      {/* Mobile-responsive project grid */}
      <div className="grid gap-4">
        {projects.length > 0 ? (
          projects.map((proj) => (
            <div key={proj.id} className="border rounded-lg p-4 shadow-sm">
              {/* Mobile-responsive project content */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">{proj.title}</h2>
                  <p className="text-sm text-gray-500">Deadline: {formatDate(proj.deadline)}</p>
                  <p className="text-sm text-gray-500">Budget: ${proj.project_budget?.toLocaleString()}</p>
                </div>
                <Button 
                  onClick={() => navigate(getProjectUrl(proj))}
                  className="w-full sm:w-auto bg-[#2E3A8C] text-white hover:bg-[#2E3A8C]/90"
                >
                  {getButtonText(proj.status)}
                </Button>
              </div>
              
              {/* Mobile-responsive project metadata */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" /> {proj.bids || 0} Bids
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(proj.status)}
                  {getStatusDisplay(proj.status)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No projects yet. Create your first project to get started!</p>
            <Button 
              onClick={() => navigate('/upload')} 
              className="bg-[#00D1C1] text-white hover:bg-[#00b4ab]"
            >
              <Plus className="mr-2 w-4 h-4" /> Post Your First Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}