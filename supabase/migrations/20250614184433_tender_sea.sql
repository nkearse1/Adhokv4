/*
  # Fix authentication functions without breaking dependencies
  
  1. Functions
    - Update get_user_by_username_or_email function to work properly
    - Fix is_admin function to use SECURITY INVOKER
    - Fix is_super_admin function to use SECURITY INVOKER
    
  2. Security
    - Use CREATE OR REPLACE to avoid breaking policy dependencies
    - Set proper security context for functions
    - Grant appropriate permissions
*/

-- Update get_user_by_username_or_email function (create if doesn't exist)
CREATE OR REPLACE FUNCTION get_user_by_username_or_email(identifier text)
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  user_role text
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.username,
    u.user_role
  FROM public.users u
  WHERE u.email = identifier OR u.username = identifier;
END;
$$;

-- Update is_admin function (preserving existing dependencies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  user_role text;
BEGIN
  -- Get the user role from the users table
  SELECT u.user_role INTO user_role
  FROM public.users u
  WHERE u.id = auth.uid();
  
  -- Return true if user is admin
  RETURN COALESCE(user_role = 'admin', false);
END;
$$;

-- Update is_super_admin function (preserving existing dependencies)
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  is_super boolean;
BEGIN
  -- Check if user is a super admin
  SELECT super_admin INTO is_super
  FROM public.admin_users
  WHERE id = auth.uid();
  
  -- Return true if user is super admin
  RETURN COALESCE(is_super, false);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;