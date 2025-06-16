-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own role" ON public.users;
DROP POLICY IF EXISTS "Enable read access to own user" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Enable user creation" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
DROP POLICY IF EXISTS "Admin access" ON public.users;

-- Simple policy for reading own data
CREATE POLICY "Enable read access for users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Enable inserts for new users
CREATE POLICY "Enable insert for users"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Enable updates for own data
CREATE POLICY "Enable update for users"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);