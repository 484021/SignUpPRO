# SignUpPRO — Stripe Monthly Subscription Setup

## Installation

### 1. Install Stripe SDK

```bash
pnpm install stripe
# or
npm install stripe
```

### 2. Configure Environment Variables

Add these to your `.env.local`:

```env
# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_test_xxxxx  # Get from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_PRICE_MONTHLY=price_xxxxx  # Create in Stripe Dashboard

# App URL (Required for Stripe redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to production URL when deploying
```

### 3. Create Stripe Product & Price

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/products)
2. Click "Add Product"
3. Name: "Monthly Plan" (or your choice)
4. Pricing:
   - Model: **Recurring**
   - Price: **$19.00**
   - Billing period: **Monthly**
5. Click "Save product"
6. Copy the **Price ID** (starts with `price_`) → use as `STRIPE_PRICE_MONTHLY`

### 4. Run Database Migration

```bash
# Connect to your Supabase database and run:
psql $DATABASE_URL -f scripts/029_add_stripe_monthly_billing.sql
```

Or via Supabase Dashboard:

- Go to SQL Editor
- Paste contents of `scripts/029_add_stripe_monthly_billing.sql`
- Run the query

### 5. Test the Flow

1. Start dev server: `pnpm dev`
2. Create an account
3. Create your first event (FREE - works)
4. Try to create a 2nd event → redirects to `/upgrade`
5. Click "Upgrade" → Stripe Checkout
6. Use Stripe test card: `4242 4242 4242 4242`
7. After payment → redirects to `/billing/success`
8. Plan is now `monthly` → unlimited events ✅

---

## Implementation Summary

### Files Changed/Created

**Modified:**

- `lib/types.ts` - Added `monthly` plan type, Stripe fields
- `lib/actions/events.ts` - Added 1-event limit guard for free users
- `components/new-event-client.tsx` - Added upgrade redirect on limit
- `package.json` - (Add `stripe` dependency)

**Created:**

- `scripts/029_add_stripe_monthly_billing.sql` - Database migration
- `app/upgrade/page.tsx` - Upgrade page UI
- `app/api/billing/create-checkout/route.ts` - Stripe Checkout API
- `app/api/billing/process-success/route.ts` - Payment verification API
- `app/billing/success/page.tsx` - Post-payment success page
- `.env.example` - Updated with Stripe variables
- `STRIPE_SETUP.md` - This file

---

## Business Logic

### Free Plan

- Default for all new organizers
- Can create **1 active event**
- Attempting 2nd event redirects to `/upgrade`

### Monthly Plan ($19/month)

- **Unlimited active events**
- Stripe subscription auto-renews monthly
- Stored in DB: `plan = 'monthly'`, `stripe_subscription_id`

---

## API Routes

### POST `/api/billing/create-checkout`

- Creates Stripe Checkout Session
- Requires: Authenticated user
- Returns: `{ url: string }` → redirect to Stripe

### POST `/api/billing/process-success`

- Verifies payment after Stripe redirect
- Updates user: `plan = 'monthly'`
- Saves `stripe_customer_id` and `stripe_subscription_id`

---

## Security Notes

- ✅ Event limit enforced **server-side** (cannot be bypassed)
- ✅ Stripe customer ID stored for idempotency
- ✅ Subscription ID tracked for future webhook integration
- ⚠️ **Webhooks not implemented** (out of scope for MVP)
  - Users must complete payment flow to activate
  - Cancellations/failures require webhook handling (future)

---

## Future Enhancements (Not Implemented)

- ❌ Stripe webhooks (subscription.updated, payment.failed)
- ❌ Cancellation/downgrade flow
- ❌ Annual plans or discounts
- ❌ Free trial period
- ❌ Billing portal integration

---

## Troubleshooting

**"Unauthorized" error on checkout:**

- Ensure user is logged in via Clerk
- Check Clerk environment variables

**Payment succeeds but plan doesn't update:**

- Check browser console for API errors
- Verify `STRIPE_SECRET_KEY` is correct
- Check Supabase logs for DB update errors

**Stripe checkout fails:**

- Verify `STRIPE_PRICE_MONTHLY` matches your price ID
- Ensure price is set to "Recurring" not "One-time"
- Check Stripe API version compatibility

---

## Production Checklist

Before going live:

- [ ] Switch to **live** Stripe keys (not test)
- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Run migration on production database
- [ ] Test full payment flow in production mode
- [ ] Set up Stripe webhooks (recommended but optional)
- [ ] Configure Stripe billing portal for customer self-service

---

**Ready to monetize! 🚀**
