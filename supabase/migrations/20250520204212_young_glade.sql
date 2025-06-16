/*
  # Fix user role permissions

  1. Changes
    - Create a secure function to get user role that doesn't try to set roles
    - Add policy to allow users to read their own role
    - Remove old function that tried to set roles

  2. Security
    - Function runs with invoker security to respect RLS
    - Users can only read their own role through RLS
*/

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.get_user_role(user_id uuid);

-- Create new function that simply reads the role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT user_role 
  FROM public.users 
  WHERE id = user_id;
$$;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add policy for reading own role
CREATE POLICY "Users can read their own role"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create is_admin function that checks role safely
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND user_role = 'admin'
  );
$$;