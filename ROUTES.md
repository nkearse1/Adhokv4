# 🗺️ Adhok V.1 Route Overview (Updated at Adhok 1.2c)

## 👤 Talent Signup & Qualification
| Route                | Purpose                                                |
|----------------------|--------------------------------------------------------|
| `/signup`            | Public signup form for talents (`TalentSignUpForm.tsx`) |
| `/talent/dashboard`  | Status-based dashboard (pending/approved/rejected)    |
| `/api/talent/signup` | Handles resume upload and DB insert via Supabase      |

## 🧳 Projects & Bidding
| Route                | Purpose                                              |
|----------------------|------------------------------------------------------|
| `/talent/projects`   | Talent sees open projects + inline bid submission     |
| `/client/dashboard`  | Project creators post new jobs (`UploadFlow.tsx`)     |
| `/api/project/post`  | Planned: endpoint for project creation                |
| `/api/bid/submit`    | Planned: endpoint to store bids                       |

## 🔐 Admin & Review
| Route                | Purpose                                              |
|----------------------|------------------------------------------------------|
| `/admin/talents`     | Admin view to approve/reject talents                 |
| `/admin/projects`    | Admin view of posted projects                        |
| `/admin/casestudies` | Admin follow-up success feedback                     |
| `/api/talent/trust/:talentId` | Get trust score for a talent (admin only)   |
| `/api/talent/trust/:talentId/update` | Update trust score for a talent (admin only) |
| `/api/talent/trust/recalculate-all` | Recalculate trust scores for all talents (admin only) |

## 🔄 Supabase Edge Functions
| Function                | Purpose                                              |
|-------------------------|------------------------------------------------------|
| `recalculate-trust-scores` | Scheduled function to update all talent trust scores |

## ✅ Milestone: Adhok 1.2c
- `/talent/projects` implemented with inline bidding (mock data)
- Status dashboard and signup system working
- Trust score system for admin talent management

## 🧭 Navigation Suggestions
Top-level nav should include:
- Sign Up
- Browse Projects
- Post Project
- Talent Dashboard

(Conditionally shown based on user role)

## 📊 Trust Score System Usage

### Admin API Endpoints

```javascript
// Get trust score for a talent
const getTrustScore = async (talentId) => {
  const { data } = await fetch(`/api/talent/trust/${talentId}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  }).then(res => res.json());
  
  return data;
};

// Update trust score for a talent
const updateTrustScore = async (talentId) => {
  const { data } = await fetch(`/api/talent/trust/${talentId}/update`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
  
  return data;
};

// Recalculate trust scores for all talents
const recalculateAllTrustScores = async () => {
  const { data } = await fetch(`/api/talent/trust/recalculate-all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }).then(res => res.json());
  
  return data;
};
```

### Scheduled Recalculation

The `recalculate-trust-scores` Supabase Edge Function can be scheduled to run daily or weekly to keep trust scores up to date.

### Trust Score Factors

The trust score is calculated based on the following factors:

1. **Positive Factors:**
   - Completed Projects (+5 points each)
   - Positive Ratings (4-5 stars, +3 points each)
   - Repeat Clients (+10 points each)
   - Fast Response Time (<2h: +10 points, <6h: +5 points)

2. **Negative Factors:**
   - Admin Complaints (-15 points each)
   - Missed Deadlines (-8 points each)
   - Slow Response Time (>24h: -10 points)

3. **Score Interpretation:**
   - 80-100: Excellent - Highly trusted talent
   - 60-79: Good - Reliable talent
   - 40-59: Fair - Some concerns
   - 0-39: Poor - Significant concerns, added to PIP list

4. **Automatic Actions:**
   - Talents with scores below 40 are removed from auction marketing
   - Talents with scores below 40 are added to Performance Improvement Plan (PIP) list
   - Persistent low scores may result in platform removal