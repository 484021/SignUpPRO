# Data Layer Architecture Guide

## Overview

This app now has a **3-layer type system** with **consistent datetime handling** to prevent bugs like missing/inconsistent data:

### Datetime Storage Strategy

**Database Layer:**

- `date` (timestamptz) - Event start datetime
- `end_time` (text HH:mm) - DEPRECATED, kept for backward compatibility
- `end_datetime` (timestamptz) - Event end datetime (preferred)
- `timezone` (text) - Event timezone (e.g., "America/New_York")

**App Layer:**

- `startDate` (Date) - Event start datetime
- `endDate` (Date | null) - Event end datetime
- `timezone` (string) - Event timezone

**Migration:** Run `scripts/027_fix_event_datetime_consistency.sql` to add proper columns.

## Type System

1. **Database Layer** (`lib/schemas/database.ts`) - Raw Supabase data (snake_case)
2. **Transformation Layer** (`lib/transformers/database.ts`) - Convert & validate
3. **App Layer** - Normalized data (camelCase) with automatic transformations

## Files & What They Do

### `lib/schemas/database.ts`

Zod schemas for:

- **`UserRowSchema`** / `EventRowSchema` / `SlotRowSchema` / `SignupRowSchema` - Raw DB format
- **`AppUserSchema`** / `AppEventSchema` / `AppSlotSchema`/ `AppSignupSchema` - App format
- **`CreateEventRequestSchema`** / `CreateSignupRequestSchema` - Form validation

### `lib/transformers/database.ts`

Transformation functions:

```typescript
// Transform raw DB data → App type (with validation)
transformEventRow(data) → AppEvent
transformSlotRows(data) → AppSlot[]

// Convert app type → DB format (for inserts/updates)
eventToDbFormat(appEvent) → { date, end_time, timezone, ... }
```

### `lib/actions/events-safe.ts`

Safe server actions that handle transformation:

```typescript
// Always returns typed data (or throws)
const event = await fetchEventBySlug("my-event");
event.endTime // Guaranteed to be HH:mm string or null
event.date    // Guaranteed to be Date object, never string

const result = await createEventSafe({...});
if (result.success) {
  // result.event is AppEvent with all fields typed
}
```

### `lib/utils/time-formatting.ts`

Consistent time handling:

```typescript
formatEventTime(date, "14:00"); // → "2:00 PM — 14:00"
convertTo24h("2", "PM"); // → 14
getDaysInMonth("2025", "2"); // → 28 or 29
```

## Usage Examples

### ✅ GOOD - Using safe actions

```typescript
// Server action with automatic transformation & validation
const event = await fetchEventBySlug("my-event");

// event.date is a Date object
const formatted = format(event.date, "PPP");

// event.endTime is guaranteed HH:mm string or null
const display = event.endTime ? `Ends at ${event.endTime}` : "No end time";
```

### ✅ GOOD - Creating data with validation

```typescript
const result = await createEventSafe({
  title: "My Event",
  date: "2025-12-16T06:00:00Z",
  endTime: "14:00", // Validated as HH:mm
  slots: [{ name: "VIP", capacity: 10 }],
});

if (result.success) {
  // result.event is fully typed AppEvent
  const id = result.event.id;
}
```

### ❌ BAD - Direct Supabase queries without transformation

```typescript
const { data } = await supabase.from("events").select().single();
// data.date is a string, not Date
// data.end_time might be undefined or "14:00"
// No validation - could be wrong shape
```

### ❌ BAD - Mixing snake_case and camelCase

```typescript
// Don't do this
if (event.end_time) { ... }    // Wrong - should be endTime
if (event.show_signups) { ... } // Wrong - should be showSignups
```

## Migration Guide

### If you need to fetch existing code:

**Before (direct DB queries):**

```typescript
const { data } = await supabase.from("events").select().single();
const eventTime = format(new Date(data.date), "h:mm a") + " — " + data.end_time;
```

**After (using safe layer):**

```typescript
import { fetchEventById } from "@/lib/actions/events-safe";
import { formatEventTime } from "@/lib/utils/time-formatting";

const event = await fetchEventById(id);
const eventTime = formatEventTime(event.date, event.endTime);
```

## Adding New Fields

When adding a new column to Supabase:

1. **Add to schema** in `lib/schemas/database.ts`:

   ```typescript
   export const EventRowSchema = z.object({
     // ... existing fields
     newField: z.string().optional(),
   });
   ```

2. **Update AppEvent type**:

   ```typescript
   export const AppEventSchema = z.object({
     // ... existing fields
     newField: z.string().optional(),
   });
   ```

3. **Add transformer logic** in `lib/transformers/database.ts`:
   ```typescript
   export function transformEventRow(row: unknown): AppEvent {
     const validated = EventRowSchema.parse(row);
     return AppEventSchema.parse({
       // ...
       newField: validated.new_field,
     });
   }
   ```

That's it! All code using `fetchEventBySlug()` etc. will automatically get the new field typed correctly.

## Type Checking

Run `npm run lint` or `tsc --noEmit` to catch type errors before runtime.

The validation also happens at runtime via Zod, so even if types are wrong, you'll get validation errors.

## Common Fixes

| Problem                            | Solution                                             |
| ---------------------------------- | ---------------------------------------------------- |
| `event.date` is string             | Use `transformEventRow()` or `fetchEventBySlug()`    |
| `event.end_time` undefined         | Use `event.endTime`, which is `string \| null`       |
| Wrong field names (snake vs camel) | Use app types only (`AppEvent`, etc.)                |
| Date formatting inconsistent       | Use `formatEventTime()` from utils                   |
| Type errors in components          | Run transformation in server action, pass typed data |

## Performance

Transformations are lightweight (just field mapping + date parsing). The Zod validation happens once per fetch and provides:

- **Type safety** - No runtime errors from shape mismatches
- **Early error detection** - Bad data caught immediately
- **Self-documenting** - Code shows exact shape expected

No performance penalty vs. direct queries.
