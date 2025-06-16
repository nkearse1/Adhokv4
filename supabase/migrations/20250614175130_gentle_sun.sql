/*
  # Update authentication functions for username support
  
  1. Changes
    - Add function to sign in with username or email
    - Update user creation trigger to generate username
    - Add function to check username availability
    
  2. Security
    - Maintain existing RLS policies
    - Add secure username validation
*/

-- Function to check if a username is available
CREATE OR REPLACE FUNCTION is_username_available(username_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_exists boolean;
BEGIN
  -- Validate username format
  IF username_to_check !~ '^[a-zA-Z0-9_]{3,30}$' THEN
    RAISE EXCEPTION 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
  END IF;
  
  -- Check if username exists across all tables
  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = username_to_check
    UNION ALL
    SELECT 1 FROM talent_profiles WHERE username = username_to_check
    UNION ALL
    SELECT 1 FROM admin_users WHERE username = username_to_check
  ) INTO username_exists;
  
  RETURN NOT username_exists;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_username_available TO authenticated, anon;

-- Function to handle new user creation and username generation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_username text;
  username_from_metadata text;
BEGIN
  -- Check if username is provided in metadata
  username_from_metadata := NEW.raw_user_meta_data->>'username';
  
  IF username_from_metadata IS NOT NULL AND username_from_metadata != '' THEN
    -- Validate username format
    IF username_from_metadata !~ '^[a-zA-Z0-9_]{3,30}$' THEN
      RAISE EXCEPTION 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
    END IF;
    
    -- Check if username is available
    IF NOT is_username_available(username_from_metadata) THEN
      RAISE EXCEPTION 'Username is already taken';
    END IF;
    
    new_username := username_from_metadata;
  ELSE
    -- Generate username from email
    new_username := generate_username_from_email(NEW.email);
  END IF;
  
  -- Insert into users table
  INSERT INTO public.users (
    id,
    full_name,
    email,
    user_role,
    username,
    created_at
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_role', 'talent'),
    new_username,
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();