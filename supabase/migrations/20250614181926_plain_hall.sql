/*
  # Create RPC Functions for User Lookup

  1. Functions
    - `get_user_by_username_or_email` - Lookup user by username or email
    
  2. Security
    - Function is accessible to authenticated users
    - Returns limited user information for authentication purposes
*/

-- Function to get user by username or email
CREATE OR REPLACE FUNCTION get_user_by_username_or_email(identifier text)
RETURNS TABLE(id uuid, email text, username text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First try to find by email
  IF identifier LIKE '%@%' THEN
    RETURN QUERY
    SELECT u.id, u.email, u.username
    FROM users u
    WHERE u.email = identifier
    LIMIT 1;
  ELSE
    -- Try to find by username
    RETURN QUERY
    SELECT u.id, u.email, u.username
    FROM users u
    WHERE u.username = identifier
    LIMIT 1;
  END IF;
  
  -- If no results found, return empty
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(text) TO anon;