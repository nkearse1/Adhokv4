import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@supabase/supabaseClient';

export default function AdminClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, company_id, created_at, user_role, company_profiles (name)')
        .eq('id', id)
        .single();

      if (!error) setClient(data);
    };

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, deadline')
        .eq('client_id', id)
        .order('created_at', { ascending: false });

      if (!error) setProjects(data);
    };

    Promise.all([fetchClient(), fetchProjects()]).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6">Loading client details...</div>;
  if (!client) return <div className="p-6 text-red-500">Client not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Client Details</h2>
        <Button onClick={() => navigate(-1)} variant="outline">
          Back
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <strong>Name:</strong> {client.full_name}
          </div>
          <div>
            <strong>Email:</strong> {client.email}
          </div>
          <div>
            <strong>Company:</strong> {client.company_profiles?.name || '—'}
          </div>
          <div>
            <strong>Role:</strong> <Badge variant="outline">{client.user_role}</Badge>
          </div>
          <div>
            <strong>Joined:</strong> {new Date(client.created_at).toLocaleDateString()}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project History</h3>
          {projects.length === 0 ? (
            <div className="text-gray-500">No projects found for this client.</div>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <li
                  key={project.id}
                  className="border rounded p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/admin/projects/${project.id}`)}
                >
                  <div className="font-medium">{project.title}</div>
                  <div className="text-sm text-gray-500">Status: {project.status}</div>
                  <div className="text-sm text-gray-500">
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}