import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@supabase/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("[SIGNIN] Attempting login with email:", email);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("[SIGNIN] signInWithPassword() returned:", signInError);

      if (signInError) {
        throw signInError;
      }

      console.log("[SIGNIN] Fetching session...");
      const {
        data,
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("[SIGNIN] Session result:", data, sessionError);

      const session = data?.session;

      if (sessionError || !session?.user) {
        throw sessionError || new Error("Login succeeded but session is missing.");
      }

      const user = session.user;
      console.log("[SIGNIN] Authenticated user ID:", user.id);

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_role, username')
        .eq('id', user.id)
        .single();

      console.log("[SIGNIN] User table result:", userData, userError);

      if (userError || !userData) {
        throw new Error("User record missing from users table.");
      }

      const userRole = userData.user_role;
      const username = userData.username || user.id;

      let redirect = '/';
      if (userRole === 'admin') {
        redirect = `/admin/${user.id}/dashboard`;
      } else if (userRole === 'client') {
        redirect = `/client/${user.id}/dashboard`;
      } else {
        redirect = `/talent/${username}/dashboard`;
      }

      console.log("[SIGNIN] Navigating to:", redirect);
      navigate(redirect, { replace: true }); // ✅ Keeps session alive

    } catch (err: any) {
      console.error("[SIGNIN ERROR]", err);
      setError(err.message || 'Login failed');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="max-w-md mx-auto space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Input
        placeholder="Email address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}
