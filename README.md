# EventSignup - Modern Event Management Platform

A full-stack Next.js application for creating and managing events with slots, recurring schedules, waitlists, and participant signups—all without requiring participant accounts.

## Features

### For Organizers
- **Magic Link Authentication** - Secure, passwordless login
- **Event Builder** - Create events with custom slots and capacity limits
- **Recurring Events** - Set up daily, weekly, or monthly recurring schedules
- **Slot Management** - Manage multiple time slots per event
- **Waitlist System** - Automatic waitlist when events fill up
- **Analytics Dashboard** - Track signups, slot utilization, and trends
- **Plan Management** - Free and Pro tiers with usage limits
- **CSV Export** (Pro) - Export signup data
- **Event Duplication** (Pro) - Clone events for reuse

### For Participants
- **No Account Required** - Sign up with just name and email
- **Slot Selection** - Choose from available time slots
- **Magic Link Management** - Edit or cancel signups via email link
- **Automatic Waitlist** - Get notified when slots open up
- **Email Confirmations** - Receive confirmation and management links

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Date Handling:** date-fns

## Project Structure

\`\`\`
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles with Tailwind v4 config
├── auth/
│   └── login/page.tsx         # Magic link login
├── dashboard/
│   ├── page.tsx               # Organizer dashboard
│   ├── billing/page.tsx       # Billing & subscription
│   ├── settings/page.tsx      # Account settings
│   └── events/
│       ├── new/page.tsx       # Event builder
│       └── [id]/
│           ├── page.tsx       # Event detail & management
│           └── analytics/page.tsx  # Event analytics
├── signup/
│   ├── [id]/page.tsx          # Public signup page
│   └── manage/[token]/page.tsx     # Manage signup via magic link
└── api/
    ├── auth/
    │   ├── magic-link/route.ts    # Send magic link
    │   └── verify/route.ts        # Verify magic link
    ├── events/
    │   ├── route.ts               # Create event
    │   └── [id]/
    │       ├── route.ts           # Update/delete event
    │       └── duplicate/route.ts # Duplicate event (Pro)
    ├── slots/route.ts             # Create slots
    ├── signups/
    │   ├── route.ts               # Create signup
    │   └── [id]/route.ts          # Update/cancel signup
    ├── waitlist/route.ts          # Add to waitlist
    └── billing/
        ├── checkout/route.ts      # Create checkout session
        ├── webhook/route.ts       # Handle payment webhooks
        └── portal/route.ts        # Billing portal link

components/
├── header.tsx                 # App header with navigation
├── event-card.tsx            # Event card component
├── slot-card.tsx             # Slot display card
├── signup-form.tsx           # Participant signup form
├── signup-list.tsx           # List of signups
├── waitlist-view.tsx         # Waitlist display
├── waitlist-item.tsx         # Waitlist entry item
├── recurrence-selector.tsx   # Recurring event UI
├── slot-creator.tsx          # Slot creation UI
├── analytics-chart.tsx       # Analytics bar chart
├── pricing-table.tsx         # Plan comparison table
├── onboarding-modal.tsx      # First-time user guide
├── upgrade-banner.tsx        # Plan limit warning
└── dashboard-stats-card.tsx  # Dashboard metric card

lib/
├── types.ts                  # TypeScript type definitions
├── mock-data.ts             # Mock data for testing
├── plan-limits.ts           # Free/Pro plan limit logic
├── utils.ts                 # Utility functions
└── metadata.ts              # SEO metadata
\`\`\`

## App Flow Map

### Landing Page Flow
\`\`\`
Landing Page (/)
├── Sign In → Auth Login (/auth/login)
│   ├── Send Magic Link
│   └── Demo Mode: Auto-login → Dashboard
└── Pricing → View plans → Auth Login
\`\`\`

### Organizer Flow
\`\`\`
Dashboard (/dashboard)
├── View Events
│   ├── Create Event → Event Builder (/dashboard/events/new)
│   │   ├── Basic Info (title, date, description)
│   │   ├── Recurring Options (optional, Pro limit check)
│   │   └── Slot Creation (capacity, names)
│   └── Manage Event (/dashboard/events/[id])
│       ├── View Signups (tab)
│       ├── View Waitlist (tab)
│       ├── View Slots (tab)
│       ├── View Analytics (/dashboard/events/[id]/analytics)
│       ├── Duplicate Event (Pro only)
│       ├── Export CSV (Pro only)
│       └── Close Event
├── Billing (/dashboard/billing)
│   ├── View Current Plan
│   ├── Upgrade to Pro
│   └── Manage Billing (Pro users)
└── Settings (/dashboard/settings)
    ├── Update Email
    ├── Reset Onboarding
    └── Delete Account (demo disabled)
\`\`\`

### Participant Flow
\`\`\`
Public Signup Page (/signup/[id])
├── View Event Details
├── Select Slot
│   ├── Slot Full → Join Waitlist
│   └── Slot Available → Fill Form
├── Submit Signup
│   ├── Success → Confirmation Screen
│   └── Receive Magic Link Email
└── Manage Signup (/signup/manage/[token])
    ├── Edit Name/Email
    └── Cancel Registration
\`\`\`

## Data Models

### User
\`\`\`typescript
{
  id: string
  email: string
  plan: "free" | "pro"
  signupsThisMonth: number
  activeEventsCount: number
  recurringSeriesCount: number
  createdAt: Date
}
\`\`\`

### Event
\`\`\`typescript
{
  id: string
  organizerId: string
  title: string
  description: string
  date: Date
  recurrenceRule?: RecurrenceRule
  status: "draft" | "open" | "closed" | "full"
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Slot
\`\`\`typescript
{
  id: string
  eventId: string
  name: string
  capacity: number
  available: number
  order: number
}
\`\`\`

### Signup
\`\`\`typescript
{
  id: string
  eventId: string
  slotId: string
  name: string
  email: string
  status: "confirmed" | "waitlist" | "cancelled"
  magicLinkToken?: string
  createdAt: Date
}
\`\`\`

### WaitlistEntry
\`\`\`typescript
{
  id: string
  eventId: string
  slotId: string
  name: string
  email: string
  position: number
  createdAt: Date
}
\`\`\`

## Plan Limits

### Free Plan
- Up to 5 active events
- 1 recurring event series
- 50 signups per month
- Basic analytics
- Email notifications

### Pro Plan ($29/month)
- Unlimited events
- Unlimited recurring series
- Unlimited signups
- Advanced analytics
- CSV export
- Event duplication
- Priority support
- Custom branding
- No ads

## API Routes

All API routes return JSON and include mock implementations for testing.

### Authentication
- `POST /api/auth/magic-link` - Send magic link email
- `GET /api/auth/verify?token=...` - Verify magic link token

### Events
- `POST /api/events` - Create new event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/duplicate` - Duplicate event (Pro)

