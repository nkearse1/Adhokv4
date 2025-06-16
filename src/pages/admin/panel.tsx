import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { updateUserStatusAPI, updateProjectStatusAPI } from '@/lib/adminApi';
import { supabase } from '@supabase/supabaseClient';
import { 
  Users, 
  Briefcase, 
  Search, 
  CheckCircle, 
  XCircle,
  Archive,
  RefreshCw,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  deadline: string;
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAdminAuth();
    fetchData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('admin_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!adminUser) {
        throw new Error('Not authorized');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('You are not authorized to access the admin panel');
      navigate('/');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;
      setUsers(users || []);

      // Fetch projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatusAPI(userId, newStatus);
      toast.success(`User ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleProjectStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await updateProjectStatusAPI(projectId, newStatus);
      toast.success(`Project ${newStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating project status:', error);
      toast.error('Failed to update project status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search users or projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Projects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{user.full_name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={user.status === 'approved' ? 'success' : 'secondary'}>
                          {user.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        onClick={() => handleUserStatusChange(user.id, 'approved')}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="destructive"
                        onClick={() => handleUserStatusChange(user.id, 'suspended')}
                        className="flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Suspend
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={project.status === 'open' ? 'secondary' : 'success'}>
                          {project.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="xs"
                        onClick={() => handleProjectStatusChange(project.id, 'archived')}
                        className="flex items-center gap-1"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleProjectStatusChange(project.id, 'open')}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Reactivate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}