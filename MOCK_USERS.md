# Mock Users for Testing

This document contains the credentials for all mock users created by the setup script. Use these to test different user role views and functionality.

## How to Run Setup

1. **Get your Supabase Service Role Key:**
   - Go to your Supabase project dashboard
   - Navigate to **Settings** > **API**
   - Copy the `service_role` key (starts with `eyJ...`)

2. **Add to your `.env` file:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run the setup script:**
   ```bash
   npm run setup-mock-data
   ```

## Mock User Credentials

### Admin User
- **Email:** `admin@example.com`
- **Username:** `admin_user`
- **Password:** `password123`
- **Role:** Admin
- **Access:** Full admin dashboard, user management, project oversight

### Client Users

#### Client 1 - Sarah Johnson (EcoShop Inc.)
- **Email:** `client1@example.com`
- **Username:** `sarah_johnson`
- **Password:** `password123`
- **Company:** EcoShop Inc.
- **Project:** E-commerce SEO Optimization ($3,500)

#### Client 2 - Michael Chen (TechStart Labs)
- **Email:** `client2@example.com`
- **Username:** `michael_chen`
- **Password:** `password123`
- **Company:** TechStart Labs
- **Project:** Social Media Campaign Launch ($2,800)

#### Client 3 - Emily Rodriguez (DataFlow Solutions)
- **Email:** `client3@example.com`
- **Username:** `emily_rodriguez`
- **Password:** `password123`
- **Company:** DataFlow Solutions
- **Project:** B2B Content Strategy Development ($4,200)

#### Client 4 - David Thompson (Local Services Pro)
- **Email:** `client4@example.com`
- **Username:** `david_thompson`
- **Password:** `password123`
- **Company:** Local Services Pro
- **Project:** Website Redesign & UX Optimization ($5,500)

### Talent Users

#### Talent 1 - Alex Rivera (SEO Expert)
- **Email:** `talent1@example.com`
- **Username:** `alex_rivera`
- **Password:** `password123`
- **Expertise:** SEO & Content Strategy
- **Badge:** Expert Talent
- **Location:** Austin, TX
- **Specialization:** Technical SEO, content strategy, conversion optimization

#### Talent 2 - Jessica Park (Social Media Strategist)
- **Email:** `talent2@example.com`
- **Username:** `jessica_park`
- **Password:** `password123`
- **Expertise:** Social Media Marketing
- **Badge:** Pro Talent
- **Location:** San Francisco, CA
- **Specialization:** Viral content creation, influencer partnerships, community building

#### Talent 3 - Marcus Williams (Content Writer)
- **Email:** `talent3@example.com`
- **Username:** `marcus_williams`
- **Password:** `password123`
- **Expertise:** Content Writing & Strategy
- **Badge:** Pro Talent
- **Location:** New York, NY
- **Specialization:** B2B SaaS copy, email marketing, thought leadership

#### Talent 4 - Sophie Anderson (Web Designer)
- **Email:** `talent4@example.com`
- **Username:** `sophie_anderson`
- **Password:** `password123`
- **Expertise:** Web Design & Development
- **Badge:** Specialist
- **Location:** Seattle, WA
- **Specialization:** UX/UI design, e-commerce, SaaS product design

## Mock Projects

The setup script creates 4 realistic projects with different budgets, requirements, and expertise levels:

1. **E-commerce SEO Optimization** - $3,500 (Expert level)
2. **Social Media Campaign Launch** - $2,800 (Pro Talent level)
3. **B2B Content Strategy Development** - $4,200 (Pro Talent level)
4. **Website Redesign & UX Optimization** - $5,500 (Specialist level)

## Testing Scenarios

### Admin Testing
- Sign in as admin to view all users, projects, and platform metrics
- Test user qualification/disqualification
- Review project oversight and revenue tracking

### Client Testing
- Sign in as any client to see their posted projects
- Test project creation workflow
- View project workspace and talent interactions

### Talent Testing
- Sign in as any talent to browse available projects
- Test bidding on projects
- Experience different expertise levels and project matching

## Security Notes

- All mock users use the same password (`password123`) for testing convenience
- The service role key has full database access - keep it secure
- These are test accounts - don't use in production
- The setup script can be run multiple times safely (it updates existing records)

## Troubleshooting

If the setup script fails:
1. Verify your `.env` file has the correct `SUPABASE_SERVICE_ROLE_KEY`
2. Check that your Supabase project is active and accessible
3. Ensure your database has the required tables (run migrations if needed)
4. Check the console output for specific error messages

The script will show detailed success/failure information for each operation.