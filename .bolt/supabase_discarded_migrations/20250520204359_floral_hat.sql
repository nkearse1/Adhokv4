/*
  # Simplify authentication system
  
  1. Changes
    - Remove all custom functions
    - Use simple RLS policies
    - Allow users to read their own data
    - Allow admins to read all data
    
  2. Security
    - Enable RLS
    - Add basic policies for data access
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies and functions
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own role" ON public.users;
DROP POLICY IF EXISTS "Enable read access to own user" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
DROP FUNCTION IF EXISTS public.is_admin();

-- Create basic read policy
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create admin read policy
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
);