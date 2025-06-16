/*
  # Update users table RLS policies

  1. Changes
    - Modify RLS policies for users table to properly handle admin role access
    - Add policies for reading user roles
    - Update admin role management policies

  2. Security
    - Enable RLS on users table (already enabled)
    - Add policy for reading own user role
    - Add policy for admin role management
    - Add policy for system-level user creation
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Allow self select" ON public.users;
DROP POLICY IF EXISTS "Open access for debugging" ON public.users;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.users;
DROP POLICY IF EXISTS "System can create users" ON public.users;

-- Create new policies with proper permissions
-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins to read all user data
CREATE POLICY "Admins can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users AS admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
);

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles"
ON public.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users AS admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users AS admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
);

-- Allow system-level user creation
CREATE POLICY "Enable user creation"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND user_role = 'admin'
  );
$$;