import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CalendarIcon, Clock, ExternalLink, User, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProjectTimeline from '@/components/ProjectTimeline';
import DeliverablesPanel from '@/components/DeliverablesPanel';
import ActivityLog from '@/components/ActivityLog';
import PaymentPanel from '@/components/PaymentPanel';
import ChatPanel from '@/components/ChatPanel';
import { useProjectStatus } from '@/hooks/useProjectStatus';
import { useEscrow } from '@/hooks/useEscrow';
import { useAuth } from '@/lib/useAuth';
import { toast } from 'sonner';

export default function ClientProjectWorkspace() {
  const { project_id } = useParams();
  const { authUser } = useAuth();
  const [projectName] = useState("SEO Optimization");
  const [projectDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [projectStartDate] = useState(new Date());
  const [estimatedHours] = useState(40);
  const [hourlyRate] = useState(75);
  const [estimatedBudget] = useState(estimatedHours * hourlyRate);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);
  const [trackingData, setTrackingData] = useState({
    metrics: '',
    goals: '',
    trackingPeriod: '3',
    tools: ''
  });

  const {
  projectStatus,
  deliverables,
  activityLog,
  loading,
  hasTrackingInfo,
  updateDeliverableStatus,
  addDeliverable,
  updateDeliverable,
  addActivityLogEntry,
  addTrackingInfo,
  getApprovalProgress,
  canAccess,
  statusReady
} = useProjectStatus(project_id);

  const {
    escrowStatus,
    requestEscrowRelease,
    approveEscrowRelease,
    rejectEscrowRelease,
    overrideEscrow
  } = useEscrow(project_id);

  // Get approval progress for timeline
  const approvalProgress = getApprovalProgress();

  const handleTabChange = (tab: string) => {
    const tabElement = document.querySelector(`[value="${tab}"]`) as HTMLElement;
    if (tabElement) {
      tabElement.click();
    }
  };

  const handlePayment = () => {
    addActivityLogEntry('Client initiated payment process');
    toast.success('Payment processed successfully');
  };

  const handleAddTracking = () => {
    setShowTrackingDialog(true);
  };

  const handleSaveTracking = () => {
    if (!trackingData.metrics || !trackingData.goals) {
      toast.error('Please fill in all required fields');
      return;
    }

    addTrackingInfo(trackingData);
    setShowTrackingDialog(false);
    toast.success('Performance tracking information added');
  };

 if (loading || !statusReady) {
  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3A8C] mx-auto mb-4"></div>
        <p className="text-[#2E3A8C]">Loading project workspace...</p>
      </div>
    </div>
  );
}

if (!canAccess) {
  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center">
      <div className="text-center text-red-600 font-medium">
        You do not have access to this workspace.
      </div>
    </div>
  );
}

  const userId = authUser?.id;

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Mobile-responsive header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2E3A8C] break-words">{projectName}</h1>
        </div>

        <ProjectTimeline 
          status={projectStatus} 
          role="client" 
          onTabChange={handleTabChange}
          approvalProgress={approvalProgress}
          hasTrackingInfo={hasTrackingInfo}
          onAddTracking={handleAddTracking}
        />

        {/* Mobile-responsive project info card */}
        <div className="bg-white border border-[#E6E9F4] rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  {projectStatus}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Due {formatDistanceToNow(projectDeadline, { addSuffix: true })}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Escrow: {escrowStatus}
                </Badge>
                {/* Show approval progress badge if in Final Payment */}
                {projectStatus === 'Final Payment' && approvalProgress.total > 0 && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {approvalProgress.approved}/{approvalProgress.total} Approved
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2E3A8C]" />
                  <span>Deadline: {format(projectDeadline, 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2E3A8C]" />
                  <span>{estimatedHours} hours @ ${hourlyRate}/hr</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-[#2E3A8C]" />
                  <span className="text-sm font-medium">John Smith</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">Expert</Badge>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link to={`/client/${userId}/projects/${project_id}/details`}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Project Details
                  </Link>
                </Button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-[#2E3A8C]">
                Total Budget: ${estimatedBudget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Escrow Release Approval Section */}
        {escrowStatus === 'requested' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Payment Release Requested</h3>
                <p className="text-sm text-yellow-800">The talent has requested payment release from escrow</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button onClick={approveEscrowRelease} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Payment
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => rejectEscrowRelease('Needs more revisions')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}

        {escrowStatus === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-green-800">
                <strong>Payment Approved!</strong> - Escrow has been released to the talent
              </p>
            </div>
          </div>
        )}

        {escrowStatus === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">
                <strong>Payment Rejected</strong> - Escrow release was rejected. Please discuss with talent.
              </p>
            </div>
          </div>
        )}

        {/* Mobile-responsive tabs */}
        <Tabs defaultValue="deliverables" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white mb-6 rounded-lg border border-[#E6E9F4]">
            <TabsTrigger value="chat" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white text-xs sm:text-sm">
              Chat
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white text-xs sm:text-sm">
              Deliverables
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white text-xs sm:text-sm">
              Payment
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white text-xs sm:text-sm">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatPanel 
              role="client"
              projectId={project_id}
              partnerTypingLabel="Talent is typing..."
              deliverables={deliverables}
              projectStatus={projectStatus}
              onActivity={addActivityLogEntry}
            />
          </TabsContent>

          <TabsContent value="deliverables">
            <DeliverablesPanel 
              role="client"
              deliverables={deliverables}
              editable={false}
              showForm={false}
              projectDeadline={projectDeadline}
              projectStartDate={projectStartDate}
              onStatusChange={updateDeliverableStatus}
              onUpdateDeliverable={updateDeliverable}
            />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentPanel
              estimatedBudget={estimatedBudget}
              estimatedHours={estimatedHours}
              hourlyRate={hourlyRate}
              onPayment={handlePayment}
              approvalProgress={approvalProgress}
              projectStatus={projectStatus}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog
              role="client"
              deliverables={deliverables}
              activityLog={activityLog}
            />
          </TabsContent>
        </Tabs>

        {/* Performance Tracking Dialog */}
        <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Add Performance Tracking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metrics">Key Metrics to Track *</Label>
                <Textarea
                  id="metrics"
                  placeholder="e.g., Organic traffic, conversion rate, search rankings..."
                  value={trackingData.metrics}
                  onChange={(e) => setTrackingData({ ...trackingData, metrics: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="goals">Success Goals *</Label>
                <Textarea
                  id="goals"
                  placeholder="e.g., 25% increase in organic traffic, 15% improvement in conversion rate..."
                  value={trackingData.goals}
                  onChange={(e) => setTrackingData({ ...trackingData, goals: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="period">Tracking Period (months)</Label>
                <Input
                  id="period"
                  type="number"
                  min="3"
                  max="12"
                  value={trackingData.trackingPeriod}
                  onChange={(e) => setTrackingData({ ...trackingData, trackingPeriod: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tools">Tracking Tools</Label>
                <Input
                  id="tools"
                  placeholder="e.g., Google Analytics, Search Console, etc."
                  value={trackingData.tools}
                  onChange={(e) => setTrackingData({ ...trackingData, tools: e.target.value })}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowTrackingDialog(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={handleSaveTracking} className="flex-1">
                  Save Tracking Info
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}