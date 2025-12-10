# EventSignup - Architecture Documentation

## Overview

EventSignup is a full-stack Next.js 16 application using the App Router pattern. The architecture follows modern React patterns with server and client components, API routes for backend logic, and a clean separation of concerns.

## Architecture Patterns

### 1. Server-Side Rendering (SSR) & Client Components

The app strategically uses both server and client components:

**Server Components (default):**
- Landing page
- Static content pages
- SEO-optimized pages

**Client Components ("use client"):**
- Forms with state management
- Interactive dashboards
- Real-time UI updates
- Components using hooks (useState, useEffect)

### 2. Mock Data Layer

Location: `lib/mock-data.ts`

Provides realistic test data for:
- Users with plan information
- Events (one-time and recurring)
- Slots with availability
- Signups and waitlist entries
- Analytics data

**Purpose:** Allows full app navigation and testing without a backend.

### 3. Type System

Location: `lib/types.ts`

Comprehensive TypeScript types for:
- Core entities (User, Event, Slot, Signup, Waitlist)
- Status enums
- Recurrence rules
- Analytics structures

**Benefits:**
- Type safety across the app
- Better IDE autocomplete
- Catches errors at compile time

### 4. Plan Limit Enforcement

Location: `lib/plan-limits.ts`

Centralized logic for free vs. pro plan restrictions:
- Event creation limits
- Recurring series limits
- Signup capacity limits
- Feature access checks

**Pattern:** Helper functions return `{ allowed: boolean, reason?: string }`

### 5. Component Architecture

**Atomic Design Principles:**
- **Atoms:** Button, Input, Badge (shadcn/ui)
- **Molecules:** SlotCard, WaitlistItem
- **Organisms:** SignupForm, RecurrenceSelector
- **Templates:** Event layouts, Dashboard layouts
- **Pages:** Full page components in app/ directory

**Reusable Components:**
- Components live in `/components`
- UI primitives from shadcn/ui in `/components/ui`
- Business logic separated from presentation

### 6. API Route Structure

All API routes follow REST conventions:

