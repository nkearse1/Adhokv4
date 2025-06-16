// CaseStudyModal.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Deliverable {
  id: string;
  title: string;
  problem?: string;
  solution?: string;
  kpis?: string[];
  results?: string;
}

export interface CaseStudyData {
  title: string;
  problem: string;
  solution: string;
  kpis: string;
  results: string;
  showOnPortfolio: boolean;
}

interface CaseStudyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CaseStudyData) => void;
  initialData?: CaseStudyData;
  deliverables?: Deliverable[];
}

export default function CaseStudyModal({ open, onClose, onSubmit, initialData, deliverables = [] }: CaseStudyModalProps) {
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [kpis, setKpis] = useState('');
  const [results, setResults] = useState('');
  const [showOnPortfolio, setShowOnPortfolio] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setProblem(initialData.problem);
      setSolution(initialData.solution);
      setKpis(initialData.kpis);
      setResults(initialData.results);
      setShowOnPortfolio(initialData.showOnPortfolio);
    } else if (deliverables.length > 0) {
      const [first] = deliverables;
      setTitle(first.title);
      setProblem(first.problem || '');
      setSolution(first.solution || '');
      setKpis(first.kpis?.join(', ') || '');
      setResults(first.results || '');
    }
  }, [initialData, deliverables]);

  const handleSubmit = () => {
    if (!title || !problem || !solution) {
      toast.error('Please complete all required fields.');
      return;
    }
    const data: CaseStudyData = { title, problem, solution, kpis, results, showOnPortfolio };
    onSubmit(data);
    toast.success('Case study saved!');
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setProblem('');
    setSolution('');
    setKpis('');
    setResults('');
    setShowOnPortfolio(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Case Study' : 'Add Case Study'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Problem" value={problem} onChange={(e) => setProblem(e.target.value)} />
          <Textarea placeholder="Solution" value={solution} onChange={(e) => setSolution(e.target.value)} />
          <Textarea placeholder="Key KPIs (comma separated)" value={kpis} onChange={(e) => setKpis(e.target.value)} />
          <Textarea placeholder="Results" value={results} onChange={(e) => setResults(e.target.value)} />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showOnPortfolio} onChange={() => setShowOnPortfolio(!showOnPortfolio)} />
            Show on Portfolio
          </label>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => { resetForm(); onClose(); }}>Cancel</Button>
            <Button onClick={handleSubmit}>{initialData ? 'Update' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
