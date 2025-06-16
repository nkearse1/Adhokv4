/*
  # Fix admin function dependencies
  
  1. Changes
    - Drop dependent policies first
    - Update admin access checks to use metadata
    - Remove is_admin() function
    - Create new policies with direct role checks
*/

-- First, drop all dependent policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
DROP POLICY IF EXISTS "Admins can view all profiles" ON talent_profiles;
DROP POLICY IF EXISTS "Admins can view audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Enable admin read access to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Enable admin updates to waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow admins to manage templates" ON project_brief_templates;
DROP POLICY IF EXISTS "Enable admin access to notifications" ON waitlist_notifications;
DROP POLICY IF EXISTS "Allow admins to manage categories" ON project_categories;
DROP POLICY IF EXISTS "Allow admins to manage templates" ON project_templates;
DROP POLICY IF EXISTS "Admins can manage escrow" ON escrow_transactions;
DROP POLICY IF EXISTS "Admin full access" ON admin_users;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS public.is_admin();

-- Create new policies with direct role checks
CREATE POLICY "Admin view all users"
ON admin_users
FOR SELECT
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin manage projects"
ON projects
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin view profiles"
ON talent_profiles
FOR SELECT
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin view audit logs"
ON admin_audit_logs
FOR SELECT
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin read waitlist"
ON waitlist
FOR SELECT
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin update waitlist"
ON waitlist
FOR UPDATE
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin manage brief templates"
ON project_brief_templates
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin access notifications"
ON waitlist_notifications
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin manage project categories"
ON project_categories
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin manage project templates"
ON project_templates
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin manage escrow"
ON escrow_transactions
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin full access users"
ON admin_users
FOR ALL
TO authenticated
USING (
  (SELECT user_metadata->>'user_role' FROM auth.users WHERE id = auth.uid()) = 'admin'
);