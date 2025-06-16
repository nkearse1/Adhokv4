import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nPlease check your .env file and ensure both variables are set.');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate username from email
function generateUsername(email: string, fullName: string): string {
  // Extract username part from email (before @)
  let username = email.split('@')[0].toLowerCase();
  
  // Remove any non-alphanumeric characters and replace with underscores
  username = username.replace(/[^a-z0-9]/g, '_');
  
  // Remove leading/trailing underscores
  username = username.replace(/^_+|_+$/g, '');
  
  // If username is too short, add part of the name
  if (username.length < 3) {
    const namePart = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    username = `${username}_${namePart}`.substring(0, 30);
  }
  
  return username;
}

// Mock user data
const mockUsers = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@example.com',
    password: 'password123',
    full_name: 'Admin User',
    user_role: 'admin',
    username: 'admin_user'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'client1@example.com',
    password: 'password123',
    full_name: 'Sarah Johnson',
    user_role: 'client',
    username: 'sarah_johnson'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'client2@example.com',
    password: 'password123',
    full_name: 'Michael Chen',
    user_role: 'client',
    username: 'michael_chen'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'client3@example.com',
    password: 'password123',
    full_name: 'Emily Rodriguez',
    user_role: 'client',
    username: 'emily_rodriguez'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'client4@example.com',
    password: 'password123',
    full_name: 'David Thompson',
    user_role: 'client',
    username: 'david_thompson'
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'talent1@example.com',
    password: 'password123',
    full_name: 'Alex Rivera',
    user_role: 'talent',
    username: 'alex_rivera'
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    email: 'talent2@example.com',
    password: 'password123',
    full_name: 'Jessica Park',
    user_role: 'talent',
    username: 'jessica_park'
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    email: 'talent3@example.com',
    password: 'password123',
    full_name: 'Marcus Williams',
    user_role: 'talent',
    username: 'marcus_williams'
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    email: 'talent4@example.com',
    password: 'password123',
    full_name: 'Sophie Anderson',
    user_role: 'talent',
    username: 'sophie_anderson'
  }
];

// Mock talent profiles
const mockTalentProfiles = [
  {
    id: '00000000-0000-0000-0000-000000000006',
    full_name: 'Alex Rivera',
    email: 'talent1@example.com',
    username: 'alex_rivera',
    phone: '+1 (555) 123-4567',
    location: 'Austin, TX',
    linkedin: 'https://linkedin.com/in/alexrivera',
    portfolio: 'https://alexrivera.dev',
    bio: 'Senior SEO specialist with 8+ years of experience helping e-commerce brands achieve 200%+ organic traffic growth. Specialized in technical SEO, content strategy, and conversion optimization.',
    expertise: 'SEO & Content Strategy',
    resume_url: 'https://example.com/resume1.pdf',
    is_qualified: true,
    experience_badge: 'Expert Talent',
    portfolio_visible: true
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    full_name: 'Jessica Park',
    email: 'talent2@example.com',
    username: 'jessica_park',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    linkedin: 'https://linkedin.com/in/jessicapark',
    portfolio: 'https://jessicapark.design',
    bio: 'Creative social media strategist with expertise in viral content creation, influencer partnerships, and community building. Helped 50+ brands grow their social presence.',
    expertise: 'Social Media Marketing',
    resume_url: 'https://example.com/resume2.pdf',
    is_qualified: true,
    experience_badge: 'Pro Talent',
    portfolio_visible: true
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    full_name: 'Marcus Williams',
    email: 'talent3@example.com',
    username: 'marcus_williams',
    phone: '+1 (555) 345-6789',
    location: 'New York, NY',
    linkedin: 'https://linkedin.com/in/marcuswilliams',
    portfolio: 'https://marcuswrites.com',
    bio: 'Professional copywriter and content strategist specializing in B2B SaaS companies. Expert in conversion-focused copy, email marketing, and thought leadership content.',
    expertise: 'Content Writing & Strategy',
    resume_url: 'https://example.com/resume3.pdf',
    is_qualified: true,
    experience_badge: 'Pro Talent',
    portfolio_visible: true
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    full_name: 'Sophie Anderson',
    email: 'talent4@example.com',
    username: 'sophie_anderson',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    linkedin: 'https://linkedin.com/in/sophieanderson',
    portfolio: 'https://sophiedesigns.co',
    bio: 'UX/UI designer and web developer with a passion for creating beautiful, user-friendly digital experiences. Specialized in e-commerce and SaaS product design.',
    expertise: 'Web Design & Development',
    resume_url: 'https://example.com/resume4.pdf',
    is_qualified: true,
    experience_badge: 'Specialist',
    portfolio_visible: true
  }
];

