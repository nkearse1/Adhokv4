import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const isAuctionExpired = (end: string | undefined): boolean => {
  if (!end) return false;
  return new Date(end) < new Date();
};

const formatTimeRemaining = (end: string | undefined): string => {
  if (!end) return "Unknown";
  const now = new Date();
  const endDate = new Date(end);
  const ms = endDate.getTime() - now.getTime();
  if (ms <= 0) return "Auction ended";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m left`;
};


const startingBidsByExpertise: Record<string, number> = {
  Expert: 150,
  "Pro Talent": 100,
  "Specialist": 50,
};

const expertiseOrder: Record<string, number> = {
  "Specialist": 1,
  "Pro Talent": 2,
  "Expert": 3,
};

const experienceBadgeMap: Record<string, string> = {
  "Entry Level": "Specialist",
  "Mid-Level": "Pro Talent",
  "Expert": "Expert",
};

interface Project {
  auction_end?: string;
  id: number;
  title: string;
  description: string;
  deadline: string;
  expertiseLevel: string;
  bidCount?: number;
  status?: string;
  overview?: string;
  deliverables?: string;
  target_audience?: string;
  platforms?: string;
  preferred_tools?: string;
  brand_voice?: string;
  inspiration_links?: string;
}

const TEAL_HIGHLIGHT = "#00A499";

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sortKey, setSortKey] = useState<'bid' | 'expertise' | 'deadline'>('bid');
  const navigate = useNavigate();

  const projects: Project[] = [
    {
      id: 1,
      title: 'SEO Optimization Campaign',
      description: 'Improve search rankings for e-commerce website',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      expertiseLevel: 'Mid-Level',
      bidCount: 30,
      status: 'open',
      overview: 'Help an e-comm brand rank for new seasonal collections.',
      deliverables: '3-5 keyword-optimized landing pages',
      target_audience: 'DTC Gen Z consumers',
      platforms: 'Shopify + Google Search Console',
      preferred_tools: 'SEMRush + Jasper',
      brand_voice: 'Trendy but concise',
      inspiration_links: 'https://glossier.com | https://alo.com'
    },
    {
      id: 2,
      title: 'Social Media Strategy',
      description: 'Develop comprehensive social media plan',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      expertiseLevel: 'Expert',
      bidCount: 75,
      status: 'open',
      overview: 'Create a viral playbook for product launch.',
      deliverables: '15 content ideas, 7 draft captions, 1 calendar',
      target_audience: 'Beauty creators + skincare lovers',
      platforms: 'Instagram, TikTok',
      preferred_tools: 'Canva, Meta Planner',
      brand_voice: 'Bold, Gen Z, cheeky',
      inspiration_links: 'https://starface.world | https://topicals.com'
    },
    {
      id: 3,
      title: 'Content Marketing Plan',
      description: 'Create monthly blog content strategy',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      expertiseLevel: 'Entry Level',
      bidCount: 15,
      status: 'open',
      overview: 'Support organic visibility by establishing topic clusters.',
      deliverables: '1 blog strategy, 10 topic outlines',
      target_audience: 'Small business owners + startup founders',
      platforms: 'WordPress, Notion',
      preferred_tools: 'Ahrefs, SurferSEO',
      brand_voice: 'Helpful and professional',
      inspiration_links: 'https://zapier.com/blog | https://buffer.com/resources'
    }
  ];

  const activeBids = projects.filter(p => p.status === 'open');
  const popularActiveBids = activeBids.filter(p => (p.bidCount ?? 0) > 0).sort((a, b) => (b.bidCount ?? 0) - (a.bidCount ?? 0)).slice(0, 3);
  const otherActiveBids = activeBids.filter(p => !popularActiveBids.some(pop => pop.id === p.id));

  const sortedOtherActiveBids = useMemo(() => {
    let baseSorted = [...otherActiveBids];
    if (sortKey === 'bid') {
      baseSorted.sort((a, b) => (startingBidsByExpertise[experienceBadgeMap[b.expertiseLevel] ?? b.expertiseLevel] ?? 0) - (startingBidsByExpertise[experienceBadgeMap[a.expertiseLevel] ?? a.expertiseLevel] ?? 0));
    } else if (sortKey === 'expertise') {
      baseSorted.sort((a, b) => (expertiseOrder[experienceBadgeMap[b.expertiseLevel] ?? b.expertiseLevel] ?? 0) - (expertiseOrder[experienceBadgeMap[a.expertiseLevel] ?? a.expertiseLevel] ?? 0));
    } else if (sortKey === 'deadline') {
      baseSorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    return baseSorted;
  }, [otherActiveBids, sortKey]);

  const displayActiveBids = [...popularActiveBids, ...sortedOtherActiveBids];
  const formatExpertise = (exp: string) => experienceBadgeMap[exp] ?? exp;
  const formatDueDate = (isoDate: string) => format(new Date(isoDate), "MMM d, yyyy 'at' h:mm aa");
  const timeRemaining = (isoDate: string) => formatDistanceToNow(new Date(isoDate), { addSuffix: true });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#2E3A8C] mb-6">Project Auctions</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {popularActiveBids.map((project) => (
          <div
            key={project.id}
            className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md ${selectedProject?.id === project.id ? `border-[${TEAL_HIGHLIGHT}]` : 'border-gray-200'}`}
            onClick={() => setSelectedProject(project)}
            style={{ borderColor: selectedProject?.id === project.id ? TEAL_HIGHLIGHT : undefined }}
          >
            <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
            <p className="text-gray-600 text-sm">{project.description}</p>
            <div className="mt-2 text-xs text-gray-500">
              <span>{project.bidCount} bids</span> &middot; <span>Last bid: ${startingBidsByExpertise[formatExpertise(project.expertiseLevel)]}/hr</span> &middot; <span>{timeRemaining(project.deadline)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 md:w-[60%]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#2E3A8C]">Active Project Auctions</h2>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="border rounded p-2"
              aria-label="Sort projects"
            >
              <option value="bid">Sort by Starting Bid (High to Low)</option>
              <option value="expertise">Sort by Expertise Level</option>
              <option value="deadline">Sort by Time to Auction Complete</option>
            </select>
          </div>

          {displayActiveBids.map((project) => (
            <div
              key={project.id}
              className={`border-2 rounded-lg p-4 mb-4 cursor-pointer hover:shadow-md ${selectedProject?.id === project.id ? `border-[${TEAL_HIGHLIGHT}]` : 'border-gray-200'}`}
              onClick={() => setSelectedProject(project)}
              style={{ borderColor: selectedProject?.id === project.id ? TEAL_HIGHLIGHT : undefined }}
            >
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">{project.title}</h2>
                  <p className="text-gray-700">{project.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Ends in {timeRemaining(project.deadline)}</span>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={`ml-4 px-3 py-1 text-xs ${
                    formatExpertise(project.expertiseLevel) === 'Expert'
                      ? 'bg-red-200 text-red-800'
                      : formatExpertise(project.expertiseLevel) === 'Pro Talent'
                      ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-200 text-green-800'
                  }`}
                >
                  {formatExpertise(project.expertiseLevel)}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <span>{project.bidCount} bids</span> &middot; <span>Last bid: ${startingBidsByExpertise[formatExpertise(project.expertiseLevel)]}/hr</span>
              </div>
            </div>
          ))}
        </div>

        {selectedProject && (
          <div className="bg-white rounded-lg shadow p-6 md:w-[40%]">
            <h2 className="text-2xl font-bold text-[#2E3A8C] mb-3">{selectedProject.title}</h2>
            <Badge
              variant="secondary"
              className={`mb-4 px-3 py-1 text-xs ${
                formatExpertise(selectedProject.expertiseLevel) === 'Expert'
                  ? 'bg-red-200 text-red-800'
                  : formatExpertise(selectedProject.expertiseLevel) === 'Pro Talent'
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-green-200 text-green-800'
              }`}
            >
              {formatExpertise(selectedProject.expertiseLevel)}
            </Badge>
            <p className="text-gray-700 mb-2">{selectedProject.description}</p>
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <Clock className="w-4 h-4" />
              <span>Due {formatDueDate(selectedProject.deadline)}</span>
              <span className="ml-auto font-medium text-gray-800">
                Ends in {timeRemaining(selectedProject.deadline)}
              </span>
            </div>
            <div className="flex gap-4 items-center mb-4">
              <span className="text-sm text-gray-700 mr-2">
                Starting Bid: $
                {startingBidsByExpertise[formatExpertise(selectedProject.expertiseLevel)] || 50}/hr
              </span>
              <input
                type="number"
                placeholder="Your Bid"
                className="flex-1 border border-gray-300 rounded px-3 py-2"
                max={startingBidsByExpertise[formatExpertise(selectedProject.expertiseLevel)] || 50}
                min={0}
              />
              <Button className="flex-1 bg-[#2E3A8C] hover:bg-[#1B276F] text-white">
                Submit Bid &rarr;
              </Button>
            </div>
            <div className="text-sm space-y-1">
              {selectedProject.overview && <p><strong>Overview:</strong> {selectedProject.overview}</p>}
              {selectedProject.deliverables && <p><strong>Deliverables:</strong> {selectedProject.deliverables}</p>}
              {selectedProject.target_audience && <p><strong>Target Audience:</strong> {selectedProject.target_audience}</p>}
              {selectedProject.platforms && <p><strong>Platforms:</strong> {selectedProject.platforms}</p>}
              {selectedProject.preferred_tools && <p><strong>Preferred Tools:</strong> {selectedProject.preferred_tools}</p>}
              {selectedProject.brand_voice && <p><strong>Brand Voice:</strong> {selectedProject.brand_voice}</p>}
              {selectedProject.inspiration_links && <p><strong>Inspiration:</strong> {selectedProject.inspiration_links}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
