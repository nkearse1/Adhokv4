/*
  # Fix talent_profiles RLS policies

  1. Security Changes
    - Remove policies that attempt to set admin role
    - Add new policies that check user role from users table
    - Ensure talent users can access their own profiles
    - Allow public read access for portfolio visibility

  2. Policy Updates
    - Replace is_admin() function calls with direct role checks
    - Use auth.uid() for user identification
    - Check user_role from users table instead of setting roles
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON talent_profiles;
DROP POLICY IF EXISTS "Admins can view trust scores" ON talent_profiles;
DROP POLICY IF EXISTS "Allow admins to update qualification status" ON talent_profiles;

-- Create new admin policies that check role without setting it
CREATE POLICY "Admin users can view all talent profiles"
  ON talent_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.user_role = 'admin'
    )
  );

CREATE POLICY "Admin users can update talent profiles"
  ON talent_profiles
  FOR UPDATE
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

-- Ensure talent users can access their own profiles
CREATE POLICY "Talent users can read own profile"
  ON talent_profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Talent users can update own profile"
  ON talent_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow public read access for portfolio visibility (when portfolio_visible is true)
CREATE POLICY "Public can view visible talent portfolios"
  ON talent_profiles
  FOR SELECT
  TO public
  USING (portfolio_visible = true);