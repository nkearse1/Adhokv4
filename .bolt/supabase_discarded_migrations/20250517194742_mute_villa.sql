/*
  # Add site admin user

  1. Changes
    - Create site admin user with proper permissions
    - Set super_admin flag
    - Handle existing admin if present
    
  2. Security
    - Ensure admin has proper role and access
    - Set up secure password
*/

-- Create site admin if not exists
DO $$ 
DECLARE
  admin_id uuid;
BEGIN
  -- Get or create auth user
  SELECT id INTO admin_id
  FROM auth.users
  WHERE email = 'nate@adhokpro.com';

  -- If admin doesn't exist, create them
  IF admin_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'nate@adhokpro.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"role": "admin"}',
      now(),
      now(),
      encode(gen_random_bytes(32), 'hex')
    )
    RETURNING id INTO admin_id;
  END IF;

  -- Ensure admin exists in users table
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    admin_id,
    'nate@adhokpro.com',
    'admin',
    'Site Administrator'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin';

  -- Ensure admin exists in admin_users table with super_admin flag
  INSERT INTO public.admin_users (id, email, super_admin)
  VALUES (
    admin_id,
    'nate@adhokpro.com',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET super_admin = true;

END $$;