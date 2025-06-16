/*
  # Fix authentication permissions
  
  1. Changes
    - Remove all existing policies and functions
    - Create simple, clear RLS policies
    - Add basic insert policy for user creation
    
  2. Security
    - Enable RLS
    - Users can only read their own data
    - Admins can read all data
    - Allow authenticated users to create their profile
*/

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own role" ON public.users;
DROP POLICY IF EXISTS "Enable read access to own user" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Enable user creation" ON public.users;

-- Basic read policy for own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admin read policy
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
    AND u.user_role = 'admin'
  )
);

-- Allow user creation
CREATE POLICY "Enable insert for authentication"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);