// Mock projects
const mockProjects = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    title: 'E-commerce SEO Optimization',
    description: 'Comprehensive SEO audit and optimization for a growing e-commerce website selling sustainable products.',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 3500,
    status: 'open',
    created_by: '00000000-0000-0000-0000-000000000002',
    client_id: '00000000-0000-0000-0000-000000000002',
    minimum_badge: 'Expert Talent',
    category_id: null,
    metadata: {
      requestor: {
        name: 'Sarah Johnson',
        email: 'client1@example.com',
        company: 'EcoShop Inc.',
        phone: '+1 (555) 111-2222'
      },
      marketing: {
        expertiseLevel: 'Expert',
        audience: 'Eco-conscious consumers aged 25-45',
        channels: ['SEO', 'Content Marketing', 'Technical Optimization'],
        deliverables: 'Technical SEO audit, keyword strategy, content optimization plan, performance tracking setup',
        problem: 'Low organic search visibility and poor technical SEO performance affecting customer acquisition',
        target_audience: 'E-commerce shoppers interested in sustainable products',
        platforms: 'Shopify, Google Search Console, Google Analytics 4',
        preferred_tools: 'Ahrefs, Screaming Frog, Surfer SEO',
        brand_voice: 'Professional yet approachable, sustainability-focused',
        inspiration_links: 'https://patagonia.com, https://allbirds.com'
      }
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    title: 'Social Media Campaign Launch',
    description: 'Create and execute a viral social media campaign for a new product launch targeting Gen Z consumers.',
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 2800,
    status: 'open',
    created_by: '00000000-0000-0000-0000-000000000003',
    client_id: '00000000-0000-0000-0000-000000000003',
    minimum_badge: 'Pro Talent',
    category_id: null,
    metadata: {
      requestor: {
        name: 'Michael Chen',
        email: 'client2@example.com',
        company: 'TechStart Labs',
        phone: '+1 (555) 222-3333'
      },
      marketing: {
        expertiseLevel: 'Pro Talent',
        audience: 'Gen Z consumers aged 16-24',
        channels: ['Social Media', 'Influencer Marketing', 'Content Creation'],
        deliverables: 'Social media strategy, content calendar, influencer outreach plan, campaign analytics',
        problem: 'Need to build brand awareness and generate buzz for new product launch',
        target_audience: 'Tech-savvy Gen Z consumers interested in innovative products',
        platforms: 'Instagram, TikTok, Twitter, YouTube',
        preferred_tools: 'Hootsuite, Canva, Later, Creator.co',
        brand_voice: 'Bold, authentic, trendy, relatable',
        inspiration_links: 'https://glossier.com, https://fenty.com'
      }
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    title: 'B2B Content Strategy Development',
    description: 'Develop a comprehensive content marketing strategy for a B2B SaaS company targeting enterprise clients.',
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 4200,
    status: 'open',
    created_by: '00000000-0000-0000-0000-000000000004',
    client_id: '00000000-0000-0000-0000-000000000004',
    minimum_badge: 'Pro Talent',
    category_id: null,
    metadata: {
      requestor: {
        name: 'Emily Rodriguez',
        email: 'client3@example.com',
        company: 'DataFlow Solutions',
        phone: '+1 (555) 333-4444'
      },
      marketing: {
        expertiseLevel: 'Pro Talent',
        audience: 'Enterprise decision makers and IT professionals',
        channels: ['Content Marketing', 'Thought Leadership', 'Email Marketing'],
        deliverables: 'Content strategy document, editorial calendar, thought leadership articles, case studies',
        problem: 'Struggling to generate qualified leads and establish thought leadership in competitive market',
        target_audience: 'CTOs, IT Directors, and enterprise software buyers',
        platforms: 'LinkedIn, company blog, industry publications',
        preferred_tools: 'HubSpot, SEMrush, BuzzSumo, Grammarly',
        brand_voice: 'Professional, authoritative, data-driven, trustworthy',
        inspiration_links: 'https://hubspot.com/blog, https://salesforce.com/resources'
      }
    }
  },
  {
    id: '00000000-0000-0000-0000-000000000104',
    title: 'Website Redesign & UX Optimization',
    description: 'Complete website redesign with focus on user experience, conversion optimization, and mobile responsiveness.',
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    project_budget: 5500,
    status: 'open',
    created_by: '00000000-0000-0000-0000-000000000005',
    client_id: '00000000-0000-0000-0000-000000000005',
    minimum_badge: 'Specialist',
    category_id: null,
    metadata: {
      requestor: {
        name: 'David Thompson',
        email: 'client4@example.com',
        company: 'Local Services Pro',
        phone: '+1 (555) 444-5555'
      },
      marketing: {
        expertiseLevel: 'Specialist',
        audience: 'Local business owners and homeowners',
        channels: ['Web Design', 'UX/UI', 'Conversion Optimization'],
        deliverables: 'Website wireframes, UI/UX design, responsive development, conversion optimization',
        problem: 'Current website has poor user experience and low conversion rates',
        target_audience: 'Local homeowners seeking professional services',
        platforms: 'WordPress, Google Analytics, Hotjar',
        preferred_tools: 'Figma, WordPress, Elementor, Google PageSpeed Insights',
        brand_voice: 'Trustworthy, professional, local, reliable',
        inspiration_links: 'https://angi.com, https://thumbtack.com'
      }
    }
  }
];

