export type UserPlan = "free" | "pro";

export interface User {
  id: string;
  email: string;
  plan: UserPlan;
  signupsThisMonth: number;
  activeEventsCount: number;
  recurringSeriesCount: number;
  createdAt: Date;
}

export type EventStatus = "draft" | "open" | "closed" | "full";

export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number; // e.g., every 2 weeks (defaults to 1)
  until?: string; // ISO date string for end date
  count?: number; // number of occurrences
  byweekday?: number[]; // 0 = Monday, 6 = Sunday (for weekly recurrence)
  bymonthday?: number[]; // days of month (for monthly recurrence)
  bymonth?: number[]; // months (for yearly recurrence)
}

export interface Event {
  id: string;
  organizerId?: string;
  clerk_id?: string;
  user_id?: string;
  title: string;
  description: string;
  date: Date | string;
  end_time?: string;
  end_datetime?: Date | string; // New field: full end datetime
  timezone?: string;
  slug?: string;
  status?: EventStatus;
  recurrence_rule?: RecurrenceRule; // Updated to use snake_case to match database
  recurrenceRule?: RecurrenceRule; // Keep camelCase for backward compatibility
  slots?: Slot[]; // Added slots for populated queries
  signups?: Signup[]; // Added signups for populated queries
  show_signups?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  created_at?: string;
  updated_at?: string;
}

export interface Slot {
  id: string;
  eventId: string;
  event_id?: string;
  name: string;
  description?: string;
  capacity: number;
  available: number;
  order?: number;
  occurrence_date?: string;
  created_at?: string;
}

export type SignupStatus =
  | "confirmed"
  | "waitlist"
  | "waitlisted"
  | "cancelled";

export interface Signup {
  id: string;
  eventId: string;
  slotId: string;
  slot_id?: string;
  event_id?: string;
  name: string;
  email: string;
  status: SignupStatus;
  occurrence_date?: string;
  magicLinkToken?: string;
  createdAt: Date;
  created_at?: string;
}

export type Waitlist = WaitlistEntry;

export interface WaitlistEntry {
  id: string;
  eventId: string;
  slotId: string;
  slot_id?: string;
  event_id?: string;
  name: string;
  email: string;
  position: number;
  createdAt: Date;
  created_at?: string;
}

export interface EventAnalytics {
  eventId: string;
  totalSignups: number;
  totalWaitlist: number;
  slotUtilization: Record<string, number>;
  signupsByDay: Array<{ date: string; count: number }>;
}
