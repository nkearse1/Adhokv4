// Full updated ProjectUploadFlow component with all 4 steps and logic
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@supabase/supabaseConfig';
import { Package } from 'lucide-react';

const expertiseRates = {
  'Specialist': 50,
  'Pro Talent': 100,
  'Expert Talent': 150,
};

const projectPresets = {
  SEO: [
    {
      title: 'Technical SEO Audit',
      description: 'Comprehensive technical audit to identify crawlability, indexation, and speed issues.',
      deliverables: 'Site crawl, issues report, optimization checklist',
      expertiseLevel: 'Pro Talent',
    },
    {
      title: 'Full SEO Strategy Plan',
      description: 'High-level SEO strategy to define goals, target keywords, and growth pillars.',
      deliverables: 'Keyword research, competitor gap analysis, content roadmap, KPIs',
      expertiseLevel: 'Expert Talent',
    },
    {
      title: 'On-page Optimization for Blog',
      description: 'Meta data, headings, internal links and structure fixes for an existing blog.',
      deliverables: 'Content audit, optimized metadata, internal linking suggestions',
      expertiseLevel: 'Specialist',
    },
  ],
  'Paid Search': [
    {
      title: 'Google Ads Audit',
      description: 'Audit your paid search campaigns for wasted spend, misaligned targeting, and conversion bottlenecks.',
      deliverables: 'Campaign breakdown, negative keyword list, ROAS recommendations',
      expertiseLevel: 'Pro Talent',
    },
  ],
};

