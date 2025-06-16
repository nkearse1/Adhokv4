import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@supabase/supabaseClient';

type UserRole = 'admin' | 'client' | 'talent' | null;

interface AuthContextType {
  userId: string | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { user } = session;

      setIsAuthenticated(true);
      setUserId(user.id);

      // Get role from user metadata
      const role = user.user_metadata?.user_role as UserRole;
      setUserRole(role);
      setIsAdmin(role === 'admin');

      setLoading(false);
    } catch (error) {
      console.error('Error loading user session:', error);
      setIsAuthenticated(false);
      setUserId(null);
      setUserRole(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserSession();
      } else {
        setIsAuthenticated(false);
        setUserId(null);
        setUserRole(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    userId,
    userRole,
    isAuthenticated,
    isAdmin,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};