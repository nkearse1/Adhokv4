import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
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
import { supabase } from "@supabase/supabaseClient";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  Link as LinkIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Upload as UploadIcon,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  bio: string;
  expertise: string;
  resume_url: string;
  created_at: string;
  is_qualified: boolean;
  join_method?: string;
}

export default function AdminTalentList() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    fetchTalents();
  }, [currentPage, debouncedSearch, qualificationFilter]);

  const fetchTalents = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from("talent_profiles").select("*", { count: "exact" });
      
      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,expertise.ilike.%${debouncedSearch}%`);
      }
      
      if (qualificationFilter !== "all") {
        query = query.eq("is_qualified", qualificationFilter === "qualified");
      }
      
      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setTalents(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch talent profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkQualify = async () => {
    try {
      const { error } = await supabase
        .from("talent_profiles")
        .update({ is_qualified: true })
        .in("id", selectedIds);
      
      if (error) throw error;
      
      toast.success(`Qualified ${selectedIds.length} talents.`);
      setSelectedIds([]);
      fetchTalents();
    } catch (error) {
      console.error("Error updating talents:", error);
      toast.error("Failed bulk qualification");
    }
  };

  const handleQualifyTalent = async (talentId: string, qualified: boolean) => {
    try {
      const { error } = await supabase
        .from("talent_profiles")
        .update({ is_qualified: qualified })
        .eq("id", talentId);
      
      if (error) throw error;
      
      toast.success(`Talent ${qualified ? 'qualified' : 'disqualified'} successfully`);
      fetchTalents();
    } catch (error) {
      console.error("Error updating talent:", error);
      toast.error("Failed to update talent status");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === talents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(talents.map(t => t.id));
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && !talents.length) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E3A8C] mx-auto mb-4"></div>
        <p>Loading talent profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-semibold">Talent Profiles</h2>
        <div className="flex gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={qualificationFilter} onValueChange={setQualificationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={handleBulkQualify}>
            Qualify Selected ({selectedIds.length})
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={selectedIds.length === talents.length && talents.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Expertise</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Qualified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {talents.map((talent) => (
                <TableRow key={talent.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(talent.id)}
                      onChange={() => toggleSelect(talent.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{talent.full_name}</TableCell>
                  <TableCell>{talent.email}</TableCell>
                  <TableCell>{talent.expertise}</TableCell>
                  <TableCell>{talent.location || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={talent.is_qualified ? "default" : "secondary"}>
                      {talent.is_qualified ? "Qualified" : "Unqualified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!talent.is_qualified ? (
                        <Button
                          size="sm"
                          onClick={() => handleQualifyTalent(talent.id, true)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Qualify
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleQualifyTalent(talent.id, false)}
                        >
                          <XCircleIcon className="w-4 h-4 mr-1" />
                          Disqualify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/talent/${talent.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}