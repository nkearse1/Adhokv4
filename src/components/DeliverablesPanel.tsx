import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Upload, FileText, ExternalLink, Trash2, AlertCircle, Target, TrendingUp, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import KanbanBoard from '@/components/KanbanBoard';
import { toast } from 'sonner';

interface TimeEntry {
  startTime: Date;
  endTime?: Date;
  hoursLogged?: number;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  problem?: string;
  kpis?: string[];
  status: 'recommended' | 'scoped' | 'in_progress' | 'approved' | 'performance_tracking';
  estimatedHours: number;
  actualHours: number;
  timeEntries: TimeEntry[];
  dueDate?: Date;
  files?: Array<{
    id: string;
    name: string;
    url: string;
    uploadedAt: Date;
  }>;
  isTracking?: boolean;
  currentSession?: {
    startTime: Date;
  };
}

interface DeliverablesPanelProps {
  role: 'talent' | 'client' | 'admin';
  deliverables?: Deliverable[];
  projectStartDate: Date;
  projectDeadline: Date;
  editable?: boolean;
  showForm?: boolean;
  onAddDeliverable?: (d: Partial<Deliverable>) => void;
  onStatusChange?: (id: string, newStatus: Deliverable['status']) => void;
  onUpdateDeliverable?: (id: string, updates: Partial<Deliverable>) => void;
}

