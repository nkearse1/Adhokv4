import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useLayoutEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';

import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import RoleRoute from './components/routing/RoleRoute';
import { ProjectUploadFlow } from './components/ProjectUploadFlow';
import AdminTalentList from './components/AdminTalentList';

import AdminClientDetails from './pages/admin/clients/AdminClientDetails';
import TalentSignUpPage from './pages/talent/SignUp';
import SignInPage from './pages/SignIn';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import TalentProjectsPage from './pages/talent/projects';
import TalentDashboard from './pages/talent/dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProjectDetail from './pages/admin/projects/AdminProjectDetail';
import AdminTalentDetails from './pages/admin/talent/AdminTalentDetails';
import ClientProjectDetail from './pages/client/projects/ClientProjectDetail';
import ClientProjectWorkspace from './pages/client/projects/ClientProjectWorkspace';
import ProjectWorkspace from './pages/talent/projects/ProjectWorkspace';
import TalentProjectDetail from './pages/talent/projects/TalentProjectDetail';
import WaitlistPage from './pages/waitlist';
import Home from './pages/Home';
import ClientDashboard from './pages/client/dashboard';
import TalentPortfolioPage from './pages/talent/[user_id]/portfolio.tsx';
import { Header } from '@/components/Header';

function AppRoutes() {
  const { isAuthenticated, userRole, authUser, username, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirected, setRedirected] = useState(false);

  useLayoutEffect(() => {
    if (!loading && isAuthenticated && userRole && !redirected) {
      const loginRoutes = ['/signin', '/talent/signup'];
      const alreadyRedirected =
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/client') ||
        location.pathname.startsWith('/talent');

      if (loginRoutes.includes(location.pathname) && !alreadyRedirected) {
        const userId = authUser?.id;
        const userUsername =
          username || authUser?.user_metadata?.username || authUser?.id;

        switch (userRole) {
          case 'admin':
            navigate(`/admin/${userId}/dashboard`, { replace: true });
            break;
          case 'client':
            navigate(`/client/${userId}/dashboard`, { replace: true });
            break;
          case 'talent':
          default:
            navigate(`/talent/${userUsername}/dashboard`, { replace: true });
            break;
        }

        setRedirected(true);
      }
    }
  }, [isAuthenticated, loading, userRole, location.pathname, navigate, authUser, username, redirected]);

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/waitlist" element={<WaitlistPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/talent/signup" element={<TalentSignUpPage />} />

        <Route path="/talent" element={<PrivateRoute />}>
          <Route path=":user_id/dashboard" element={<TalentDashboard />} />
          <Route path="projects" element={<TalentProjectsPage />} />
          <Route path="projects/:id" element={<TalentProjectDetail />} />
          <Route path="projects/:id/workspace" element={<ProjectWorkspace />} />
          <Route path=":user_id/portfolio" element={<TalentPortfolioPage />} />
        </Route>

        <Route path="/client" element={<RoleRoute allowedRoles={['client']} />}>
          <Route path=":user_id/dashboard" element={<ClientDashboard />} />
          <Route path="projects/:id" element={<ClientProjectDetail />} />
          <Route path="projects/:id/workspace" element={<ClientProjectWorkspace />} />
        </Route>

        <Route path="/admin" element={<AdminRoute />}>
          <Route path=":user_id/dashboard" element={<AdminDashboard />} />
          <Route path="projects/:id" element={<AdminProjectDetail />} />
          <Route path="talent" element={<AdminTalentList />} />
          <Route path="talent/:id" element={<AdminTalentDetails />} />
          <Route path="clients/:id" element={<AdminClientDetails />} />
        </Route>

        <Route path="/upload" element={<ProjectUploadFlow />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default AppRoutes;