export function ProjectUploadFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    briefFile: null as File | null,
    title: '',
    expertType: '',
    description: '',
    budget: '',
    clientName: '',
    company: '',
    email: '',
    phone: '',
    password: '',
    expertiseLevel: '',
    targetAudience: '',
    deliverables: '',
    preferredTools: '',
    brandVoice: '',
  });

  const getEstimatedHours = () => {
    const rate = expertiseRates[form.expertiseLevel];
    const budget = parseFloat(form.budget);
    if (!rate || isNaN(budget)) return null;

    // Try to guess based on known project types
    const estimatedHoursMap: Record<string, number> = {
      'Technical SEO Audit': 8,
      'Full SEO Strategy Plan': 16,
      'On-page Optimization for Blog': 6,
      'Google Ads Audit': 10,
    };

    const matchKey = Object.keys(estimatedHoursMap).find((key) =>
      form.title.toLowerCase().includes(key.toLowerCase().split(' ')[0])
    );

    if (matchKey) return estimatedHoursMap[matchKey];
    return Math.floor(budget / rate);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setForm({ ...form, briefFile: e.target.files[0] });
    }
  };

  const handleSuggestionClick = (preset: any) => {
  const estimatedHoursMap: Record<string, number> = {
    'Technical SEO Audit': 8,
    'Full SEO Strategy Plan': 16,
    'On-page Optimization for Blog': 6,
    'Google Ads Audit': 10,
  };

  const hoursGuess = estimatedHoursMap[preset.title] || 10;
  const hourlyRate = expertiseRates[preset.expertiseLevel];
  const estimatedBudget = hourlyRate * hoursGuess;

  setForm({
      ...form,
      title: preset.title,
      description: preset.description,
      deliverables: preset.deliverables,
      expertiseLevel: preset.expertiseLevel,
    budget: String(estimatedBudget),
    });
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-start p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <img
              src="/adhok_logo_icon_teal_brand_precise3.png"
              alt="Adhok Logo"
              className="h-8 w-8"
            />
            <h1 className="text-3xl font-bold text-[#2F2F2F]">Adhok</h1>
          </div>
          <p className="text-sm text-[#00A499] font-medium">
            Upload your project brief and get matched with proven experts
          </p>
        </div>
        {step === 2 && form.budget && form.expertiseLevel && !isNaN(parseFloat(form.budget)) && (
          <div className="w-full bg-white border rounded-md shadow p-6">
            <h3 className="text-lg font-semibold text-[#2E3A8C] mb-2">Project Checkout Summary</h3>
            <div className="text-sm text-gray-800 space-y-1">
              <p>
                Based on <strong>{form.expertiseLevel}</strong> at <strong>${expertiseRates[form.expertiseLevel]}/hr</strong>
              </p>
              <p>
                Estimated Hours: <strong>{getEstimatedHours()} hrs</strong>
              </p>
              <p>
                Estimated Project Cost: <strong>${expertiseRates[form.expertiseLevel] * getEstimatedHours()}</strong>
              </p>
              <p>
                Entered Budget: <strong>${form.budget}</strong>
              </p>
              {expertiseRates[form.expertiseLevel] * getEstimatedHours() > parseFloat(form.budget) && (
                <div className="text-red-600 pt-2">
                  ⚠ Your budget may be too low for this talent level. Consider increasing your budget or selecting a lower tier.
                </div>
              )}
            </div>
          </div>
        )}

        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-1">Upload a Brief (optional)</label>
                  <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Select Category</label>
                  <select
                    value={form.expertType}
                    onChange={(e) => setForm({ ...form, expertType: e.target.value })}
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option value="">Choose a Category</option>
                    {Object.keys(projectPresets).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {form.expertType && (
                  <div>
                    <p className="font-medium">Suggested Projects:</p>
                    <ul className="space-y-2">
                      {projectPresets[form.expertType].map((preset, i) => (
                        <li
                          key={i}
                          className="border rounded p-2 cursor-pointer hover:border-blue-500"
                          onClick={() => handleSuggestionClick(preset)}
                        >
                          <strong>{preset.title}</strong>
                          <p className="text-sm text-gray-600">{preset.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block font-medium mb-1">Project Title</label>
  <Input
    value={form.title}
    onChange={(e) => {
    const newTitle = e.target.value;
    const updatedForm = { ...form, title: newTitle };

    const matched = Object.values(projectPresets).flat().find(preset =>
      newTitle.toLowerCase().includes(preset.title.toLowerCase().split(' ')[0])
    );

    if (matched) {
      updatedForm.description = matched.description;
      updatedForm.deliverables = matched.deliverables;
      updatedForm.expertiseLevel = matched.expertiseLevel;
      const hoursGuess = {
        'Technical SEO Audit': 8,
        'Full SEO Strategy Plan': 16,
        'On-page Optimization for Blog': 6,
        'Google Ads Audit': 10,
      }[matched.title] || 10;
      const rate = expertiseRates[matched.expertiseLevel];
      updatedForm.budget = String(rate * hoursGuess);
      setTimeout(() => {
        toast.success(`Matched project: ${matched.title}`, {
          icon: '✨',
          duration: 2400,
          position: 'top-center'
        });
      }, 150);
    }

    setForm(updatedForm);
  }}
  placeholder="Enter a clear title" />

                </div>
                <Button onClick={() => setStep(2)} className="w-full">Next</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Project Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <Textarea
                  placeholder="Deliverables (e.g., SEO audit, content brief)"
                  value={form.deliverables}
                  onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                />
                <div>
                  <label className="block font-medium mb-1">Level of Expertise</label>
                  <select
                    value={form.expertiseLevel}
                    onChange={(e) => setForm({ ...form, expertiseLevel: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    <option value="Specialist">Specialist ($50/hr)</option>
                    <option value="Pro Talent">Pro Talent ($100/hr)</option>
                    <option value="Expert Talent">Expert Talent ($150/hr)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Budget (USD)</label>
                  <Input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  />
                  {getEstimatedHours() && (
                    <p className="text-sm text-gray-600 mt-1">
                      Estimated Hours: {getEstimatedHours()} hrs
                    </p>
                  )}
                </div>
                <Textarea
                  placeholder="Target Audience"
                  value={form.targetAudience}
                  onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                />
                <Textarea
                  placeholder="Preferred Platforms / Tools"
                  value={form.preferredTools}
                  onChange={(e) => setForm({ ...form, preferredTools: e.target.value })}
                />
                <Textarea
                  placeholder="Brand Voice or Tone"
                  value={form.brandVoice}
                  onChange={(e) => setForm({ ...form, brandVoice: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={() => setStep(3)}>Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                />
                <Input
                  placeholder="Company Name"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Create Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button onClick={() => setStep(4)}>Next</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Review Your Project</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
{JSON.stringify(form, null, 2)}
                </pre>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button onClick={() => toast.success('Project submitted successfully!')}>Submit Project</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
