/*
  # Fix user role policies

  1. Changes
    - Add RLS policies for users table to allow reading own user role
    - Ensure proper access control for user role information

  2. Security
    - Enable RLS on users table
    - Add policy for authenticated users to read their own data
    - Prevent direct role modifications from client side
*/

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Admins can read all users" ON users;

-- Create policy for users to read their own data
CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy for admins to read all users
CREATE POLICY "Admins can read all users"
ON users
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