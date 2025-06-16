import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@supabase/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import { toast } from 'sonner';
import { BadgeCheck, CalendarIcon, Clock, FileText, Link as LinkIcon, Target, Users, MessageSquare, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function TalentProjectDetail() {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const { userRole, authUser, loading } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*, project_briefs(*)')
        .eq('id', project_id)
        .single();

      if (!error) {
        setProject(data);
        if (data?.talent_id) {
          const { data: talent, error: talentError } = await supabase
            .from('talent_profiles')
            .select('full_name, experience_badge, portfolio_url')
            .eq('id', data.talent_id)
            .single();
          if (!talentError) setTalentProfile(talent);
        }
      }
    };

    fetchProject();
  }, [project_id]);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Specialist':
        return 'bg-[#2F2F2F] text-white';
      case 'Pro Talent':
        return 'bg-[#00D1C1] text-white';
      case 'Expert Talent':
        return 'bg-indigo-100 text-[#2E3A8C]';
      default:
        return 'bg-gray-200 text-gray-500';
    }
  };

  if (loading) return <p className="p-6 text-center text-gray-600">Loading...</p>;
  if (userRole !== 'talent') return <p className="p-6 text-center text-red-600">Unauthorized</p>;
  if (!project) return <p className="p-6 text-center text-gray-600">Loading project details...</p>;

  // Calculate talent earnings (85% of total)
  const talentEarnings = project.estimated_hours * project.hourly_rate * 0.85;
  const m = project.metadata?.marketing || {};
  const r = project.metadata?.requestor || {};
  const username = authUser?.user_metadata?.username || authUser?.id;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[#2E3A8C] mb-2">{project.title}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {project.category}
            </Badge>
            <Badge variant={project.status === 'approved' ? 'success' : 'secondary'}>
              {project.status === 'approved' ? (
                <BadgeCheck className="w-4 h-4 mr-1" />
              ) : (
                <Clock className="w-4 h-4 mr-1" />
              )}
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {project.estimated_hours}h @ ${project.hourly_rate}/hr
          </div>
          <div className="text-sm font-medium text-[#2E3A8C]">
            Your Earnings: ${talentEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Project Details
            </h3>
            <div className="space-y-3 text-sm">
              <p><strong>Description:</strong> {project.description}</p>
              <p><strong>Problem:</strong> {m.problem}</p>
              <p><strong>Deliverables:</strong> {m.deliverables}</p>
              {project.deadline && (
                <p className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                </p>
              )}
              {project.brief_url && (
                <p>
                  <a
                    href={project.brief_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View Project Brief
                  </a>
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Target Audience & Channels
            </h3>
            <div className="space-y-3 text-sm">
              <p><strong>Target Audience:</strong> {m.target_audience}</p>
              <p><strong>Platforms:</strong> {m.platforms}</p>
              <p><strong>Preferred Tools:</strong> {m.preferred_tools}</p>
              <p><strong>Brand Voice:</strong> {m.brand_voice}</p>
              {m.inspiration_links && (
                <div>
                  <strong>Inspiration:</strong>
                  <div className="mt-1">
                    {m.inspiration_links.split(',').map((link: string, i: number) => (
                      <a
                        key={i}
                        href={link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline mb-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {new URL(link.trim()).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Project Team
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Client</h4>
              <div className="space-y-1 text-sm">
                <p>{r.name}</p>
                <p>{r.company}</p>
                <p className="text-gray-600">{r.email}</p>
                <p className="text-gray-600">{r.phone}</p>
              </div>
            </div>

            {talentProfile && (
              <div>
                <h4 className="text-sm font-medium mb-2">Your Profile</h4>
                <div className="space-y-2">
                  <p className="text-sm">{talentProfile.full_name}</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${getBadgeStyle(talentProfile.experience_badge)}`}>
                    <BadgeCheck className="w-4 h-4" />
                    {talentProfile.experience_badge}
                  </span>
                  {talentProfile.portfolio_url && (
                    <a
                      href={talentProfile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      <LinkIcon className="w-3 h-3" />
                      View Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {project.client_review && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Client Review
            </h3>
            <p className="text-gray-800">{project.client_review}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => navigate(`/talent/${username}/projects/${project_id}/workspace`)}
          className="bg-[#2E3A8C] hover:bg-[#2E3A8C]/90 text-white"
        >
          Go to Workspace
        </Button>
      </div>
    </div>
  );
}

export default TalentProjectDetail;