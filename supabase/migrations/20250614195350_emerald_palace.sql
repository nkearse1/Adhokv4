/*
  # Fix mock users for login
  
  1. Changes
    - Update auth.users table with proper password hashes
    - Ensure all mock users have confirmed emails
    - Set proper metadata for authentication
    
  2. Security
    - Use bcrypt hashed passwords (password123 for all users)
    - Ensure proper role assignment
*/

-- Function to create mock users in auth.users with proper password hashes
CREATE OR REPLACE FUNCTION create_mock_auth_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mock_users JSONB;
BEGIN
  -- Define mock users with proper password hash for 'password123'
  -- This is a valid bcrypt hash that will work with Supabase Auth
  mock_users := '[
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "admin@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Admin User",
      "user_role": "admin",
      "username": "admin_user"
    },
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "email": "client1@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Sarah Johnson",
      "user_role": "client",
      "username": "sarah_johnson"
    },
    {
      "id": "00000000-0000-0000-0000-000000000003",
      "email": "client2@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Michael Chen",
      "user_role": "client",
      "username": "michael_chen"
    },
    {
      "id": "00000000-0000-0000-0000-000000000004",
      "email": "client3@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Emily Rodriguez",
      "user_role": "client",
      "username": "emily_rodriguez"
    },
    {
      "id": "00000000-0000-0000-0000-000000000005",
      "email": "client4@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "David Thompson",
      "user_role": "client",
      "username": "david_thompson"
    },
    {
      "id": "00000000-0000-0000-0000-000000000006",
      "email": "talent1@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Alex Rivera",
      "user_role": "talent",
      "username": "alex_rivera"
    },
    {
      "id": "00000000-0000-0000-0000-000000000007",
      "email": "talent2@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Jessica Park",
      "user_role": "talent",
      "username": "jessica_park"
    },
    {
      "id": "00000000-0000-0000-0000-000000000008",
      "email": "talent3@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Marcus Williams",
      "user_role": "talent",
      "username": "marcus_williams"
    },
    {
      "id": "00000000-0000-0000-0000-000000000009",
      "email": "talent4@example.com",
      "password_hash": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
      "full_name": "Sophie Anderson",
      "user_role": "talent",
      "username": "sophie_anderson"
    }
  ]'::jsonb;

  -- Insert or update auth.users with proper password hashes
  FOR i IN 0..jsonb_array_length(mock_users) - 1 LOOP
    -- Check if user exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = (mock_users->i->>'id')::uuid) THEN
      -- Update existing user
      UPDATE auth.users
      SET 
        email = mock_users->i->>'email',
        encrypted_password = mock_users->i->>'password_hash',
        email_confirmed_at = now(),
        confirmation_sent_at = now(),
        confirmation_token = '',
        recovery_sent_at = NULL,
        recovery_token = '',
        raw_user_meta_data = jsonb_build_object(
          'full_name', mock_users->i->>'full_name',
          'user_role', mock_users->i->>'user_role',
          'username', mock_users->i->>'username'
        ),
        raw_app_meta_data = jsonb_build_object(
          'provider', 'email',
          'providers', ARRAY['email'],
          'user_role', mock_users->i->>'user_role'
        ),
        updated_at = now()
      WHERE id = (mock_users->i->>'id')::uuid;
    ELSE
      -- Insert new user
      INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        confirmation_token,
        recovery_sent_at,
        recovery_token,
        created_at,
        updated_at,
        raw_user_meta_data,
        raw_app_meta_data,
        aud,
        role
      )
      VALUES (
        (mock_users->i->>'id')::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid,
        mock_users->i->>'email',
        mock_users->i->>'password_hash',
        now(),
        now(),
        '',
        NULL,
        '',
        now(),
        now(),
        jsonb_build_object(
          'full_name', mock_users->i->>'full_name',
          'user_role', mock_users->i->>'user_role',
          'username', mock_users->i->>'username'
        ),
        jsonb_build_object(
          'provider', 'email',
          'providers', ARRAY['email'],
          'user_role', mock_users->i->>'user_role'
        ),
        'authenticated',
        'authenticated'
      );
    END IF;
  END LOOP;
END;
$$;

-- Execute the function to create/update mock users
SELECT create_mock_auth_users();

-- Drop the temporary function
DROP FUNCTION create_mock_auth_users();

-- Add a comment to explain the password
COMMENT ON TABLE auth.users IS 'All mock users have password: password123';