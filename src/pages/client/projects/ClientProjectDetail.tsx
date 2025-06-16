import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@supabase/supabaseClient';
import { useAuth } from '@/lib/useAuth';
import { toast } from 'sonner';
import { BadgeCheck, CalendarIcon, Clock, FileText, Link as LinkIcon, Target, Users, MessageSquare, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ClientProjectDetail() {
  const { project_id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [talentProfile, setTalentProfile] = useState<any>(null);
  const [approving, setApproving] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const { userRole, loading } = useAuth();

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

  const handleApprove = async () => {
    setApproving(true);
    
    const { error } = await supabase
      .from('projects')
      .update({ status: 'approved' })
      .eq('id', project.id);
    
    if (error) toast.error('Approval failed');
    else {
      toast.success('Approved!');
      setProject({ ...project, status: 'approved' });
    }
    setApproving(false);
  };

  const handleLeaveReview = async () => {
    const review = prompt('Leave your review:');
    if (!review) return;

    setReviewing(true);

    const { error } = await supabase
      .from('projects')
      .update({ client_review: review })
      .eq('id', project.id);
    
    error ? toast.error('Review failed') : toast.success('Review submitted');
    setReviewing(false);
  };

  if (loading) return <p className="p-6 text-center text-gray-600">Loading...</p>;
  if (userRole !== 'client') return <p className="p-6 text-center text-red-600">Unauthorized</p>;
  if (!project) return <p className="p-6 text-center text-gray-600">Loading project details...</p>;

  const totalBudget = project.estimated_hours * project.hourly_rate;
  const m = project.metadata?.marketing || {};
  const r = project.metadata?.requestor || {};

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Mobile-responsive header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-[#2E3A8C] mb-2 break-words">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
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
        <div className="text-right w-full sm:w-auto">
          <div className="text-sm text-gray-600">
            {project.estimated_hours}h @ ${project.hourly_rate}/hr
          </div>
          <div className="text-sm font-medium text-[#2E3A8C]">
            Total Budget: ${totalBudget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Mobile-responsive project details card */}
      <Card>
        <CardContent className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Mobile-responsive team section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Project Team
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Client</h4>
              <div className="space-y-1 text-sm">
                <p>{r.name}</p>
                <p>{r.company}</p>
                <p className="text-gray-600 break-all">{r.email}</p>
                <p className="text-gray-600">{r.phone}</p>
              </div>
            </div>

            {talentProfile && (
              <div>
                <h4 className="text-sm font-medium mb-2">Assigned Talent</h4>
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
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Your Review
            </h3>
            <p className="text-gray-800 break-words">{project.client_review}</p>
          </CardContent>
        </Card>
      )}

      {/* Mobile-responsive action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleApprove}
          disabled={approving || project.status === 'approved'}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
        >
          {approving ? 'Approving...' : project.status === 'approved' ? 'Work Approved' : 'Approve Work'}
        </Button>
        <Button
          onClick={handleLeaveReview}
          disabled={reviewing}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {reviewing ? 'Submitting...' : 'Leave Review'}
        </Button>
      </div>
    </div>
  );
}