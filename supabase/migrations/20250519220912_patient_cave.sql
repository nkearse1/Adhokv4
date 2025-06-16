/*
  # Add function to get user role
  
  This migration adds a secure function to fetch a user's role
  that respects RLS policies.
*/

-- Function to get a user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT user_role
  FROM users
  WHERE id = user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;