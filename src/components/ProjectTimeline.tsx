import React from 'react'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight, 
  MessageSquare, 
  FileText, 
  CheckCircle, 
  CreditCard, 
  Clock,
  AlertCircle,
  Target,
  Play,
  TrendingUp
} from 'lucide-react'

interface ProjectTimelineProps {
  status: string
  role?: 'client' | 'talent' | 'admin'
  onTabChange?: (tab: string) => void
  approvalProgress?: {
    approved: number
    total: number
    percentage: number
  }
  hasTrackingInfo?: boolean
  onAddTracking?: () => void
}

const clientSteps = [
  'Draft',
  'Live',
  'Picked Up',
  'Scope Defined',
  'Submitted',
  'Revisions',
  'Final Payment',
  'Approved',
  'Performance Tracking',
  'Complete'
]

const talentSteps = [
  'Draft',
  'Live',
  'Picked Up',
  'Scope Defined',
  'Submitted',
  'Revisions',
  'Final Payment',
  'Approved',
  'Performance Tracking',
  'Complete'
]

interface ActionPrompt {
  title: string
  description: string
  action: string
  icon: React.ReactNode
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  tab?: string
  onClick?: () => void
}

const getActionPrompt = (
  status: string, 
  role: string, 
  approvalProgress?: { approved: number; total: number; percentage: number },
  hasTrackingInfo?: boolean,
  onAddTracking?: () => void
): ActionPrompt | null => {
  const prompts: Record<string, Record<string, ActionPrompt>> = {
    'Live': {
      talent: {
        title: 'Project Available',
        description: 'This project is waiting for a qualified talent to pick it up.',
        action: 'Pick Up Project',
        icon: <Target className="h-4 w-4" />,
        variant: 'default',
        tab: 'deliverables'
      }
    },
    'Picked Up': {
      talent: {
        title: 'Recommend Initial Deliverables',
        description: 'Start by recommending deliverables to define the project scope.',
        action: 'Add Deliverables',
        icon: <FileText className="h-4 w-4" />,
        variant: 'default',
        tab: 'deliverables'
      },
      client: {
        title: 'Review Talent Recommendations',
        description: 'Your assigned talent will recommend deliverables for your approval.',
        action: 'View Deliverables',
        icon: <FileText className="h-4 w-4" />,
        variant: 'outline',
        tab: 'deliverables'
      }
    },
    'Scope Defined': {
      talent: {
        title: 'Start Working',
        description: 'Begin work on the approved deliverables.',
        action: 'Start Work',
        icon: <Play className="h-4 w-4" />,
        variant: 'default',
        tab: 'deliverables'
      },
      client: {
        title: 'Work in Progress',
        description: 'Your talent is working on the approved deliverables.',
        action: 'Monitor Progress',
        icon: <Clock className="h-4 w-4" />,
        variant: 'outline',
        tab: 'deliverables'
      }
    },
    'Submitted': {
      talent: {
        title: 'Work Submitted',
        description: 'Your deliverables are under client review.',
        action: 'View Submission',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'outline',
        tab: 'deliverables'
      },
      client: {
        title: 'Review Submitted Work',
        description: 'Review the submitted deliverables and provide feedback.',
        action: 'Review Work',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'default',
        tab: 'deliverables'
      }
    },
    'Revisions': {
      talent: {
        title: 'Address Client Feedback',
        description: 'Review client feedback and make necessary revisions.',
        action: 'View Feedback',
        icon: <MessageSquare className="h-4 w-4" />,
        variant: 'default',
        tab: 'chat'
      },
      client: {
        title: 'Revisions in Progress',
        description: 'Your talent is addressing the feedback you provided.',
        action: 'Monitor Progress',
        icon: <Clock className="h-4 w-4" />,
        variant: 'outline',
        tab: 'deliverables'
      }
    },
    'Final Payment': {
      client: {
        title: approvalProgress && approvalProgress.approved < approvalProgress.total 
          ? 'Approve All Deliverables First'
          : 'Process Final Payment',
        description: approvalProgress && approvalProgress.approved < approvalProgress.total
          ? `${approvalProgress.approved}/${approvalProgress.total} deliverables approved. All deliverables must be approved before final payment.`
          : 'All deliverables approved. Release the final payment.',
        action: approvalProgress && approvalProgress.approved < approvalProgress.total 
          ? 'Review Deliverables' 
          : 'Final Payment',
        icon: approvalProgress && approvalProgress.approved < approvalProgress.total 
          ? <FileText className="h-4 w-4" />
          : <CreditCard className="h-4 w-4" />,
        variant: approvalProgress && approvalProgress.approved < approvalProgress.total 
          ? 'outline' 
          : 'default',
        tab: approvalProgress && approvalProgress.approved < approvalProgress.total 
          ? 'deliverables' 
          : 'payment'
      },
      talent: {
        title: 'Final Payment Processing',
        description: approvalProgress && approvalProgress.approved < approvalProgress.total
          ? `${approvalProgress.approved}/${approvalProgress.total} deliverables approved. Waiting for client to approve all deliverables.`
          : 'Client is processing the final payment.',
        action: 'View Status',
        icon: <Clock className="h-4 w-4" />,
        variant: 'outline',
        tab: 'deliverables'
      }
    },
    'Approved': {
      client: {
        title: hasTrackingInfo ? 'Ready for Performance Tracking' : 'Add Performance Tracking',
        description: hasTrackingInfo 
          ? 'All deliverables approved. Performance tracking information added.'
          : 'Add performance tracking information to monitor ongoing results.',
        action: hasTrackingInfo ? 'Start Tracking' : 'Add Tracking Info',
        icon: <TrendingUp className="h-4 w-4" />,
        variant: 'default',
        tab: 'tracking',
        onClick: onAddTracking
      },
      talent: {
        title: 'Work Approved!',
        description: 'All your deliverables have been approved. Performance tracking will begin soon.',
        action: 'View Status',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'outline',
        tab: 'deliverables'
      }
    },
    'Performance Tracking': {
      client: {
        title: 'Performance Tracking Active',
        description: 'Monitor the ongoing performance and results of the completed work.',
        action: 'View Metrics',
        icon: <TrendingUp className="h-4 w-4" />,
        variant: 'outline',
        tab: 'tracking'
      },
      talent: {
        title: 'Performance Tracking',
        description: 'Your work is being tracked for performance and results.',
        action: 'View Performance',
        icon: <TrendingUp className="h-4 w-4" />,
        variant: 'outline',
        tab: 'tracking'
      }
    },
    'Complete': {
      client: {
        title: 'Project Complete',
        description: 'Project has been successfully completed and archived.',
        action: 'View Summary',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'outline',
        tab: 'activity'
      },
      talent: {
        title: 'Project Complete',
        description: 'Congratulations! This project has been successfully completed.',
        action: 'View Summary',
        icon: <CheckCircle className="h-4 w-4" />,
        variant: 'outline',
        tab: 'activity'
      }
    }
  }

  return prompts[status]?.[role] || null
}

