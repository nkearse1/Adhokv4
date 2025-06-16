import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProjectTemplateCard from './ProjectTemplateCard';

interface ProjectTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  suggested_level: 'entry' | 'mid' | 'expert';
  estimated_hours: number;
  suggested_budget: number;
}

interface ProjectTemplateGridProps {
  templates: ProjectTemplate[];
  onSelectTemplate: (template: ProjectTemplate) => void;
}

export default function ProjectTemplateGrid({ templates, onSelectTemplate }: ProjectTemplateGridProps) {
  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, ProjectTemplate[]>);

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-8">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryTemplates.map((template) => (
                <ProjectTemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelectTemplate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}