async function createAuthUser(user: typeof mockUsers[0]) {
  try {
    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserById(user.id);
    
    if (existingUser.user) {
      console.log(`✅ User ${user.email} already exists, updating...`);
      
      // Update existing user
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          user_role: user.user_role,
          username: user.username
        }
      });
      
      if (updateError) {
        console.error(`❌ Error updating user ${user.email}:`, updateError.message);
        return false;
      }
    } else {
      // Create new user
      const { error: createError } = await supabase.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name,
          user_role: user.user_role,
          username: user.username
        }
      });
      
      if (createError) {
        console.error(`❌ Error creating user ${user.email}:`, createError.message);
        return false;
      }
      
      console.log(`✅ Created user: ${user.email}`);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error with user ${user.email}:`, error);
    return false;
  }
}

async function createPublicUser(user: typeof mockUsers[0]) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        user_role: user.user_role,
        username: user.username
      }, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error(`❌ Error creating public user ${user.email}:`, error.message);
      return false;
    }
    
    console.log(`✅ Created/updated public user: ${user.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error with public user ${user.email}:`, error);
    return false;
  }
}

async function createTalentProfile(profile: typeof mockTalentProfiles[0]) {
  try {
    const { error } = await supabase
      .from('talent_profiles')
      .upsert(profile, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error(`❌ Error creating talent profile ${profile.email}:`, error.message);
      return false;
    }
    
    console.log(`✅ Created/updated talent profile: ${profile.email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error with talent profile ${profile.email}:`, error);
    return false;
  }
}

async function createProject(project: typeof mockProjects[0]) {
  try {
    const { error } = await supabase
      .from('projects')
      .upsert(project, {
        onConflict: 'id'
      });
    
    if (error) {
      console.error(`❌ Error creating project ${project.title}:`, error.message);
      return false;
    }
    
    console.log(`✅ Created/updated project: ${project.title}`);
    return true;
  } catch (error) {
    console.error(`❌ Error with project ${project.title}:`, error);
    return false;
  }
}

async function setupMockData() {
  console.log('🚀 Starting mock data setup...\n');
  
  let successCount = 0;
  let totalOperations = 0;
  
  // Create auth users
  console.log('👥 Creating authentication users...');
  for (const user of mockUsers) {
    totalOperations++;
    if (await createAuthUser(user)) {
      successCount++;
    }
  }
  
  // Create public users
  console.log('\n📋 Creating public user records...');
  for (const user of mockUsers) {
    totalOperations++;
    if (await createPublicUser(user)) {
      successCount++;
    }
  }
  
  // Create talent profiles
  console.log('\n🎯 Creating talent profiles...');
  for (const profile of mockTalentProfiles) {
    totalOperations++;
    if (await createTalentProfile(profile)) {
      successCount++;
    }
  }
  
  // Create projects
  console.log('\n📊 Creating projects...');
  for (const project of mockProjects) {
    totalOperations++;
    if (await createProject(project)) {
      successCount++;
    }
  }
  
  console.log(`\n🎉 Setup complete! ${successCount}/${totalOperations} operations successful.`);
  
  if (successCount === totalOperations) {
    console.log('\n✅ All mock data created successfully!');
    console.log('\n📝 Mock User Credentials:');
    console.log('================================');
    console.log('Admin User:');
    console.log('  Email: admin@example.com');
    console.log('  Username: admin_user');
    console.log('  Password: password123');
    console.log('\nClient Users:');
    console.log('  Email: client1@example.com, Username: sarah_johnson, Password: password123');
    console.log('  Email: client2@example.com, Username: michael_chen, Password: password123');
    console.log('  Email: client3@example.com, Username: emily_rodriguez, Password: password123');
    console.log('  Email: client4@example.com, Username: david_thompson, Password: password123');
    console.log('\nTalent Users:');
    console.log('  Email: talent1@example.com, Username: alex_rivera, Password: password123 (SEO Specialist)');
    console.log('  Email: talent2@example.com, Username: jessica_park, Password: password123 (Social Media)');
    console.log('  Email: talent3@example.com, Username: marcus_williams, Password: password123 (Content Writing)');
    console.log('  Email: talent4@example.com, Username: sophie_anderson, Password: password123 (Web Design)');
    console.log('\n🔗 You can now sign in with any of these credentials to test different user roles!');
  } else {
    console.log(`\n⚠️  Some operations failed. Check the errors above.`);
    process.exit(1);
  }
}

// Run the setup
setupMockData().catch((error) => {
  console.error('💥 Fatal error during setup:', error);
  process.exit(1);
});