export default function ProjectTimeline({ 
  status, 
  role, 
  onTabChange, 
  approvalProgress,
  hasTrackingInfo = false,
  onAddTracking
}: ProjectTimelineProps) {
  const { userRole } = useAuth()
  const resolvedRole = role || userRole || 'client'
  const steps = resolvedRole === 'talent' ? talentSteps : clientSteps
  const currentIndex = steps.indexOf(status)
  const actionPrompt = getActionPrompt(status, resolvedRole, approvalProgress, hasTrackingInfo, onAddTracking)

  const handleActionClick = () => {
    if (actionPrompt?.onClick) {
      actionPrompt.onClick()
    } else if (actionPrompt?.tab && onTabChange) {
      onTabChange(actionPrompt.tab)
    }
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="w-full overflow-x-auto">
        <div className="flex items-center justify-between space-x-2 min-w-max px-4">
          {steps.map((step, idx) => {
            const isComplete = idx < currentIndex
            const isCurrent = idx === currentIndex
            const isPayment = step.includes('Payment')
            const isTracking = step === 'Performance Tracking'
            
            return (
              <div key={step} className="flex-1 min-w-[80px] text-center">
                <div
                  className={`mx-auto mb-1 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isComplete
                      ? isPayment 
                        ? 'bg-[#00A499] text-white shadow-lg' 
                        : isTracking
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-[#00A499] text-white shadow-lg'
                      : isCurrent
                      ? isPayment
                        ? 'bg-[#00A499] text-white shadow-lg ring-2 ring-[#00A499]/30'
                        : isTracking
                        ? 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-500/30'
                        : 'bg-[#2E3A8C] text-white shadow-lg ring-2 ring-[#2E3A8C]/30'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <p className={`text-xs transition-all ${
                  isCurrent 
                    ? 'font-semibold text-[#2E3A8C]' 
                    : isComplete 
                    ? 'font-medium text-gray-700'
                    : 'text-gray-600'
                }`}>
                  {step}
                </p>
                {isCurrent && (
                  <Badge variant="secondary" className="mt-1 text-xs bg-blue-50 text-blue-700">
                    Current
                  </Badge>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Approval Progress for Final Payment */}
      {status === 'Final Payment' && approvalProgress && approvalProgress.total > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">Deliverable Approval Progress</h4>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {approvalProgress.approved}/{approvalProgress.total} Approved
            </Badge>
          </div>
          <Progress value={approvalProgress.percentage} className="h-2 mb-2" />
          <p className="text-sm text-blue-700">
            {approvalProgress.approved === approvalProgress.total 
              ? 'All deliverables approved! Ready for final payment.'
              : `${approvalProgress.total - approvalProgress.approved} deliverable${approvalProgress.total - approvalProgress.approved !== 1 ? 's' : ''} still need${approvalProgress.total - approvalProgress.approved === 1 ? 's' : ''} approval.`
            }
          </p>
        </div>
      )}

      {/* Tracking Info Status for Approved */}
      {status === 'Approved' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-purple-900">Performance Tracking Setup</h4>
            <Badge variant="secondary" className={hasTrackingInfo ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
              {hasTrackingInfo ? 'Ready' : 'Pending'}
            </Badge>
          </div>
          <p className="text-sm text-purple-700">
            {hasTrackingInfo 
              ? 'Performance tracking information has been added. Project will move to tracking phase.'
              : 'Add performance tracking information to monitor ongoing results and move to the tracking phase.'
            }
          </p>
        </div>
      )}

      {/* Action Prompt */}
      {actionPrompt && (
        <Alert className="border-l-4 border-l-[#2E3A8C] bg-blue-50/50">
          <AlertCircle className="h-4 w-4 text-[#2E3A8C]" />
          <AlertDescription className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-semibold text-[#2E3A8C]">
                {actionPrompt.title}
              </div>
              <div className="text-sm text-gray-700">
                {actionPrompt.description}
              </div>
            </div>
            <Button
              variant={actionPrompt.variant}
              size="sm"
              onClick={handleActionClick}
              className="ml-4 flex items-center gap-2 whitespace-nowrap"
            >
              {actionPrompt.icon}
              {actionPrompt.action}
              <ArrowRight className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Next Step Preview */}
      {currentIndex < steps.length - 1 && (
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-1">Next Step:</div>
          <div className="font-medium text-[#2E3A8C]">{steps[currentIndex + 1]}</div>
        </div>
      )}
    </div>
  )
}