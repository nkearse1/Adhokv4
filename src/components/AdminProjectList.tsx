import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search as SearchIcon } from "lucide-react";
import { supabase } from "@supabase/supabaseClient";
import { toast } from "sonner";

export default function AdminProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bidFilter, setBidFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, bidFilter, revenueFilter, deadlineFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_bids(count)
        `);
      
      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }
      
      // Apply deadline filter
      if (deadlineFilter === "past") {
        query = query.lt('deadline', new Date().toISOString());
      } else if (deadlineFilter === "future") {
        query = query.gte('deadline', new Date().toISOString());
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process data with client-side filters
      let filteredData = data || [];
      
      // Apply bid filter
      if (bidFilter === "0") {
        filteredData = filteredData.filter(p => !p.project_bids[0]?.count || p.project_bids[0].count === 0);
      } else if (bidFilter === "1+") {
        filteredData = filteredData.filter(p => p.project_bids[0]?.count > 0);
      }
      
      // Apply revenue filter
      if (revenueFilter === "low") {
        filteredData = filteredData.filter(p => (p.project_budget || 0) < 2000);
      } else if (revenueFilter === "med") {
        filteredData = filteredData.filter(p => (p.project_budget || 0) >= 2000 && (p.project_budget || 0) <= 4000);
      } else if (revenueFilter === "high") {
        filteredData = filteredData.filter(p => (p.project_budget || 0) > 4000);
      }
      
      // Apply search filter
      if (searchQuery) {
        filteredData = filteredData.filter(p => 
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setProjects(filteredData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProjects();
  };

  return (
    <Card>
      <div className="flex flex-wrap gap-3 p-4">
        <Input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[200px]"
        />
        <Button variant="outline" onClick={handleSearch}>
          <SearchIcon className="h-4 w-4 mr-1" />
          Search
        </Button>
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
            <SelectItem value="low">{"< $2,000"}</SelectItem>
            <SelectItem value="med">$2,000–$4,000</SelectItem>
            <SelectItem value="high">{"> $4,000"}</SelectItem>
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
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bids</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>UUID</TableHead>
              <TableHead>Total Revenue</TableHead>
              <TableHead>Platform Revenue</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const budget = project.project_budget || 0;
                const platformFee = budget * 0.1;
                
                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project.status}</Badge>
                    </TableCell>
                    <TableCell>{project.project_bids?.[0]?.count || 0}</TableCell>
                    <TableCell>{new Date(project.deadline).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-[250px] truncate">{project.description}</TableCell>
                    <TableCell className="text-xs font-mono">{project.id}</TableCell>
                    <TableCell>${budget.toLocaleString()}</TableCell>
                    <TableCell>${platformFee.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}