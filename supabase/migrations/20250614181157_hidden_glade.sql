/*
  # Add mock users to database
  
  1. New Data
    - Mock users in auth.users and public.users tables
    - Mock talent profiles with correct enum values
    - Mock projects with proper metadata
    - Mock admin user
    
  2. Security
    - Uses secure functions to organize code
    - Proper password hashing for auth users
    - Correct enum values for expertise levels
*/

-- Function to create mock users in auth.users
CREATE OR REPLACE FUNCTION create_mock_auth_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mock_users JSONB;
BEGIN
  -- Define mock users
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

  -- Insert or update auth.users
  FOR i IN 0..jsonb_array_length(mock_users) - 1 LOOP
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      raw_app_meta_data
    )
    VALUES (
      (mock_users->i->>'id')::uuid,
      mock_users->i->>'email',
      mock_users->i->>'password_hash',
      now(),
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
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      raw_user_meta_data = EXCLUDED.raw_user_meta_data,
      raw_app_meta_data = EXCLUDED.raw_app_meta_data;
  END LOOP;
END;
$$;

-- Function to create mock users in public.users
CREATE OR REPLACE FUNCTION create_mock_public_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mock_users JSONB;
BEGIN
  -- Define mock users
  mock_users := '[
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "email": "admin@example.com",
      "full_name": "Admin User",
      "user_role": "admin",
      "username": "admin_user"
    },
    {
      "id": "00000000-0000-0000-0000-000000000002",
      "email": "client1@example.com",
      "full_name": "Sarah Johnson",
      "user_role": "client",
      "username": "sarah_johnson"
    },
    {
      "id": "00000000-0000-0000-0000-000000000003",
      "email": "client2@example.com",
      "full_name": "Michael Chen",
      "user_role": "client",
      "username": "michael_chen"
    },
    {
      "id": "00000000-0000-0000-0000-000000000004",
      "email": "client3@example.com",
      "full_name": "Emily Rodriguez",
      "user_role": "client",
      "username": "emily_rodriguez"
    },
    {
      "id": "00000000-0000-0000-0000-000000000005",
      "email": "client4@example.com",
      "full_name": "David Thompson",
      "user_role": "client",
      "username": "david_thompson"
    },
    {
      "id": "00000000-0000-0000-0000-000000000006",
      "email": "talent1@example.com",
      "full_name": "Alex Rivera",
      "user_role": "talent",
      "username": "alex_rivera"
    },
    {
      "id": "00000000-0000-0000-0000-000000000007",
      "email": "talent2@example.com",
      "full_name": "Jessica Park",
      "user_role": "talent",
      "username": "jessica_park"
    },
    {
      "id": "00000000-0000-0000-0000-000000000008",
      "email": "talent3@example.com",
      "full_name": "Marcus Williams",
      "user_role": "talent",
      "username": "marcus_williams"
    },
    {
      "id": "00000000-0000-0000-0000-000000000009",
      "email": "talent4@example.com",
      "full_name": "Sophie Anderson",
      "user_role": "talent",
      "username": "sophie_anderson"
    }
  ]'::jsonb;

  -- Insert or update public.users
  FOR i IN 0..jsonb_array_length(mock_users) - 1 LOOP
    INSERT INTO public.users (
      id,
      email,
      full_name,
      user_role,
      username,
      created_at
    )
    VALUES (
      (mock_users->i->>'id')::uuid,
      mock_users->i->>'email',
      mock_users->i->>'full_name',
      mock_users->i->>'user_role',
      mock_users->i->>'username',
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      user_role = EXCLUDED.user_role,
      username = EXCLUDED.username;
  END LOOP;
END;
$$;

-- Function to create mock talent profiles
CREATE OR REPLACE FUNCTION create_mock_talent_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mock_profiles JSONB;
BEGIN
  -- Define mock talent profiles
  mock_profiles := '[
    {
      "id": "00000000-0000-0000-0000-000000000006",
      "full_name": "Alex Rivera",
      "email": "talent1@example.com",
      "username": "alex_rivera",
      "phone": "+1 (555) 123-4567",
      "location": "Austin, TX",
      "linkedin": "https://linkedin.com/in/alexrivera",
      "portfolio": "https://alexrivera.dev",
      "bio": "Senior SEO specialist with 8+ years of experience helping e-commerce brands achieve 200%+ organic traffic growth. Specialized in technical SEO, content strategy, and conversion optimization.",
      "expertise": "SEO & Content Strategy",
      "resume_url": "https://example.com/resume1.pdf",
      "is_qualified": true,
      "experience_badge": "Expert Talent",
      "portfolio_visible": true
    },
    {
      "id": "00000000-0000-0000-0000-000000000007",
      "full_name": "Jessica Park",
      "email": "talent2@example.com",
      "username": "jessica_park",
      "phone": "+1 (555) 234-5678",
      "location": "San Francisco, CA",
      "linkedin": "https://linkedin.com/in/jessicapark",
      "portfolio": "https://jessicapark.design",
      "bio": "Creative social media strategist with expertise in viral content creation, influencer partnerships, and community building. Helped 50+ brands grow their social presence.",
      "expertise": "Social Media Marketing",
      "resume_url": "https://example.com/resume2.pdf",
      "is_qualified": true,
      "experience_badge": "Pro Talent",
      "portfolio_visible": true
    },
    {
      "id": "00000000-0000-0000-0000-000000000008",
      "full_name": "Marcus Williams",
      "email": "talent3@example.com",
      "username": "marcus_williams",
      "phone": "+1 (555) 345-6789",
      "location": "New York, NY",
      "linkedin": "https://linkedin.com/in/marcuswilliams",
      "portfolio": "https://marcuswrites.com",
      "bio": "Professional copywriter and content strategist specializing in B2B SaaS companies. Expert in conversion-focused copy, email marketing, and thought leadership content.",
      "expertise": "Content Writing & Strategy",
      "resume_url": "https://example.com/resume3.pdf",
      "is_qualified": true,
      "experience_badge": "Pro Talent",
      "portfolio_visible": true
    },
    {
      "id": "00000000-0000-0000-0000-000000000009",
      "full_name": "Sophie Anderson",
      "email": "talent4@example.com",
      "username": "sophie_anderson",
      "phone": "+1 (555) 456-7890",
      "location": "Seattle, WA",
      "linkedin": "https://linkedin.com/in/sophieanderson",
      "portfolio": "https://sophiedesigns.co",
      "bio": "UX/UI designer and web developer with a passion for creating beautiful, user-friendly digital experiences. Specialized in e-commerce and SaaS product design.",
      "expertise": "Web Design & Development",
      "resume_url": "https://example.com/resume4.pdf",
      "is_qualified": true,
      "experience_badge": "Specialist",
      "portfolio_visible": true
    }
  ]'::jsonb;

  -- Insert or update talent_profiles
  FOR i IN 0..jsonb_array_length(mock_profiles) - 1 LOOP
    INSERT INTO talent_profiles (
      id,
      full_name,
      email,
      username,
      phone,
      location,
      linkedin,
      portfolio,
      bio,
      expertise,
      resume_url,
      is_qualified,
      experience_badge,
      portfolio_visible,
      created_at
    )
    VALUES (
      (mock_profiles->i->>'id')::uuid,
      mock_profiles->i->>'full_name',
      mock_profiles->i->>'email',
      mock_profiles->i->>'username',
      mock_profiles->i->>'phone',
      mock_profiles->i->>'location',
      mock_profiles->i->>'linkedin',
      mock_profiles->i->>'portfolio',
      mock_profiles->i->>'bio',
      mock_profiles->i->>'expertise',
      mock_profiles->i->>'resume_url',
      (mock_profiles->i->>'is_qualified')::boolean,
      mock_profiles->i->>'experience_badge',
      (mock_profiles->i->>'portfolio_visible')::boolean,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      username = EXCLUDED.username,
      phone = EXCLUDED.phone,
      location = EXCLUDED.location,
      linkedin = EXCLUDED.linkedin,
      portfolio = EXCLUDED.portfolio,
      bio = EXCLUDED.bio,
      expertise = EXCLUDED.expertise,
      resume_url = EXCLUDED.resume_url,
      is_qualified = EXCLUDED.is_qualified,
      experience_badge = EXCLUDED.experience_badge,
      portfolio_visible = EXCLUDED.portfolio_visible;
  END LOOP;
END;
$$;

-- Function to create mock projects
CREATE OR REPLACE FUNCTION create_mock_projects()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mock_projects JSONB;
BEGIN
  -- Define mock projects with correct enum values
  mock_projects := '[
    {
      "id": "00000000-0000-0000-0000-000000000101",
      "title": "E-commerce SEO Optimization",
      "description": "Comprehensive SEO audit and optimization for a growing e-commerce website selling sustainable products.",
      "deadline": "2025-07-15T00:00:00Z",
      "project_budget": 3500,
      "status": "open",
      "created_by": "00000000-0000-0000-0000-000000000002",
      "client_id": "00000000-0000-0000-0000-000000000002",
      "minimum_badge": "Expert Talent",
      "metadata": {
        "requestor": {
          "name": "Sarah Johnson",
          "email": "client1@example.com",
          "company": "EcoShop Inc.",
          "phone": "+1 (555) 111-2222"
        },
        "marketing": {
          "expertiseLevel": "expert",
          "audience": "Eco-conscious consumers aged 25-45",
          "channels": ["SEO", "Content Marketing", "Technical Optimization"],
          "deliverables": "Technical SEO audit, keyword strategy, content optimization plan, performance tracking setup",
          "problem": "Low organic search visibility and poor technical SEO performance affecting customer acquisition",
          "target_audience": "E-commerce shoppers interested in sustainable products",
          "platforms": "Shopify, Google Search Console, Google Analytics 4",
          "preferred_tools": "Ahrefs, Screaming Frog, Surfer SEO",
          "brand_voice": "Professional yet approachable, sustainability-focused",
          "inspiration_links": "https://patagonia.com, https://allbirds.com"
        }
      }
    },
    {
      "id": "00000000-0000-0000-0000-000000000102",
      "title": "Social Media Campaign Launch",
      "description": "Create and execute a viral social media campaign for a new product launch targeting Gen Z consumers.",
      "deadline": "2025-07-01T00:00:00Z",
      "project_budget": 2800,
      "status": "open",
      "created_by": "00000000-0000-0000-0000-000000000003",
      "client_id": "00000000-0000-0000-0000-000000000003",
      "minimum_badge": "Pro Talent",
      "metadata": {
        "requestor": {
          "name": "Michael Chen",
          "email": "client2@example.com",
          "company": "TechStart Labs",
          "phone": "+1 (555) 222-3333"
        },
        "marketing": {
          "expertiseLevel": "mid",
          "audience": "Gen Z consumers aged 16-24",
          "channels": ["Social Media", "Influencer Marketing", "Content Creation"],
          "deliverables": "Social media strategy, content calendar, influencer outreach plan, campaign analytics",
          "problem": "Need to build brand awareness and generate buzz for new product launch",
          "target_audience": "Tech-savvy Gen Z consumers interested in innovative products",
          "platforms": "Instagram, TikTok, Twitter, YouTube",
          "preferred_tools": "Hootsuite, Canva, Later, Creator.co",
          "brand_voice": "Bold, authentic, trendy, relatable",
          "inspiration_links": "https://glossier.com, https://fenty.com"
        }
      }
    },
    {
      "id": "00000000-0000-0000-0000-000000000103",
      "title": "B2B Content Strategy Development",
      "description": "Develop a comprehensive content marketing strategy for a B2B SaaS company targeting enterprise clients.",
      "deadline": "2025-07-30T00:00:00Z",
      "project_budget": 4200,
      "status": "open",
      "created_by": "00000000-0000-0000-0000-000000000004",
      "client_id": "00000000-0000-0000-0000-000000000004",
      "minimum_badge": "Pro Talent",
      "metadata": {
        "requestor": {
          "name": "Emily Rodriguez",
          "email": "client3@example.com",
          "company": "DataFlow Solutions",
          "phone": "+1 (555) 333-4444"
        },
        "marketing": {
          "expertiseLevel": "mid",
          "audience": "Enterprise decision makers and IT professionals",
          "channels": ["Content Marketing", "Thought Leadership", "Email Marketing"],
          "deliverables": "Content strategy document, editorial calendar, thought leadership articles, case studies",
          "problem": "Struggling to generate qualified leads and establish thought leadership in competitive market",
          "target_audience": "CTOs, IT Directors, and enterprise software buyers",
          "platforms": "LinkedIn, company blog, industry publications",
          "preferred_tools": "HubSpot, SEMrush, BuzzSumo, Grammarly",
          "brand_voice": "Professional, authoritative, data-driven, trustworthy",
          "inspiration_links": "https://hubspot.com/blog, https://salesforce.com/resources"
        }
      }
    },
    {
      "id": "00000000-0000-0000-0000-000000000104",
      "title": "Website Redesign & UX Optimization",
      "description": "Complete website redesign with focus on user experience, conversion optimization, and mobile responsiveness.",
      "deadline": "2025-08-15T00:00:00Z",
      "project_budget": 5500,
      "status": "open",
      "created_by": "00000000-0000-0000-0000-000000000005",
      "client_id": "00000000-0000-0000-0000-000000000005",
      "minimum_badge": "Specialist",
      "metadata": {
        "requestor": {
          "name": "David Thompson",
          "email": "client4@example.com",
          "company": "Local Services Pro",
          "phone": "+1 (555) 444-5555"
        },
        "marketing": {
          "expertiseLevel": "entry",
          "audience": "Local business owners and homeowners",
          "channels": ["Web Design", "UX/UI", "Conversion Optimization"],
          "deliverables": "Website wireframes, UI/UX design, responsive development, conversion optimization",
          "problem": "Current website has poor user experience and low conversion rates",
          "target_audience": "Local homeowners seeking professional services",
          "platforms": "WordPress, Google Analytics, Hotjar",
          "preferred_tools": "Figma, WordPress, Elementor, Google PageSpeed Insights",
          "brand_voice": "Trustworthy, professional, local, reliable",
          "inspiration_links": "https://angi.com, https://thumbtack.com"
        }
      }
    }
  ]'::jsonb;

  -- Insert or update projects
  FOR i IN 0..jsonb_array_length(mock_projects) - 1 LOOP
    INSERT INTO projects (
      id,
      title,
      description,
      deadline,
      project_budget,
      status,
      created_by,
      client_id,
      minimum_badge,
      metadata,
      created_at
    )
    VALUES (
      (mock_projects->i->>'id')::uuid,
      mock_projects->i->>'title',
      mock_projects->i->>'description',
      (mock_projects->i->>'deadline')::timestamptz,
      (mock_projects->i->>'project_budget')::numeric,
      mock_projects->i->>'status',
      (mock_projects->i->>'created_by')::uuid,
      (mock_projects->i->>'client_id')::uuid,
      mock_projects->i->>'minimum_badge',
      (mock_projects->i->>'metadata')::jsonb,
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      deadline = EXCLUDED.deadline,
      project_budget = EXCLUDED.project_budget,
      status = EXCLUDED.status,
      created_by = EXCLUDED.created_by,
      client_id = EXCLUDED.client_id,
      minimum_badge = EXCLUDED.minimum_badge,
      metadata = EXCLUDED.metadata;
  END LOOP;
END;
$$;

-- Create admin user record
CREATE OR REPLACE FUNCTION create_mock_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO admin_users (
    id,
    email,
    super_admin,
    username,
    created_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'admin@example.com',
    true,
    'admin_user',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    super_admin = EXCLUDED.super_admin,
    username = EXCLUDED.username;
END;
$$;

-- Execute all functions to create mock data
SELECT create_mock_auth_users();
SELECT create_mock_public_users();
SELECT create_mock_talent_profiles();
SELECT create_mock_projects();
SELECT create_mock_admin_user();

-- Drop the temporary functions
DROP FUNCTION create_mock_auth_users();
DROP FUNCTION create_mock_public_users();
DROP FUNCTION create_mock_talent_profiles();
DROP FUNCTION create_mock_projects();
DROP FUNCTION create_mock_admin_user();