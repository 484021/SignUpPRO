import { parseISO } from "date-fns";
import type {
  UserRow,
  EventRow,
  SlotRow,
  SignupRow,
  AppUser,
  AppEvent,
  AppSlot,
  AppSignup,
} from "@/lib/schemas/database";
import {
  UserRowSchema,
  EventRowSchema,
  SlotRowSchema,
  SignupRowSchema,
  AppUserSchema,
  AppEventSchema,
  AppSlotSchema,
  AppSignupSchema,
} from "@/lib/schemas/database";

/**
 * Transform and validate raw database rows to app types
 * These functions ensure type safety and catch data inconsistencies early
 */

export function transformUserRow(row: unknown): AppUser {
  const validated = UserRowSchema.parse(row);
  return AppUserSchema.parse({
    id: validated.id,
    email: validated.email,
    plan: validated.plan,
    clerkId: validated.clerk_id,
    createdAt: parseISO(validated.created_at),
  });
}

export function transformEventRow(row: unknown): AppEvent {
  const validated = EventRowSchema.parse(row);

  // Calculate endDate from available data
  let endDate: Date | null = null;
  if (validated.end_datetime) {
    // Prefer full end_datetime if available
    endDate = parseISO(validated.end_datetime);
  } else if (validated.end_time) {
    // Fallback: combine date with end_time (HH:mm)
    const startDate = parseISO(validated.date);
    const [hours, minutes] = validated.end_time.split(":").map(Number);
    endDate = new Date(startDate);
    endDate.setHours(hours, minutes, 0, 0);
  }

  return AppEventSchema.parse({
    id: validated.id,
    clerkId: validated.clerk_id,
    userId: validated.user_id,
    title: validated.title,
    description: validated.description,
    startDate: parseISO(validated.date),
    endDate,
    timezone: validated.timezone,
    recurrenceRule: validated.recurrence_rule,
    status: validated.status,
    slug: validated.slug,
    showSignups: validated.show_signups,
    createdAt: parseISO(validated.created_at),
    updatedAt: validated.updated_at
      ? parseISO(validated.updated_at)
      : parseISO(validated.created_at),
  });
}

export function transformSlotRow(row: unknown): AppSlot {
  const validated = SlotRowSchema.parse(row);
  return AppSlotSchema.parse({
    id: validated.id,
    eventId: validated.event_id,
    name: validated.name,
    description: validated.description,
    capacity: validated.capacity,
    available: validated.available,
    occurrenceDate: validated.occurrence_date
      ? parseISO(validated.occurrence_date)
      : null,
    order: validated.order,
    createdAt: parseISO(validated.created_at),
  });
}

export function transformSignupRow(row: unknown): AppSignup {
  const validated = SignupRowSchema.parse(row);
  return AppSignupSchema.parse({
    id: validated.id,
    eventId: validated.event_id,
    slotId: validated.slot_id,
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    status: validated.status,
    paid: validated.paid,
    notes: validated.notes,
    manageToken: validated.manage_token,
    occurrenceDate: validated.occurrence_date
      ? parseISO(validated.occurrence_date)
      : null,
    createdAt: parseISO(validated.created_at),
    updatedAt: validated.updated_at
      ? parseISO(validated.updated_at)
      : parseISO(validated.created_at),
  });
}

// Batch transforms
export function transformUserRows(rows: unknown[]): AppUser[] {
  return rows.map(transformUserRow);
}

export function transformEventRows(rows: unknown[]): AppEvent[] {
  return rows.map(transformEventRow);
}

export function transformSlotRows(rows: unknown[]): AppSlot[] {
  return rows.map(transformSlotRow);
}

export function transformSignupRows(rows: unknown[]): AppSignup[] {
  return rows.map(transformSignupRow);
}

/**
 * Convert app types back to database format for inserts/updates
 */

export function eventToDbFormat(event: Partial<AppEvent>) {
  // Extract end_time as HH:mm from endDate for backward compatibility
  let endTime: string | null = null;
  if (event.endDate) {
    const hours = String(event.endDate.getHours()).padStart(2, "0");
    const minutes = String(event.endDate.getMinutes()).padStart(2, "0");
    endTime = `${hours}:${minutes}`;
  }

  return {
    title: event.title,
    description: event.description,
    date: event.startDate?.toISOString(),
    end_time: endTime,
    end_datetime: event.endDate?.toISOString(),
    timezone: event.timezone,
    recurrence_rule: event.recurrenceRule,
    status: event.status,
    slug: event.slug,
    show_signups: event.showSignups,
  };
}

export function signupToDbFormat(signup: Partial<AppSignup>) {
  return {
    name: signup.name,
    email: signup.email,
    phone: signup.phone,
    status: signup.status,
    paid: signup.paid,
    notes: signup.notes,
  };
}
