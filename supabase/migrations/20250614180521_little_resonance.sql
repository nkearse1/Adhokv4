/*
  # Fix user lookup function
  
  1. Drop existing function if it exists
  2. Create new function to lookup user by username or email
  3. Grant proper permissions
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_by_username_or_email(text);

-- Create function to lookup user by username or email
CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier text)
RETURNS TABLE(
  id uuid,
  email text,
  username text,
  user_role text
)
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
  FROM public.users u
  WHERE u.username = identifier OR u.email = identifier;
END;
$$;

-- Grant execute permission to authenticated and anonymous users (needed for login)
GRANT EXECUTE ON FUNCTION public.get_user_by_username_or_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_by_username_or_email(text) TO anon;