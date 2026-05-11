# Admio — Complete Feature List

> Last updated: May 2026

---

## Platform Overview

Admio is an AI-powered college admissions platform for high school students. It provides personalized guidance on extracurriculars, college selection, essays, scholarships, and application strategy through Claude AI integration and gamified progress tracking.

**Tech Stack:** Next.js 14 (App Router), Supabase (Auth + Postgres), Stripe (Payments), Anthropic Claude API (AI), Vercel (Hosting)

---

## Free Tier Features

### 1. Onboarding & Profile Setup
- 9-step guided onboarding flow
- Personal info: name, grade, country, target country
- Academic info: GPA range, test scores
- Dream college and aiming strategy (Reach-focused / Balanced / Safety-focused)
- Major interest selection (9 categories + custom)
- Extracurricular interest tags (11 categories)
- Time commitment preference
- Current activities input (free-text, parsed into structured data)
- Awards & honors input (free-text, parsed with name/level/year/description)
- Biggest concern selection
- Awards +50 XP on completion

### 2. AI College Finder
- Personalized Reach / Target / Safety college lists
- Per-college data: name, location, avg GPA, avg SAT, avg ACT, acceptance rate
- Fit reason explaining why each school matches the student
- Fit score (0–100) based on academic fit + admission alignment + goal match
- Profile strength needed estimate per school
- Cached results (regenerate once per 24 hours)
- Country-aware recommendations (US, UK, international)

### 3. AI Counselor Chat (7 messages lifetime)
- Real-time streaming responses
- Full profile context injected into every conversation
- Starter prompt suggestions for new users
- Chat history persisted across sessions
- Clear history option
- 60-second client-side timeout with graceful error handling

### 4. Extracurricular Guidance
- AI analysis of profile to recommend 5–8 extracurricular categories
- Each recommendation includes: category, explanation, effort level (Low/Medium/High), impact level (Medium/High/Very High), example activity, estimated time
- Visual cards with effort/impact indicators

### 5. Profile Strength Score
- AI-scored 0–100 universal admissions profile score
- Breakdown: Academics (35%), Activities (35%), Achievements (20%), Essays (10%)
- Dream college target score estimate
- Personalized improvement suggestions
- Recalculate on demand

### 6. Progress Tracking & Gamification
- **XP System** with 6 levels:
  - Explorer (0 XP) → Builder (100) → Challenger (300) → Contender (600) → Standout (1,000) → Trailblazer (2,000)
- **XP Sources:**
  - Complete onboarding: +50 XP
  - Daily login streak: +10 XP/day
  - Mark activity complete: +25 XP
  - Add award: +15 XP
  - Submit essay for review: +30 XP
  - Send AI counselor message: +2 XP
  - Recalculate profile strength: +5 XP
- **Daily Streak** tracker with "On Fire" badge (7+ days)
- Progress bar showing XP to next level

### 7. Activity & Award Tracking
- Add/edit current activities with name, role, description, hours/week, years
- Add/edit awards with name, level (International/National/State/Regional/School), year, description
- Mark activities as completed
- Completed activities tracked separately with timestamp

### 8. Saved Items
- Bookmark colleges, scholarships, competitions, extracurriculars
- Status tracking: Interested → Started → In Progress → Completed
- Save up to 5 items (Free tier)

### 9. Scholarship & Competition Database
- Browse curated scholarship database
- Browse curated competition database
- Filter by field, difficulty, tags
- Search functionality

### 10. Daily AI Tip
- Personalized daily admissions tip
- Generated via Haiku (cost-efficient)
- Cached per user per day
- Under 400 characters, actionable

---

## Pro Tier Features ($10/month)

*Includes everything in Free, plus:*

### 11. AI Counselor Chat (400 messages/month)
- 400 messages per month (shared pool with roadmap adjustments and activity polish)
- Warning notification at 320 messages used
- Message count resets on billing cycle
- Roadmap deep-link: jump into counselor with roadmap context pre-filled

