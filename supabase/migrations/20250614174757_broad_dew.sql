/*
  # Add username system to all user tables
  
  1. Changes
    - Add username column to users table
    - Add username column to talent_profiles table
    - Add username column to admin_users table
    - Create unique constraints for usernames
    - Add function to generate unique usernames
    - Update RLS policies to support username lookup
    
  2. Security
    - Maintain existing RLS policies
    - Add username-based lookup policies
    - Ensure username uniqueness across the platform
*/

-- Add username column to users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE users ADD COLUMN username text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  END IF;
END $$;

-- Add username column to talent_profiles table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'talent_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN username text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_talent_profiles_username ON talent_profiles(username);
  END IF;
END $$;

-- Add username column to admin_users table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'username'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN username text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
  END IF;
END $$;

-- Function to generate unique username from email
CREATE OR REPLACE FUNCTION generate_username_from_email(email_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
  username_exists boolean;
BEGIN
  -- Extract username part from email (before @)
  base_username := lower(split_part(email_input, '@', 1));
  
  -- Remove any non-alphanumeric characters and replace with underscores
  base_username := regexp_replace(base_username, '[^a-z0-9]', '_', 'g');
  
  -- Remove leading/trailing underscores
  base_username := trim(base_username, '_');
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || '_user';
  END IF;
  
  -- Check if base username exists across all tables
  final_username := base_username;
  
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM users WHERE username = final_username
      UNION ALL
      SELECT 1 FROM talent_profiles WHERE username = final_username
      UNION ALL
      SELECT 1 FROM admin_users WHERE username = final_username
    ) INTO username_exists;
    
    IF NOT username_exists THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_username := base_username || '_' || counter;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Function to get user by username or email
CREATE OR REPLACE FUNCTION get_user_by_username_or_email(identifier text)
RETURNS TABLE(
  user_id uuid,
  email text,
  username text,
  full_name text,
  user_role text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id, email, username, full_name, user_role
  FROM users
  WHERE username = identifier OR email = identifier
  LIMIT 1;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_username_from_email TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email TO authenticated, anon;

-- Update existing users with generated usernames
UPDATE users 
SET username = generate_username_from_email(email)
WHERE username IS NULL AND email IS NOT NULL;

-- Update existing talent profiles with generated usernames
UPDATE talent_profiles 
SET username = generate_username_from_email(email)
WHERE username IS NULL AND email IS NOT NULL;

-- Update existing admin users with generated usernames
UPDATE admin_users 
SET username = generate_username_from_email(email)
WHERE username IS NULL AND email IS NOT NULL;

-- Add RLS policies for username-based access
CREATE POLICY "Users can read by username"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR username IS NOT NULL);

CREATE POLICY "Talent profiles can be read by username"
  ON talent_profiles
  FOR SELECT
  TO authenticated, anon
  USING (username IS NOT NULL);

-- Function to update username
CREATE OR REPLACE FUNCTION update_user_username(new_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  username_exists boolean;
BEGIN
  -- Get current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Validate username format
  IF new_username !~ '^[a-zA-Z0-9_]{3,30}$' THEN
    RAISE EXCEPTION 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
  END IF;
  
  -- Check if username exists across all tables
  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = new_username AND id != user_id
    UNION ALL
    SELECT 1 FROM talent_profiles WHERE username = new_username AND id != user_id
    UNION ALL
    SELECT 1 FROM admin_users WHERE username = new_username AND id != user_id
  ) INTO username_exists;
  
  IF username_exists THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  
  -- Update username in users table
  UPDATE users SET username = new_username WHERE id = user_id;
  
  -- Update username in talent_profiles if exists
  UPDATE talent_profiles SET username = new_username WHERE id = user_id;
  
  -- Update username in admin_users if exists
  UPDATE admin_users SET username = new_username WHERE id = user_id;
  
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION update_user_username TO authenticated;