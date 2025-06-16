/*
  # Add username lookup function for authentication

  1. New Functions
    - `get_user_by_username_or_email(identifier TEXT)` - Returns user data by email or username
      - Enables sign-in with either email or username
      - Returns id, email, username, and user_role for matching users
  
  2. Security
    - Function is accessible to authenticated and anonymous users for login purposes
    - Only returns necessary fields for authentication flow
*/

CREATE OR REPLACE FUNCTION get_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(id UUID, email TEXT, username TEXT, user_role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.username,
    u.user_role
  FROM
    public.users u
  WHERE
    u.email = identifier OR u.username = identifier;
END;
$$;

-- Grant execute permissions to allow login functionality
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(TEXT) TO authenticated;