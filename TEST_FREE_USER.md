# Testing Free User Experience

## Prerequisites
1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`

## Test Scenario 1: First Event (Should Succeed)

**Steps:**
1. Go to dashboard: `http://localhost:3000/dashboard`
2. Click "Create New Event" button
3. Fill in event details:
   - Title: "Test Event 1"
   - Description: "First event for free user"
   - Date: Pick any future date
   - Create at least one slot (e.g., "General Admission", capacity 10)
4. Click "Create Event"

**Expected Result:**
✅ Event created successfully
✅ Redirected to `/dashboard/events/[id]`
✅ Event appears in your events list

---

## Test Scenario 2: Second Event (Should Trigger Upgrade)

**Steps:**
1. Return to dashboard: `http://localhost:3000/dashboard`
2. Click "Create New Event" button again
3. Fill in event details:
   - Title: "Test Event 2"
   - Description: "Second event - should require upgrade"
   - Date: Pick any future date
   - Create at least one slot
4. Click "Create Event"

**Expected Result:**
✅ Toast notification appears: "Free plan limited to 1 active event. Upgrade to create more."
✅ Automatically redirected to `/upgrade`
✅ Upgrade page shows $19/month pricing

---

## Test Scenario 3: API Bypass Protection (Security Test)

**Test that free users cannot bypass UI limits via direct API calls:**

1. Open DevTools (F12), go to Console tab
2. After creating your first event, try to bypass via API:
   ```javascript
   // Attempt 1: Direct POST to /api/events
   fetch('/api/events', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       title: 'Bypass Event',
       description: 'Trying to bypass UI',
       date: '2025-12-20',
       slots: [{ name: 'General', capacity: 10 }]
     })
   }).then(r => r.json()).then(console.log)
   
   // Attempt 2: Duplicate existing event
   fetch('/api/events/YOUR_EVENT_ID/duplicate', {
     method: 'POST'
   }).then(r => r.json()).then(console.log)
   ```

**Expected Result:**
✅ Returns 403 Forbidden status
✅ Response: `{"error": "UPGRADE_REQUIRED", "message": "Free plan limited to 1 active event..."}`
✅ Event NOT created in database
✅ Security guard blocks bypass attempt

---

## Test Scenario 4: Verify Free Plan Status

**Check in Browser DevTools:**
1. Open DevTools (F12)
2. Go to Console tab
3. Observe server logs showing:
   ```
   Free plan limit reached: 1 active events found
   ```

**Check in Database (Supabase):**
1. Go to Supabase dashboard
2. Open SQL Editor
3. Run this query to see your user status:
   ```sql
   SELECT id, email, plan, stripe_customer_id, stripe_subscription_id
   FROM users
   WHERE clerk_id = 'YOUR_CLERK_ID';
   ```

**Expected:**
- `plan` = 'free'
- `stripe_customer_id` = NULL
- `stripe_subscription_id` = NULL

---

## Test Scenario 5: Bypass for Testing Paid Features

If you want to temporarily test pro features without going through Stripe:

**Option A: Manual Database Update**
```sql
UPDATE users 
SET plan = 'monthly'
WHERE clerk_id = 'YOUR_CLERK_ID';
```

**Option B: Delete First Event to Free Up Slot**
```sql
DELETE FROM events 
WHERE clerk_id = 'YOUR_CLERK_ID' 
AND title = 'Test Event 1';
```

Then create a new event (should work because you're back to 0 active events)

---

## Test Scenario 6: Upgrade Flow (Requires Stripe Setup)

⚠️ **Important:** Before testing payment, you must:
1. Run the database migration: `scripts/029_add_stripe_monthly_billing.sql`
2. Configure Stripe environment variables in `.env.local`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_MONTHLY=price_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

**Steps:**
1. Hit the event limit (Scenario 2)
2. On `/upgrade` page, review pricing
3. Click "Upgrade to Monthly Plan" button
4. Complete Stripe Checkout (use test card: 4242 4242 4242 4242)
5. After payment, redirected to `/billing/success`

**Expected Result:**
✅ Payment processed successfully
✅ User plan updated to 'monthly'
✅ Stripe customer and subscription IDs saved
✅ Can now create unlimited events

---

## Quick Reset Script

To reset your test environment:

```sql
-- Reset user to free plan
UPDATE users 
SET plan = 'free', 
    stripe_customer_id = NULL, 
    stripe_subscription_id = NULL
WHERE clerk_id = 'YOUR_CLERK_ID';

-- Delete all test events
DELETE FROM events 
WHERE clerk_id = 'YOUR_CLERK_ID';
```

---

## Verification Checklist

- [ ] First event creation works
- [ ] Second event triggers upgrade prompt
- [ ] Toast message displays correctly
- [ ] Redirect to /upgrade works
- [ ] Upgrade page displays pricing
- [ ] Console logs show "Free plan limit reached"
- [ ] Database shows plan='free' and active event count
- [ ] After upgrade (if tested), plan changes to 'monthly'
- [ ] After upgrade, can create multiple events

---

## Troubleshooting

**Issue:** First event also triggers upgrade  
**Solution:** Check database - you might already have an active event. Run:
```sql
SELECT id, title, status, clerk_id FROM events WHERE clerk_id = 'YOUR_CLERK_ID';
```

**Issue:** No redirect to upgrade page  
**Solution:** Check browser console for errors. Ensure `components/new-event-client.tsx` has the upgrade redirect logic.

**Issue:** Upgrade button does nothing  
**Solution:** You need to run the database migration and configure Stripe environment variables first.

**Issue:** Payment succeeds but plan not updated  
**Solution:** This means the migration hasn't been run. Execute `029_add_stripe_monthly_billing.sql` in Supabase.