### 12. Extracurricular Roadmaps
- Detailed week-by-week action plans (4–8 weeks default, adjustable)
- 4 AI-generated project idea options per category
- Custom project idea input
- Real competition names with descriptions and deadlines
- Weekly task checklist with completion tracking
- Weekly hours estimate
- Common App tip for describing the activity
- Roadmap status: Planning → Active → Completed
- Multiple concurrent roadmaps across different categories

### 13. AI Roadmap Adjustments
- Natural language instructions to modify roadmaps (e.g., "stretch to 15 weeks", "remove competitions", "change project to X")
- Preserves completed task state during adjustments
- Adjustment history log with timestamps
- Collapsible history view
- Counts toward 400 message pool
- Max 20 tasks per roadmap enforced
- Prompt injection protection on user instructions

### 14. Essay Review & Scoring
- AI-powered essay scoring (0–100)
- Detailed feedback: strengths, weaknesses, rewrite suggestions
- Overall summary assessment
- Essay length: 100–8,000 characters
- One review per week
- Awards +30 XP per submission

### 15. AI Scholarship Matching
- 8–10 personalized scholarship recommendations
- Per-scholarship: name, amount, deadline, description, tags, URL, country, eligibility
- Tailored to student's profile, country, major, and financial situation
- Regenerate once per 24 hours
- Filter by tags: need-based, merit, STEM, arts, first-gen

### 16. AI Competition Matching
- 8–10 personalized competition recommendations
- Per-competition: name, field, difficulty, description, deadline, URL, country, tags
- Only real, verified competition names
- Regenerate once per 24 hours
- Filter by field and difficulty (Beginner/Intermediate/Advanced)

### 17. Resume Generator
- AI-generated college application resume
- Sections: summary, education (GPA/test scores/grade/major), activities, awards, skills
- Pulls from all profile data, activities, and awards
- PDF-ready formatting
- Regenerate once per 24 hours

### 18. Activity Polish (Common App / UC Writer)
- AI rewrites activity descriptions for Common App (150 char limit) and UC (350 char limit)
- Uses Haiku for cost efficiency
- Counts toward message pool

### 19. Detailed Profile
- Extended narrative fields for deeper AI personalization:
  - Personal strengths
  - Areas for improvement
  - Personal story / essay topics
  - Family background
  - Financial situation
  - Special circumstances
- Completion counter (X/6 fields filled)
- All AI features use this data when available for more specific advice

### 20. Unlimited Saved Items
- No cap on bookmarked colleges, scholarships, competitions, extracurriculars

---

## Account & Settings

### 21. Profile Management
- Edit all personal info fields
- Explicit "Save & Update" button (no auto-save)
- Once-per-week edit limit to prevent cache thrashing
- On save: clears all cached AI data (college list, recommendations, profile strength, scholarships, competitions, daily tip) and triggers fresh regeneration
- Background profile strength recalculation on save

### 22. Account Settings
- Change email address (with confirmation)
- Change password (min 6 characters)
- Sign out
- Delete account (permanent, cascades to all data)

### 23. Billing Management
- View Pro subscription status and start date
- Link to Stripe billing portal (manage payment method, cancel, view invoices)
- Upgrade prompts throughout the app for free users

### 24. Authentication
- Email/password signup with email verification
- Email/password sign in
- Password reset via email
- OAuth support (Supabase-managed)
- Protected routes with auth redirect

---

## Security & Safety

### 25. Prompt Injection Protection
- `sanitize()` function applied to all user-provided text in AI prompts
- Filters: role impersonation (`system:`, `human:`), instruction overrides ("ignore previous instructions"), prompt reveal attempts, excessive newlines, template syntax
- Dedicated instruction sanitization in roadmap adjustment endpoint
- System prompt security rules: AI declines prompt injection attempts, stays on-topic, never reveals system instructions

