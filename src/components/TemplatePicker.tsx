import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Briefcase } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Template {
  id: string;
  category: string;
  title: string;
  description: string;
  suggested_level: 'entry' | 'mid' | 'expert';
  estimated_hours: number;
  suggested_budget: number;
}

interface TemplatePickerProps {
  templates: Template[];
  onApplyTemplate: (template: Template) => void;
}

export default function TemplatePicker({ templates, onApplyTemplate }: TemplatePickerProps) {
  const categoryColors = {
    social_media: 'bg-blue-100 text-blue-800',
    content: 'bg-green-100 text-green-800',
    email: 'bg-purple-100 text-purple-800',
    advertising: 'bg-orange-100 text-orange-800'
  };

  const levelLabels = {
    entry: 'Entry Level',
    mid: 'Professional',
    expert: 'Expert'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Project Templates</h3>
        <p className="text-sm text-gray-500">Quick start your project</p>
      </div>

      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="hover:border-brand-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium mb-1">{template.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className={categoryColors[template.category as keyof typeof categoryColors]}
                    >
                      {template.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>

                <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {template.estimated_hours} hours
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(template.suggested_budget)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {levelLabels[template.suggested_level]}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}