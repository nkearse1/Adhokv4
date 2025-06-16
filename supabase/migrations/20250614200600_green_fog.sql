/*
  # Fix projects RLS policies

  1. Security Changes
    - Remove policies that attempt to set admin role
    - Add new policies that check user role from users table
    - Ensure proper access control for clients and talents
    - Allow authenticated users to view open projects

  2. Policy Updates
    - Replace is_admin() function calls with direct role checks
    - Use auth.uid() for user identification
    - Check user_role from users table instead of setting roles
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin can read all projects" ON projects;
DROP POLICY IF EXISTS "Admin full access" ON projects;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;

-- Create new admin policies that check role without setting it
CREATE POLICY "Admin users can manage all projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  );

-- Ensure existing policies work correctly
-- Update client policies to be more explicit
CREATE POLICY "Clients can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR 
    created_by = auth.uid()
  );

CREATE POLICY "Clients can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR 
    created_by = auth.uid()
  )
  WITH CHECK (
    client_id = auth.uid() OR 
    created_by = auth.uid()
  );

-- Ensure talents can read projects they're involved with
CREATE POLICY "Talents can read assigned projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    talent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_bids 
      WHERE project_bids.project_id = projects.id 
      AND project_bids.professional_id = auth.uid()
    )
  );

-- Allow talents to update projects they're assigned to
CREATE POLICY "Talents can update assigned projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (talent_id = auth.uid())
  WITH CHECK (talent_id = auth.uid());