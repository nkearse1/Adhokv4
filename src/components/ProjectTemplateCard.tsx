import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import ExperienceBadge from '@/components/ExperienceBadge';

interface ProjectTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  suggested_level: 'entry' | 'mid' | 'expert';
  estimated_hours: number;
  suggested_budget: number;
}

interface ProjectTemplateCardProps {
  template: ProjectTemplate;
  onSelect: (template: ProjectTemplate) => void;
}

const categoryColors = {
  'SEO': 'bg-blue-100 text-blue-800',
  'Web Design': 'bg-purple-100 text-purple-800',
  'Copywriting': 'bg-green-100 text-green-800',
  'Paid Ads': 'bg-orange-100 text-orange-800',
  'Social Media': 'bg-pink-100 text-pink-800'
} as const;

export default function ProjectTemplateCard({ template, onSelect }: ProjectTemplateCardProps) {
  return (
    <Card className="hover:border-brand-primary transition-colors">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Badge 
              variant="secondary" 
              className={categoryColors[template.category as keyof typeof categoryColors]}
            >
              {template.category}
            </Badge>
            <h3 className="text-lg font-semibold mt-2">{template.title}</h3>
          </div>
          <ExperienceBadge level={template.suggested_level} />
        </div>

        <p className="text-sm text-gray-600 mb-4">{template.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {template.estimated_hours}h
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(template.suggested_budget)}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(template)}
          >
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}