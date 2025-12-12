import { z } from "zod";

// ============================================================================
// DATABASE ROW TYPES (raw from Supabase, snake_case)
// ============================================================================

export const UserRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  plan: z.enum(["free", "pro"]).default("free"),
  clerk_id: z.string().optional(),
  created_at: z.string().datetime(),
});

export type UserRow = z.infer<typeof UserRowSchema>;

export const EventRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(), // Deprecated, use clerk_id
  clerk_id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().default(null),
  date: z.string().datetime(), // Start datetime
  start_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(), // HH:mm format (for display)
  end_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable()
    .optional(), // DEPRECATED: HH:mm format
  end_datetime: z.string().datetime().nullable().optional(), // Full end timestamp
  timezone: z.string().default("UTC"),
  recurrence_rule: z.record(z.any()).nullable().default(null), // JSONB
  status: z.enum(["open", "closed"]).default("open"),
  slug: z.string(),
  show_signups: z.boolean().default(true),
  paid: z.boolean().optional(),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

export type EventRow = z.infer<typeof EventRowSchema>;

export const SlotRowSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  capacity: z.number().int().positive(),
  available: z.number().int().nonnegative(),
  occurrence_date: z.string().datetime().nullable().optional(),
  order: z.number().int().optional(),
  created_at: z.string().datetime(),
});

export type SlotRow = z.infer<typeof SlotRowSchema>;

export const SignupRowSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  slot_id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  status: z.enum(["confirmed", "cancelled", "waitlisted"]).default("confirmed"),
  paid: z.boolean().default(false),
  notes: z.string().nullable().optional(),
  manage_token: z.string(),
  occurrence_date: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().optional(),
});

export type SignupRow = z.infer<typeof SignupRowSchema>;

// ============================================================================
// APP TYPES (normalized, camelCase)
// ============================================================================

export const AppUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  plan: z.enum(["free", "pro"]),
  clerkId: z.string().optional(),
  createdAt: z.date(),
});

export type AppUser = z.infer<typeof AppUserSchema>;

export const AppEventSchema = z.object({
  id: z.string().uuid(),
  clerkId: z.string().optional(),
  userId: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().nullable(),
  startDate: z.date(), // Start datetime
  endDate: z.date().nullable(), // End datetime (null if no end time)
  timezone: z.string(),
  recurrenceRule: z.record(z.any()).nullable(),
  status: z.enum(["open", "closed"]),
  slug: z.string(),
  showSignups: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AppEvent = z.infer<typeof AppEventSchema>;

export const AppSlotSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  capacity: z.number().int().positive(),
  available: z.number().int().nonnegative(),
  occurrenceDate: z.date().nullable().optional(),
  order: z.number().int().optional(),
  createdAt: z.date(),
});

export type AppSlot = z.infer<typeof AppSlotSchema>;

export const AppSignupSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  slotId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().optional(),
  status: z.enum(["confirmed", "cancelled", "waitlisted"]),
  paid: z.boolean(),
  notes: z.string().nullable().optional(),
  manageToken: z.string(),
  occurrenceDate: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type AppSignup = z.infer<typeof AppSignupSchema>;

// ============================================================================
// CREATE/UPDATE REQUEST SCHEMAS
// ============================================================================

export const CreateEventRequestSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional().default(""),
  date: z.string().datetime("Invalid date format"),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)")
    .nullable()
    .optional(),
  timezone: z.string().default("UTC"),
  recurrenceRule: z.record(z.any()).nullable().optional(),
  showSignups: z.boolean().default(true),
  slots: z.array(
    z.object({
      name: z.string().min(1),
      capacity: z.number().int().positive(),
    })
  ),
});

export type CreateEventRequest = z.infer<typeof CreateEventRequestSchema>;

export const CreateSignupRequestSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  slotId: z.string().uuid(),
});

export type CreateSignupRequest = z.infer<typeof CreateSignupRequestSchema>;
