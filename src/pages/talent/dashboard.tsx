import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@supabase/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import {
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import TalentEarnings from "@/components/TalentEarnings";
import CaseStudyModal from "@/components/CaseStudyModal";

interface Deliverable {
  id: string;
  title: string;
  description?: string;
}

interface CaseStudy {
  id: string;
  summary: string;
  outcome: string;
  deliverableId?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  project_budget: number;
  rate_per_hour?: number;
  bidCount?: number;
  lastBid?: number;
  deliverables?: Deliverable[];
  caseStudy?: CaseStudy;
  metadata?: {
    marketing?: {
      expertiseLevel?: string;
    };
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  expertise: string;
  location?: string;
  rate?: number;
  linkedin_url?: string;
  is_qualified: boolean;
  metadata?: {
    marketing?: {
      expertiseLevel?: string;
    };
  };
}

export default function TalentDashboard() {
  const navigate = useNavigate();
  const { userId, authUser, isAuthenticated, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    activeBids: 0,
    totalEarnings: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState<"activeBids" | "wonProjects" | "earnings" | "portfolio">("activeBids");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && userId) {
      fetchTalentData();
    }
  }, [authLoading, isAuthenticated, userId]);

  const fetchTalentData = async () => {
    try {
      setLoading(true);

      // Fetch talent profile
      const { data: profileData, error: profileError } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch projects where talent has bid or won - specify the relationship explicitly
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_bids!project_bids_project_id_fkey!inner(
            id,
            rate_per_hour,
            professional_id
          )
        `)
        .eq('project_bids.professional_id', userId)
        .order('created_at', { ascending: false });

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      } else if (projectsData) {
        setProjects(projectsData);
        
        // Calculate stats
        const activeBids = projectsData.filter(p => p.status === 'open').length;
        const completedProjects = projectsData.filter(p => p.status === 'completed').length;
        const totalEarnings = projectsData
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + (p.project_budget || 0), 0);

        setStats({
          activeBids,
          totalEarnings,
          completedProjects,
        });
      }

    } catch (error) {
      console.error('Error fetching talent data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCaseStudy = async (projectId: string, newData: CaseStudy) => {
    try {
      // In a real implementation, you'd save this to a case_studies table
      // For now, we'll just update the local state
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId ? { ...project, caseStudy: newData } : project
        )
      );
      toast.success("Case study saved!");
    } catch (error) {
      console.error('Error saving case study:', error);
      toast.error('Failed to save case study');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
      <div className="max-w-6xl mx-auto p-4 sm:p-6 text-center">
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  const statLabelMap = {
    activeBids: "Active Bids",
    wonProjects: "Won Projects",
    earnings: "Total Earnings",
    portfolio: "Completed Projects",
  };

  const statValueMap = {
    activeBids: stats.activeBids,
    wonProjects: stats.completedProjects,
    earnings: `$${stats.totalEarnings.toLocaleString()}`,
    portfolio: stats.completedProjects,
  };

  const filteredProjects = projects.filter((p) => {
    if (currentTab === "activeBids") return p.status !== "completed";
    if (currentTab === "wonProjects") return p.status === "completed";
    if (currentTab === "portfolio") return p.status === "completed";
    return false;
  });

  const username = authUser?.user_metadata?.username || authUser?.id;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Mobile-responsive header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3A8C]">Talent Dashboard</h1>
        <Button 
          onClick={() => navigate(`/talent/${username}/projects`)}
          className="w-full sm:w-auto"
        >
          Browse Projects
        </Button>
      </div>

      {/* Mobile-responsive stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.keys(statLabelMap).filter(tab => tab !== currentTab).map((tab) => (
          <Card
            key={tab}
            className="cursor-pointer hover:shadow-md transition-shadow"
            style={{ borderColor: "#00A499" }}
            onClick={() => setCurrentTab(tab as typeof currentTab)}
          >
            <CardContent className="p-4">
              <h3 className="text-sm text-gray-600">{statLabelMap[tab]}</h3>
              <p className="text-xl sm:text-2xl font-bold">{statValueMap[tab]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-lg sm:text-xl font-semibold text-[#2E3A8C] mb-4">{statLabelMap[currentTab]}</h2>

      {/* Mobile-responsive content */}
      <div className="space-y-4">
        {currentTab === "portfolio" ? (
          filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <div key={project.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                  <h3 className="font-semibold text-lg text-[#2E3A8C] break-words">{project.title}</h3>
                  <Badge variant="outline">Complete</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Deadline: {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                </p>
                {project.caseStudy ? (
                  <div className="bg-gray-50 p-3 rounded-md mb-2 text-sm">
                    <p className="font-medium text-[#2E3A8C] mb-1">📘 Case Study Summary</p>
                    <p className="break-words">{project.caseStudy.summary}</p>
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-500 mb-2">No case study submitted yet.</p>
                )}
                <Button 
                  variant="secondary" 
                  onClick={() => setEditingProjectId(project.id)}
                  className="w-full sm:w-auto"
                >
                  {project.caseStudy ? "Edit Case Study" : "Add Case Study"}
                </Button>

                {editingProjectId === project.id && (
                  <CaseStudyModal
                    open={true}
                    onClose={() => setEditingProjectId(null)}
                    deliverables={project.deliverables || []}
                    initialData={project.caseStudy}
                    onSubmit={(newData) => {
                      handleSaveCaseStudy(project.id, newData);
                      setEditingProjectId(null);
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No completed projects yet.</p>
          )
        ) : currentTab === "earnings" ? (
          <TalentEarnings />
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <div key={project.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <h3 className="font-semibold text-lg text-[#2E3A8C] break-words">{project.title}</h3>
                <Badge variant="secondary">{project.status}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{project.description}</p>
              <p className="text-sm text-gray-600">
                Budget: ${project.project_budget?.toLocaleString() || 'N/A'}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No projects in this category.</p>
        )}
      </div>
    </div>
  );
}