export default function DeliverablesPanel({
  role,
  deliverables = [],
  projectStartDate,
  projectDeadline,
  editable = false,
  showForm = false,
  onAddDeliverable,
  onStatusChange,
  onUpdateDeliverable
}: DeliverablesPanelProps) {
  const [newDeliverable, setNewDeliverable] = useState({
    title: '',
    description: '',
    problem: '',
    kpis: [''],
    estimatedHours: 0
  });

  const handleAdd = () => {
    if (!newDeliverable.title || !newDeliverable.description || !newDeliverable.problem || !newDeliverable.estimatedHours) {
      toast.error('Please fill in all required fields');
      return;
    }

    const filteredKpis = newDeliverable.kpis.filter(kpi => kpi.trim() !== '');
    if (filteredKpis.length === 0) {
      toast.error('Please add at least one KPI');
      return;
    }

    const deliverable = {
      id: Date.now().toString(),
      ...newDeliverable,
      kpis: filteredKpis,
      status: 'recommended' as const
    };

    onAddDeliverable?.(deliverable);
    setNewDeliverable({ 
      title: '', 
      description: '', 
      problem: '', 
      kpis: [''], 
      estimatedHours: 0 
    });
    toast.success('Recommendation added successfully');
  };

  const handleKpiChange = (index: number, value: string) => {
    const newKpis = [...newDeliverable.kpis];
    newKpis[index] = value;
    setNewDeliverable({ ...newDeliverable, kpis: newKpis });
  };

  const addKpiField = () => {
    setNewDeliverable({ 
      ...newDeliverable, 
      kpis: [...newDeliverable.kpis, ''] 
    });
  };

  const removeKpiField = (index: number) => {
    if (newDeliverable.kpis.length > 1) {
      const newKpis = newDeliverable.kpis.filter((_, i) => i !== index);
      setNewDeliverable({ ...newDeliverable, kpis: newKpis });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, deliverableId: string) => {
    const files = e.target.files;
    if (!files?.length) return;

    const deliverable = deliverables.find(d => d.id === deliverableId);
    if (!deliverable) {
      toast.error('Deliverable not found');
      return;
    }

    // Allow file uploads for deliverables that are scoped or beyond
    const allowedStatuses = ['scoped', 'in_progress', 'approved', 'performance_tracking'];
    if (!allowedStatuses.includes(deliverable.status)) {
      toast.error('Files can only be uploaded for scoped deliverables and beyond');
      return;
    }

    // Simulated file upload - in production, this would upload to your storage
    const newFiles = Array.from(files).map(file => ({
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));

    const updatedFiles = [...(deliverable.files || []), ...newFiles];
    onUpdateDeliverable?.(deliverableId, { files: updatedFiles });
    toast.success('Files uploaded successfully');
  };

  const handleDeleteFile = (deliverableId: string, fileId: string) => {
    const deliverable = deliverables.find(d => d.id === deliverableId);
    if (!deliverable) return;

    const updatedFiles = deliverable.files?.filter(f => f.id !== fileId) || [];
    onUpdateDeliverable?.(deliverableId, { files: updatedFiles });
    toast.success('File removed');
  };

  // Get deliverables that can have files uploaded (scoped and beyond)
  const fileUploadDeliverables = deliverables.filter(d => 
    ['scoped', 'in_progress', 'approved', 'performance_tracking'].includes(d.status)
  );

  return (
    <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 shadow-sm">
      <Tabs defaultValue="kanban">
        <TabsList className="mb-6 bg-white border rounded-lg">
          <TabsTrigger value="kanban" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white">
            Kanban
          </TabsTrigger>
          {editable && showForm && (
            <TabsTrigger value="recommend" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white">
              Recommend
            </TabsTrigger>
          )}
          <TabsTrigger value="files" className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white">
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <KanbanBoard
            deliverables={deliverables}
            projectStartDate={projectStartDate}
            projectDeadline={projectDeadline}
            onStatusChange={onStatusChange}
            role={role}
          />
        </TabsContent>

        {editable && showForm && (
          <TabsContent value="recommend">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deliverable title *</label>
                <Input
                  value={newDeliverable.title}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, title: e.target.value })}
                  placeholder="Enter deliverable title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem statement *</label>
                <Textarea
                  value={newDeliverable.problem}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, problem: e.target.value })}
                  placeholder="What specific problem does this deliverable solve?"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed description *</label>
                <Textarea
                  value={newDeliverable.description}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, description: e.target.value })}
                  placeholder="Describe the deliverable in detail"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Key Performance Indicators (KPIs) *</label>
                <div className="space-y-2">
                  {newDeliverable.kpis.map((kpi, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={kpi}
                        onChange={(e) => handleKpiChange(index, e.target.value)}
                        placeholder={`KPI ${index + 1} (e.g., "Increase conversion rate by 15%")`}
                        className="flex-1"
                      />
                      {newDeliverable.kpis.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeKpiField(index)}
                          className="px-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addKpiField}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add KPI
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated hours *</label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newDeliverable.estimatedHours}
                  onChange={(e) => setNewDeliverable({ ...newDeliverable, estimatedHours: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <Button onClick={handleAdd} className="bg-[#00A499] hover:bg-[#00A499]/90">
                Submit Recommendation
              </Button>
            </div>
          </TabsContent>
        )}

        <TabsContent value="files">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Project Files</h3>

            {fileUploadDeliverables.length === 0 ? (
              <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <p className="text-yellow-700 font-medium">No Deliverables Ready for Files</p>
                <p className="text-sm text-yellow-600">Move deliverables to "Scoped" or beyond to upload files</p>
              </div>
            ) : (
              fileUploadDeliverables.map(deliverable => (
                <div key={deliverable.id} className="border rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex-1">
                      <h4 className="font-medium">{deliverable.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                      
                      {/* Problem Statement */}
                      {deliverable.problem && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-red-800">Problem</span>
                          </div>
                          <p className="text-xs text-red-700">{deliverable.problem}</p>
                        </div>
                      )}

                      {/* KPIs */}
                      {deliverable.kpis && deliverable.kpis.length > 0 && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                          <div className="flex items-center gap-1 mb-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span className="text-xs font-medium text-green-800">KPIs</span>
                          </div>
                          <ul className="text-xs text-green-700 space-y-0.5">
                            {deliverable.kpis.map((kpi, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-500 mt-0.5">•</span>
                                <span>{kpi}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {deliverable.status === 'performance_tracking' 
                            ? 'Performance Tracking' 
                            : deliverable.status.charAt(0).toUpperCase() + deliverable.status.slice(1)
                          }
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {deliverable.actualHours.toFixed(1)}/{deliverable.estimatedHours}h
                        </Badge>
                        {deliverable.files && deliverable.files.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {deliverable.files.length} file{deliverable.files.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Input
                        type="file"
                        className="hidden"
                        id={`file-upload-${deliverable.id}`}
                        multiple
                        onChange={(e) => handleFileUpload(e, deliverable.id)}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif"
                      />
                      <Button
                        onClick={() => document.getElementById(`file-upload-${deliverable.id}`)?.click()}
                        className="bg-[#00A499] hover:bg-[#00A499]/90"
                        size="sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Files
                      </Button>
                    </div>
                  </div>

                  {(!deliverable.files || deliverable.files.length === 0) ? (
                    <p className="text-gray-500 text-sm">No files uploaded for this deliverable</p>
                  ) : (
                    <div className="space-y-2">
                      {deliverable.files.map(file => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                Uploaded {format(file.uploadedAt, 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(file.url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFile(deliverable.id, file.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}