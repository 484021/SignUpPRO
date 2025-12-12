# Future-Proof Database Schema Guide

## Philosophy

The schema follows these principles:

1. **Soft Deletes** - Never lose data, mark as deleted instead
2. **Audit Trail** - Track who did what and when
3. **Extensibility** - JSONB `metadata` fields for future features
4. **Constraints** - Database-level validation prevents bad data
5. **Indexes** - Optimized for common query patterns
6. **Views** - Encapsulate complex queries
7. **Triggers** - Auto-maintain denormalized counts
8. **Proper Types** - Use timestamptz for all datetimes

## Key Improvements

### 1. Events Table

- ✅ `end_datetime` (timestamptz) - Full end timestamp
- ✅ `deleted_at` - Soft delete support
- ✅ `total_signups` - Cached count (auto-updated by trigger)
- ✅ `metadata` (jsonb) - Custom fields without schema changes
- ✅ Better status enum: draft, open, closed, cancelled, full

### 2. Slots Table

- ✅ `deleted_at` - Soft delete
- ✅ `display_order` - Control slot ordering
- ✅ `metadata` (jsonb) - Extensible
- ✅ Constraints ensure capacity logic is valid

### 3. Signups Table

- ✅ `deleted_at` - Soft delete
- ✅ `signup_source` - Track where signups come from
- ✅ `checked_in_at` - Event check-in support
- ✅ `confirmed_at` - Email confirmation tracking
- ✅ Better status: confirmed, cancelled, waitlisted, no-show

### 4. Users Table

- ✅ `stripe_customer_id` - Billing integration ready
- ✅ `subscription_status` - Track subscription state
- ✅ `preferences` (jsonb) - User settings
- ✅ Usage counters for plan limits

### 5. New Tables

**event_analytics**

- Daily aggregation of page views, conversions, etc.
- Ready for analytics dashboard

**activity_log**

- Complete audit trail
- Track all CRUD operations
- IP address + user agent for security

**notifications**

- In-app notifications
- Email/SMS delivery tracking
- Read receipts

### 6. Smart Features

**Auto-updating Triggers:**

- Slot `available` count updates when signup created/cancelled
- Event `total_signups` updates automatically
- `updated_at` timestamp auto-updates on changes

**Views:**

- `active_events_with_slots` - Events with aggregated stats
- `event_signup_stats` - Signup counts by status

**RLS Policies:**

- Respect soft deletes (only show deleted_at IS NULL)
- Owner-only access to analytics
- Secure notifications to user only

## Migration Path

### Phase 1: Core Fixes (Do Now)

```sql
-- Run these in order:
1. scripts/027_fix_event_datetime_consistency.sql
2. scripts/028_future_proof_schema.sql
```

### Phase 2: Application Updates

Update your app code to use:

- `startDate` / `endDate` instead of mixing formats
- Check `deleted_at IS NULL` in queries
- Use new `metadata` fields for custom data
- Log to `activity_log` for important actions

### Phase 3: Analytics & Features (Later)

- Build analytics dashboard using `event_analytics`
- Add check-in flow using `checked_in_at`
- Implement notification system
- Add subscription/billing UI

## Benefits

### Developer Experience

- **Type Safety** - Consistent datetime handling
- **Debugging** - Activity log shows what happened
- **Flexibility** - Add features without migrations (use metadata)

### Data Quality

- **Constraints** - Invalid data rejected at DB level
- **Referential Integrity** - Foreign keys prevent orphans
- **No Data Loss** - Soft deletes preserve history

### Performance

- **Indexes** - Fast queries on common patterns
- **Denormalization** - Cached counts avoid expensive aggregations
- **Views** - Complex queries pre-optimized

### Scalability

- **Ready for Multi-tenant** - clerk_id indexed
- **Ready for Billing** - Stripe fields in place
- **Ready for Analytics** - Tracking tables ready
- **Ready for Audit** - Activity log captures everything

## Common Patterns

### Soft Delete

```typescript
// Instead of:
await supabase.from("events").delete().eq("id", id);

// Do:
await supabase
  .from("events")
  .update({
    deleted_at: new Date().toISOString(),
    deleted_by: userId,
  })
  .eq("id", id);

// Queries automatically filter via RLS
```

### Activity Logging

```typescript
// Log important actions:
await supabase.from("activity_log").insert({
  user_id: userId,
  clerk_id: clerkId,
  event_id: eventId,
  action: "event.created",
  entity_type: "event",
  entity_id: eventId,
  details: { title: "My Event" },
  ip_address: req.ip,
  user_agent: req.headers["user-agent"],
});
```

### Using Metadata

```typescript
// Store custom fields without schema changes:
await supabase.from("events").insert({
  title: "My Event",
  metadata: {
    customField1: "value",
    tags: ["important", "featured"],
    settings: { allowGuests: true },
  },
});
```

### Using Views

```typescript
// Get events with aggregated stats:
const { data } = await supabase
  .from("active_events_with_slots")
  .select("*")
  .eq("clerk_id", clerkId);

// data includes: slot_count, total_capacity, total_signups
```

## Schema Evolution

When you need to add a new feature:

1. **Check metadata first** - Can it fit in existing jsonb fields?
2. **Add column if needed** - Use ALTER TABLE ADD COLUMN IF NOT EXISTS
3. **Add index if queried** - Create index on new column
4. **Update app types** - Add to schemas/database.ts
5. **Update transformer** - Handle in transformers/database.ts

## Monitoring Queries

```sql
-- Check soft deletes vs hard deletes
SELECT
  COUNT(*) FILTER (WHERE deleted_at IS NULL) as active,
  COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) as deleted
FROM events;

-- Recent activity
SELECT * FROM activity_log
ORDER BY created_at DESC
LIMIT 50;

-- Events near capacity
SELECT * FROM active_events_with_slots
WHERE total_signups::float / total_capacity > 0.8;
```

## Maintenance

### Cleanup Old Soft Deletes (Optional)

```sql
-- After 90 days, permanently delete soft-deleted records
DELETE FROM events
WHERE deleted_at < NOW() - INTERVAL '90 days';
```

### Archive Old Analytics (Optional)

```sql
-- Move old analytics to archive table
INSERT INTO event_analytics_archive
SELECT * FROM event_analytics
WHERE date < NOW() - INTERVAL '1 year';

DELETE FROM event_analytics
WHERE date < NOW() - INTERVAL '1 year';
```

## Backward Compatibility

All changes are **backward compatible**:

- New columns use `ADD COLUMN IF NOT EXISTS`
- Old `end_time` field still works (transformer handles both)
- Existing queries unaffected (soft deletes handled by RLS)
- No breaking changes to API responses

## Next Steps

1. **Run migrations** in Supabase SQL editor
2. **Update types** in app (already done in schemas/database.ts)
3. **Add soft delete logic** to admin delete operations
4. **Implement activity logging** for audit trail
5. **Build analytics dashboard** using event_analytics
6. **Add notifications UI** using notifications table
