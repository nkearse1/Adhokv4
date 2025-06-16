/*
  # Add username triggers and functions
  
  1. Changes
    - Add trigger to sync username across tables
    - Add function to validate username format
    - Add function to check username uniqueness
    
  2. Security
    - Ensure username format validation
    - Prevent duplicate usernames across tables
*/

-- Function to sync username changes across tables
CREATE OR REPLACE FUNCTION sync_username_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If username is being updated in users table
  IF TG_TABLE_NAME = 'users' THEN
    -- Update talent_profiles if exists
    UPDATE talent_profiles
    SET username = NEW.username
    WHERE id = NEW.id;
    
    -- Update admin_users if exists
    UPDATE admin_users
    SET username = NEW.username
    WHERE id = NEW.id;
  
  -- If username is being updated in talent_profiles table
  ELSIF TG_TABLE_NAME = 'talent_profiles' THEN
    -- Update users if exists
    UPDATE users
    SET username = NEW.username
    WHERE id = NEW.id;
    
    -- Update admin_users if exists
    UPDATE admin_users
    SET username = NEW.username
    WHERE id = NEW.id;
  
  -- If username is being updated in admin_users table
  ELSIF TG_TABLE_NAME = 'admin_users' THEN
    -- Update users if exists
    UPDATE users
    SET username = NEW.username
    WHERE id = NEW.id;
    
    -- Update talent_profiles if exists
    UPDATE talent_profiles
    SET username = NEW.username
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for username sync
DROP TRIGGER IF EXISTS sync_username_users ON users;
CREATE TRIGGER sync_username_users
  AFTER UPDATE OF username ON users
  FOR EACH ROW
  WHEN (OLD.username IS DISTINCT FROM NEW.username)
  EXECUTE FUNCTION sync_username_changes();

DROP TRIGGER IF EXISTS sync_username_talent_profiles ON talent_profiles;
CREATE TRIGGER sync_username_talent_profiles
  AFTER UPDATE OF username ON talent_profiles
  FOR EACH ROW
  WHEN (OLD.username IS DISTINCT FROM NEW.username)
  EXECUTE FUNCTION sync_username_changes();

DROP TRIGGER IF EXISTS sync_username_admin_users ON admin_users;
CREATE TRIGGER sync_username_admin_users
  AFTER UPDATE OF username ON admin_users
  FOR EACH ROW
  WHEN (OLD.username IS DISTINCT FROM NEW.username)
  EXECUTE FUNCTION sync_username_changes();

-- Function to validate username before insert/update
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  username_exists boolean;
BEGIN
  -- Skip if username is not being changed
  IF TG_OP = 'UPDATE' AND NEW.username = OLD.username THEN
    RETURN NEW;
  END IF;
  
  -- Validate username format
  IF NEW.username !~ '^[a-zA-Z0-9_]{3,30}$' THEN
    RAISE EXCEPTION 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
  END IF;
  
  -- Check if username exists in any table (excluding current record)
  SELECT EXISTS (
    SELECT 1 FROM users WHERE username = NEW.username AND id != NEW.id
    UNION ALL
    SELECT 1 FROM talent_profiles WHERE username = NEW.username AND id != NEW.id
    UNION ALL
    SELECT 1 FROM admin_users WHERE username = NEW.username AND id != NEW.id
  ) INTO username_exists;
  
  IF username_exists THEN
    RAISE EXCEPTION 'Username already taken';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for username validation
DROP TRIGGER IF EXISTS validate_username_users ON users;
CREATE TRIGGER validate_username_users
  BEFORE INSERT OR UPDATE OF username ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();

DROP TRIGGER IF EXISTS validate_username_talent_profiles ON talent_profiles;
CREATE TRIGGER validate_username_talent_profiles
  BEFORE INSERT OR UPDATE OF username ON talent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();

DROP TRIGGER IF EXISTS validate_username_admin_users ON admin_users;
CREATE TRIGGER validate_username_admin_users
  BEFORE INSERT OR UPDATE OF username ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION validate_username();