### Slots
- `POST /api/slots` - Create slot

### Signups
- `POST /api/signups` - Create signup
- `PATCH /api/signups/:id` - Update signup

### Waitlist
- `POST /api/waitlist` - Add to waitlist

### Billing
- `POST /api/billing/checkout` - Create Stripe checkout
- `POST /api/billing/webhook` - Handle Stripe webhooks
- `GET /api/billing/portal` - Get billing portal URL

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Demo Mode Features

The app includes demo shortcuts for testing:

- **Auto-login:** Skip email verification on login page
- **Mock data:** Pre-populated events, signups, and analytics
- **All features enabled:** Test Pro features without payment
- **LocalStorage auth:** Simple token-based authentication

## Integration Guide

### Adding Real Backend

Replace mock data and API routes with real implementations:

1. **Database Setup:**
   \`\`\`typescript
   // Choose a database (Supabase, Neon, PostgreSQL, etc.)
   // Run migrations to create tables for:
   // - users
   // - events
   // - slots
   // - signups
   // - waitlist_entries
   \`\`\`

2. **Authentication:**
   \`\`\`typescript
   // lib/auth.ts
   // Implement real magic link generation
   // Use JWT tokens or session cookies
   // Store tokens in database with expiration
   \`\`\`

3. **Email Service:**
   \`\`\`typescript
   // lib/email.ts
   // Integrate email provider (Resend, SendGrid, etc.)
   // Send magic links
   // Send signup confirmations
   // Send waitlist notifications
   \`\`\`

4. **Payment Integration:**
   \`\`\`typescript
   // lib/stripe.ts
   // Set up Stripe API keys
   // Create checkout sessions
   // Handle webhooks for subscription updates
   // Manage subscription status
   \`\`\`

5. **Update API Routes:**
   - Replace all mock responses with database queries
   - Add proper error handling
   - Implement authentication middleware
   - Add input validation and sanitization

### Environment Variables Needed

\`\`\`env
# Database
DATABASE_URL=

# Authentication
JWT_SECRET=
MAGIC_LINK_SECRET=

# Email
EMAIL_FROM=
EMAIL_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
\`\`\`

## Component Library

All UI components are from shadcn/ui and customizable:
- Button, Input, Label, Textarea
- Card, Badge, Progress
- Dialog, Dropdown Menu, Tabs
- Select, Switch, Checkbox
- Toast notifications

## Mobile Responsiveness

The entire app is mobile-first with responsive breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

All layouts use flexbox and CSS Grid for adaptive designs.

## Testing Checklist

- [ ] Create event with slots
- [ ] Create recurring event
- [ ] Sign up for event slot
- [ ] Join waitlist when full
- [ ] Edit signup via magic link
- [ ] Cancel signup
- [ ] View event analytics
- [ ] Test free plan limits
- [ ] Test Pro feature locks
- [ ] Upgrade flow
- [ ] Export CSV (Pro)
- [ ] Duplicate event (Pro)
- [ ] Mobile navigation
- [ ] Form validations

## Future Enhancements

- Real-time updates (WebSockets)
- Email reminders before events
- SMS notifications
- Calendar integration (iCal, Google Calendar)
- QR code check-ins
- Multiple organizers per event
- Custom event templates
- White-label branding (Pro)
- API access for integrations
- Advanced reporting
- Automated waitlist management

## License

MIT License - Built with v0 by Vercel

---

**Need help?** Check the inline code comments or refer to the PRD in the project root.
