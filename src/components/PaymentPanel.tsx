import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PaymentPanelProps {
  estimatedBudget: number;
  estimatedHours: number;
  hourlyRate: number;
  onPayment: () => void;
  approvalProgress?: {
    approved: number;
    total: number;
    percentage: number;
  };
  projectStatus?: string;
}

export default function PaymentPanel({ 
  estimatedBudget, 
  estimatedHours, 
  hourlyRate, 
  onPayment,
  approvalProgress,
  projectStatus
}: PaymentPanelProps) {
  const canProcessFinalPayment = projectStatus === 'Final Payment' && 
    approvalProgress && 
    approvalProgress.approved === approvalProgress.total;

  return (
    <div className="bg-white border border-[#E6E9F4] rounded-lg p-4 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-[#2E3A8C] mb-4">Payment Management</h3>

      <div className="space-y-6">
        {/* Mobile-responsive budget grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Project Budget</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Budget</span>
                <span className="font-semibold">${estimatedBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Hours</span>
                <span className="text-sm">{estimatedHours}h @ ${hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform Fee (15%)</span>
                <span className="text-sm">${(estimatedBudget * 0.15).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">Payment Status</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium">Initial Payment (50%)</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Paid
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Final Payment (50%)</span>
                <Badge variant={canProcessFinalPayment ? "secondary" : "outline"} 
                       className={canProcessFinalPayment ? "bg-yellow-100 text-yellow-800" : ""}>
                  {canProcessFinalPayment ? (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Ready
                    </>
                  ) : (
                    'Pending Approval'
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Progress Section */}
        {projectStatus === 'Final Payment' && approvalProgress && approvalProgress.total > 0 && (
          <div className="border-t pt-6">
            <h4 className="font-medium text-gray-800 mb-3">Deliverable Approval Progress</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {approvalProgress.approved} of {approvalProgress.total} deliverables approved
                </span>
                <span className="text-sm font-medium">
                  {approvalProgress.percentage}%
                </span>
              </div>
              <Progress value={approvalProgress.percentage} className="h-2" />
              <p className="text-sm text-gray-600">
                {approvalProgress.approved === approvalProgress.total 
                  ? 'All deliverables approved! Final payment can be processed.'
                  : `${approvalProgress.total - approvalProgress.approved} deliverable${approvalProgress.total - approvalProgress.approved !== 1 ? 's' : ''} still need${approvalProgress.total - approvalProgress.approved === 1 ? 's' : ''} your approval before final payment.`
                }
              </p>
            </div>
          </div>
        )}

        {/* Mobile-responsive action buttons */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onPayment}
              disabled={!canProcessFinalPayment}
              className={`w-full sm:flex-1 ${canProcessFinalPayment 
                ? "bg-[#00A499] text-white hover:bg-[#00A499]/90" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {canProcessFinalPayment ? 'Process Final Payment' : 'Approve All Deliverables First'}
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              View Payment History
            </Button>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {projectStatus === 'Final Payment' && approvalProgress && approvalProgress.approved < approvalProgress.total ? (
              <>
                <strong>Final payment is pending:</strong> All deliverables must be approved before the final payment can be processed. 
                Review and approve each deliverable in the Deliverables tab.
              </>
            ) : (
              <>
                Payments are processed securely through our platform. Initial payment is due upon project acceptance, 
                with final payment released upon completion approval.
              </>
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}