### 26. Rate Limiting
- Per-user, in-memory rate limits on all API endpoints:
  - Counselor: 10/min
  - Analysis endpoints: 3/hr
  - College/scholarship/competition generation: 3/hr
  - Profile strength: 10/hr
  - Essay review: 1/week (DB-backed)
  - Auth: 5/15min
  - General: 60/min

### 27. Data Protection
- Row-level security via Supabase auth
- Bearer token authentication on all API routes
- No public/unauthenticated API endpoints
- Pro feature enforcement server-side (not just UI-gated)
- Message quota enforcement server-side

---

## UI & UX

### 28. Responsive Design
- Full mobile support via hamburger side navigation
- Responsive grid layouts across all pages
- Touch-friendly controls

### 29. Dashboard
- Personalized greeting with user name
- Daily streak visualization with animated flame icon
- XP level with progress bar and hover tooltip (shows all XP sources)
- Quick stats: Profile Strength, Items Saved, Messages Used
- AI Tip of the Day card
- Quick action cards for key features
- Upgrade nudge for free users
- Pro badge display

### 30. Before You Apply Checklist (Colleges Tab)
- 7-item collapsible checklist for college preparation:
  - Language proficiency requirements
  - Standardized test requirements
  - Application deadlines
  - Required application materials
  - Country-specific requirements
  - Financial aid and scholarships
  - Visa and immigration requirements
- Country-aware (not US-specific)

### 31. Disclaimers & Transparency
- "Not a complete list" disclaimers on colleges, scholarships, competitions
- "AI-estimated" disclaimer on profile strength
- "Informational, not a substitute for a school counselor" on AI counselor
- "AI-generated" disclaimer on all AI outputs
- Shared message pool note: "Message count is shared across AI counselor and roadmap adjustments"

---

## Technical Architecture

### API Endpoints (13 total)

| Endpoint | Method | Model | Auth | Pro-Only |
|----------|--------|-------|------|----------|
| `/api/counselor` | POST | Sonnet 4 (streaming) | Yes | Partial (7 free msgs) |
| `/api/extracurriculars/analyze` | POST | Sonnet 4 | Yes | No |
| `/api/extracurriculars/roadmap` | POST | Sonnet 4 | Yes | Yes |
| `/api/extracurriculars/adjust-roadmap` | POST | Sonnet 4 | Yes | Yes |
| `/api/opportunities/colleges` | POST | Sonnet 4 | Yes | No |
| `/api/opportunities/scholarships` | POST | Sonnet 4 | Yes | Yes |
| `/api/opportunities/competitions` | POST | Sonnet 4 | Yes | Yes |
| `/api/profile-strength` | POST | Sonnet 4 | Yes | No |
| `/api/essay-review` | POST | Sonnet 4 | Yes | Yes |
| `/api/resume` | POST | Sonnet 4 | Yes | Yes |
| `/api/tip` | GET | Haiku 3.5 | Yes | No |
| `/api/activity-polish` | POST | Haiku 3.5 | Yes | Partial |
| `/api/streak` | POST | None | Yes | No |
| `/api/stripe/checkout` | POST | None | Yes | No |
| `/api/stripe/verify` | POST | None | Yes | No |
| `/api/stripe/webhook` | POST | None | No (Stripe sig) | No |

### Pages (14 total)

| Page | Path | Auth Required |
|------|------|--------------|
| Landing | `/` | No |
| Pricing | `/pricing` | No |
| Auth (Sign In/Up) | `/auth` | No |
| Email Verified | `/auth/confirmed` | No |
| Reset Password | `/auth/reset-password` | No |
| Update Password | `/auth/update-password` | No |
| Onboarding | `/onboarding` | Yes |
| Dashboard | `/dashboard` | Yes |
| Extracurriculars | `/extracurriculars` | Yes |
| Opportunities | `/opportunities` | Yes |
| Counselor | `/counselor` | Yes |
| Progress | `/progress` | Yes |
| Profile | `/profile` | Yes |
| Billing | `/billing` | Yes |
