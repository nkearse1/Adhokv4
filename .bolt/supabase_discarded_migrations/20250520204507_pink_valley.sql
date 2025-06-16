/*
  # Simplify user permissions
  
  1. Changes
    - Remove all complex functions and policies
    - Create simple, clear RLS policies
    - Fix circular dependencies
    
  2. Security
    - Enable RLS
    - Basic read/write policies
    - No custom functions needed
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own role" ON public.users;
DROP POLICY IF EXISTS "Enable read access to own user" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Enable user creation" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;

-- Simple policy for reading own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Simple policy for admin access
CREATE POLICY "Admin access"
ON public.users
FOR ALL 
TO authenticated
USING (
  (SELECT user_role FROM public.users WHERE id = auth.uid()) = 'admin'
);