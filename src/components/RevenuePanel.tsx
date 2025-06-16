import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search as SearchIcon,
  CreditCard,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const MOCK_PROJECTS = [
  {
    id: "proj-001",
    title: "SEO Overhaul for Startup",
    category: "SEO",
    status: "in_progress",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    project_bids: [{ id: "bid-1" }, { id: "bid-2" }],
    chatCount: 3,
    flagged: true,
    metadata: {
      marketing: {
        budget: 3000,
      },
    },
  },
  {
    id: "proj-002",
    title: "Landing Page Optimization",
    category: "Paid Search",
    status: "completed",
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    project_bids: [{ id: "bid-3" }],
    chatCount: 1,
    flagged: false,
    metadata: {
      marketing: {
        budget: 1200,
      },
    },
  },
  {
    id: "proj-003",
    title: "Blog Strategy Buildout",
    category: "Content",
    status: "open",
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    project_bids: [],
    chatCount: 0,
    flagged: false,
    metadata: {
      marketing: {
        budget: 5000,
      },
    },
  },
];

export default function RevenuePanel() {
  const navigate = useNavigate();
  const [projects] = useState(MOCK_PROJECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bidFilter, setBidFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");

  const totalRevenue = projects.reduce((sum, project) => sum + (project.metadata?.marketing?.budget || 0), 0);
  const totalPlatformRevenue = totalRevenue * 0.1;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesBids = bidFilter === "all" ||
      (bidFilter === "0" && (project.project_bids?.length || 0) === 0) ||
      (bidFilter === "1+" && (project.project_bids?.length || 0) > 0);
    const budget = project.metadata?.marketing?.budget || 0;
    const matchesRevenue = revenueFilter === "all" ||
      (revenueFilter === "low" && budget < 2000) ||
      (revenueFilter === "med" && budget >= 2000 && budget <= 4000) ||
      (revenueFilter === "high" && budget > 4000);
    const matchesDeadline = deadlineFilter === "all" ||
      (deadlineFilter === "past" && new Date(project.deadline) < new Date()) ||
      (deadlineFilter === "future" && new Date(project.deadline) >= new Date());
    return matchesSearch && matchesStatus && matchesBids && matchesRevenue && matchesDeadline;
  });

  return (
    <Tabs defaultValue="revenue" className="space-y-6">
      <TabsList>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="escrow">Escrow</TabsTrigger>
      </TabsList>

      <TabsContent value="revenue">
        <Card>
          <div className="flex justify-between items-center px-4 pt-4">
            <h3 className="text-lg font-semibold">
              Total Revenue: ${totalRevenue.toLocaleString()} | Platform Revenue: ${totalPlatformRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3 p-4">
            <Input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-[200px]" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bidFilter} onValueChange={setBidFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Bids" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0">0 Bids</SelectItem>
                <SelectItem value="1+">1+ Bids</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Revenue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">&lt; $2,000</SelectItem>
                <SelectItem value="med">$2,000–$4,000</SelectItem>
                <SelectItem value="high">&gt; $4,000</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Deadline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="future">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>UUID</TableHead>
                  <TableHead>Total Revenue</TableHead>
                  <TableHead>% of Total</TableHead>
                  <TableHead>Platform Share</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const budget = project.metadata?.marketing?.budget || 0;
                  return (
                    <TableRow key={project.id}>
                      <TableCell>{project.title}</TableCell>
                      <TableCell>{project.category || "-"}</TableCell>
                      <TableCell className="text-xs font-mono">{project.id}</TableCell>
                      <TableCell>${budget.toLocaleString()}</TableCell>
                      <TableCell>{((budget / totalRevenue) * 100).toFixed(1)}%</TableCell>
                      <TableCell>${(budget * 0.1).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin/projects/${project.id}`)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="escrow">
        <EscrowContentCard projects={projects} />
      </TabsContent>
    </Tabs>
  );
}

function EscrowContentCard({ projects }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [flagReason, setFlagReason] = useState("");

  const handleFlagProject = () => {
    if (!flagReason.trim()) {
      toast.error("Please provide a reason for flagging");
      return;
    }
    toast.success("Project flagged for review");
    setFlagReason("");
  };

  const handleOverrideEscrow = (action) => {
    if (action === "release") {
      toast.success("Admin override: Payment released");
    } else {
      toast.error("Admin override: Escrow cancelled");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Escrow Management</h3>
        <p className="text-gray-600 mb-4">
          Select a project to manage its escrow status and override payments if necessary.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
            <select
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Choose a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} - {project.status}
                  {project.flagged ? " (FLAGGED)" : ""}
                </option>
              ))}
            </select>
          </div>

          {selectedProjectId && (
            <div className="border-t pt-4 space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Badge variant="outline" className="text-sm">Escrow Status: pending</Badge>
                {projects.find((p) => p.id === selectedProjectId)?.flagged && (
                  <Badge variant="destructive" className="text-sm">Project Flagged</Badge>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Admin Override Controls</h4>
                </div>
                <p className="text-sm text-yellow-800 mb-3">Use these controls carefully. They bypass normal approval processes.</p>
                <div className="flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleOverrideEscrow("release")}>
                    <CreditCard className="w-4 h-4 mr-2" /> Force Release
                  </Button>
                  <Button variant="destructive" onClick={() => handleOverrideEscrow("cancel")}>
                    <XCircle className="w-4 h-4 mr-2" /> Cancel Escrow
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
