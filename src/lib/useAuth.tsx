import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@supabase/supabaseClient';
import type { User } from '@supabase/supabase-js';

type UserRole = 'admin' | 'client' | 'talent' | null;

interface AuthState {
  authUser: User | null;
  userId: string | null;
  userRole: UserRole;
  username: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const defaultAuthState: AuthState = {
  authUser: null,
  userId: null,
  userRole: null,
  username: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: true,
};

const AuthContext = createContext<AuthState>(defaultAuthState);

// This is the hook you'll use in your components
export const useAuth = () => useContext(AuthContext);

// This is the provider you'll wrap your app with
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(defaultAuthState);

  const resetAuth = () => {
    setState({
      ...defaultAuthState,
      loading: false,
    });
  };

  const fetchUserDetails = async (user: User) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('user_role, username')
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        console.warn('[useAuth] Could not fetch user metadata:', error);
        resetAuth();
        return;
      }

      const role = userData.user_role as UserRole;
      const uname = userData.username || user.id;

      setState({
        authUser: user,
        userId: user.id,
        userRole: role,
        username: uname,
        isAuthenticated: true,
        isAdmin: role === 'admin',
        loading: false,
      });
    } catch (err) {
      console.error('[useAuth] Unexpected error during fetch:', err);
      resetAuth();
    }
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserDetails(session.user);
      } else {
        resetAuth();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserDetails(session.user);
      } else {
        resetAuth();
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};
