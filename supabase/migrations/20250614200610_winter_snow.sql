/*
  # Fix project_bids RLS policies

  1. Security Changes
    - Remove policies that attempt to set admin role
    - Add new policies that check user role from users table
    - Ensure proper access control for bidding system

  2. Policy Updates
    - Replace is_admin() function calls with direct role checks
    - Use auth.uid() for user identification
    - Check user_role from users table instead of setting roles
*/

-- Drop existing problematic admin policy
DROP POLICY IF EXISTS "Admin can read all bids" ON project_bids;

-- Create new admin policy that checks role without setting it
CREATE POLICY "Admin users can manage all project bids"
  ON project_bids
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