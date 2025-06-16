import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/useAuth';

interface RoleRouteProps {
  user_role: string;
}

export default function RoleRoute({ user_role }: RoleRouteProps) {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const hasAccess = isAuthenticated && userRole === user_role;

  return hasAccess ? <Outlet /> : <Navigate to="/signin" />;
}