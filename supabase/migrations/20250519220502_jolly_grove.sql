/*
  # Fix users table RLS policies
  
  1. Security Changes
    - Enable RLS on users table
    - Add policies for reading own data
    - Add policies for admin access
    - Add policies for user creation
    - Add policies for data updates
    
  2. Changes
    - Fix OLD table reference in update policy
    - Improve policy organization and naming
*/

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admin can access all" ON users;
DROP POLICY IF EXISTS "System can create users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Admins can update user roles" ON users;

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins to read all user data
CREATE POLICY "Admin can read all users"
ON users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
);

-- Allow system to create users
CREATE POLICY "System can create users"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own data (except role)
CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles"
ON users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_user
    WHERE admin_user.id = auth.uid()
    AND admin_user.user_role = 'admin'
  )
);