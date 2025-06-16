-- Function to get user by username or email (fixed version)
CREATE OR REPLACE FUNCTION get_user_by_username_or_email(identifier text)
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  user_role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_by_username_or_email(text) TO anon;

-- Function to check if user is admin
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
  RETURN user_role = 'admin';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Function to check if user is super admin
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin() TO authenticated;