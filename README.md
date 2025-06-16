# Adhok Project Auction Platform

A platform for connecting marketing professionals with high-value projects through an auction-style marketplace.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Connect to Supabase using the "Connect to Supabase" button in the top right
   - Add your `SUPABASE_SERVICE_ROLE_KEY` from the Supabase dashboard

4. Set up mock data (optional):

```bash
npm run setup-mock-data
# or
yarn setup-mock-data
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Mock User Credentials

All mock users have the password: `password123`

### Admin User
- **Email:** `admin@example.com`
- **Username:** `admin_user`

### Client Users
- **Email:** `client1@example.com`
- **Username:** `sarah_johnson`

- **Email:** `client2@example.com`
- **Username:** `michael_chen`

- **Email:** `client3@example.com`
- **Username:** `emily_rodriguez`

- **Email:** `client4@example.com`
- **Username:** `david_thompson`

### Talent Users
- **Email:** `talent1@example.com`
- **Username:** `alex_rivera`
- **Expertise:** SEO & Content Strategy
- **Badge:** Expert Talent

- **Email:** `talent2@example.com`
- **Username:** `jessica_park`
- **Expertise:** Social Media Marketing
- **Badge:** Pro Talent

- **Email:** `talent3@example.com`
- **Username:** `marcus_williams`
- **Expertise:** Content Writing & Strategy
- **Badge:** Pro Talent

- **Email:** `talent4@example.com`
- **Username:** `sophie_anderson`
- **Expertise:** Web Design & Development
- **Badge:** Specialist

## Project Structure

- `/src` - Frontend React application
- `/supabase` - Supabase migrations and functions
- `/scripts` - Setup and utility scripts

## Features

- User authentication with email/username and password
- Role-based access control (Admin, Client, Talent)
- Project auction marketplace
- Talent qualification system
- Project workspace with deliverables tracking
- Payment and escrow management
- Portfolio showcase for talents

## License

This project is licensed under the MIT License - see the LICENSE file for details.