\`\`\`
/api/[resource]/route.ts        → GET (list), POST (create)
/api/[resource]/[id]/route.ts   → GET, PATCH, DELETE
/api/[resource]/[id]/[action]/route.ts  → POST for actions
\`\`\`

**Current Implementation:** Mock responses for testing
**Production:** Replace with database queries

### 7. Authentication Flow

**Magic Link Pattern:**
\`\`\`
1. User enters email
2. Server generates secure token
3. Email sent with link containing token
4. User clicks link
5. Token verified, session created
6. User redirected to dashboard
\`\`\`

**Demo Shortcut:** LocalStorage token for testing

### 8. Form Handling

**Pattern:**
\`\`\`typescript
const [isSubmitting, setIsSubmitting] = useState(false)

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  setIsSubmitting(true)
  
  try {
    const response = await fetch('/api/...', { ... })
    // Handle success
  } catch (error) {
    // Handle error
  } finally {
    setIsSubmitting(false)
  }
}
\`\`\`

**Features:**
- Loading states on buttons
- Error toasts for failures
- Success confirmations
- Form validation (required fields, email format)

### 9. State Management

**Local State:** useState for component-specific state
**Props:** Pass data down component tree
**Mock Global State:** LocalStorage for auth token

**Future:** Consider Zustand or Jotai for complex state

### 10. Routing Strategy

**Public Routes:**
- `/` - Landing page
- `/signup/[id]` - Event signup pages

**Protected Routes (require auth):**
- `/dashboard/*` - All organizer pages

**Magic Link Routes:**
- `/signup/manage/[token]` - Participant management

**Auth Check:** useEffect in protected pages checks localStorage

## Data Flow

### Event Creation Flow
\`\`\`
User Input → Form State → API Route → Mock Response → Redirect
\`\`\`

### Signup Flow
\`\`\`
Public Page → Slot Selection → Form → API → Success Screen → Email
\`\`\`

### Analytics Flow
\`\`\`
Dashboard → Event ID → Mock Analytics Data → Charts → Display
\`\`\`

## Security Considerations

### Current (Demo Mode)
- LocalStorage tokens
- No real authentication
- Mock data only

### Production Requirements
- HTTP-only cookies for sessions
- CSRF protection
- Rate limiting on API routes
- Input sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (React escapes by default)
- Magic link token expiration (15 minutes)
- Password hashing (if adding password auth)

## Performance Optimizations

### Implemented
- Server components for static content
- Client components only where needed
- Code splitting (automatic with Next.js)
- Image optimization (Next.js Image component)
- CSS-in-JS avoided (Tailwind for performance)

### Future Optimizations
- React Query for data fetching
- Debouncing form inputs
- Virtual scrolling for long lists
- Lazy loading components
- CDN for static assets
- Database indexing
- Redis caching for frequent queries

## Scalability Considerations

### Database Design
\`\`\`sql
-- Indexes needed for production
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_slots_event ON slots(event_id);
CREATE INDEX idx_signups_event ON signups(event_id);
CREATE INDEX idx_signups_slot ON signups(slot_id);
CREATE INDEX idx_waitlist_event ON waitlist(event_id);
\`\`\`

### Caching Strategy
- Cache event details (10 minutes)
- Cache slot availability (real-time or 30 seconds)
- Cache analytics (5 minutes)
- Invalidate on updates

### Background Jobs
Consider job queue for:
- Sending email notifications
- Processing recurring events
- Cleaning expired tokens
- Generating analytics
- Promoting waitlist to confirmed

## Error Handling

### Client-Side
- Try-catch blocks in async functions
- Error boundaries for component errors
- Toast notifications for user feedback
- Form validation before submission

### Server-Side
- Structured error responses
- HTTP status codes
- Error logging (add Sentry or similar)
- Graceful degradation

## Testing Strategy

### Unit Tests
- Pure functions in lib/
- Component rendering
- Form validations
- Plan limit logic

### Integration Tests
- API route responses
- Form submissions
- Authentication flow
- Database queries

### E2E Tests
- Full user journeys
- Critical paths (signup, create event)
- Payment flow
- Email delivery

## Deployment

### Vercel (Recommended)
\`\`\`bash
vercel deploy
\`\`\`

**Benefits:**
- Automatic HTTPS
- Edge functions
- Built-in analytics
- Preview deployments

### Environment Variables
Set in Vercel dashboard or `.env.local`:
\`\`\`
DATABASE_URL
JWT_SECRET
STRIPE_SECRET_KEY
EMAIL_API_KEY
\`\`\`

## Monitoring

### Recommended Tools
- **Analytics:** Vercel Analytics (already integrated)
- **Error Tracking:** Sentry
- **Performance:** Vercel Speed Insights
- **Uptime:** Uptime Robot
- **Logs:** Vercel Logs or Datadog

## Development Workflow

1. **Local Development:**
   \`\`\`bash
   npm run dev
   \`\`\`

2. **Type Checking:**
   \`\`\`bash
   npm run build
   \`\`\`

3. **Linting:**
   \`\`\`bash
   npm run lint
   \`\`\`

4. **Format Code:**
   \`\`\`bash
   npm run format
   \`\`\`

## Migration Path

### Phase 1: Database Setup
- Choose provider (Supabase, Neon, PostgreSQL)
- Create schema
- Run migrations
- Set up connection pooling

### Phase 2: Authentication
- Implement JWT or sessions
- Set up email service
- Replace LocalStorage with secure cookies
- Add middleware for auth checks

### Phase 3: Payment Integration
- Stripe setup
- Webhook handlers
- Subscription management
- Billing portal

### Phase 4: Email Service
- Choose provider
- Template system
- Notification queue
- Delivery tracking

### Phase 5: Production Hardening
- Rate limiting
- Input validation
- Security headers
- Error logging
- Performance monitoring

---

**Last Updated:** December 2024
