import type { User, Event, Slot, Signup, WaitlistEntry, EventAnalytics } from "./types"

export const MOCK_USER: User = {
  id: "user_1",
  email: "organizer@example.com",
  plan: "free",
  signupsThisMonth: 23,
  activeEventsCount: 3,
  recurringSeriesCount: 1,
  createdAt: new Date("2024-01-15"),
}

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt_1",
    organizerId: "user_1",
    title: "Community Yoga Class",
    description: "Join us for a relaxing yoga session suitable for all levels.",
    date: new Date("2025-01-20T10:00:00"),
    status: "open",
    createdAt: new Date("2024-12-01"),
    updatedAt: new Date("2024-12-01"),
  },
  {
    id: "evt_2",
    organizerId: "user_1",
    title: "Weekly Team Standup",
    description: "Our regular Monday morning sync.",
    date: new Date("2025-01-13T09:00:00"),
    recurrenceRule: {
      frequency: "weekly",
      interval: 1,
      daysOfWeek: [1], // Monday
    },
    status: "open",
    createdAt: new Date("2024-11-20"),
    updatedAt: new Date("2024-11-20"),
  },
  {
    id: "evt_3",
    organizerId: "user_1",
    title: "Product Design Workshop",
    description: "Hands-on workshop for learning design thinking principles.",
    date: new Date("2025-01-25T14:00:00"),
    status: "full",
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-15"),
  },
]

export const MOCK_SLOTS: Slot[] = [
  // Yoga Class slots
  { id: "slot_1", eventId: "evt_1", name: "Morning Session", capacity: 20, available: 12, order: 0 },
  { id: "slot_2", eventId: "evt_1", name: "Evening Session", capacity: 20, available: 5, order: 1 },
  // Standup slots
  { id: "slot_3", eventId: "evt_2", name: "Engineering Team", capacity: 15, available: 15, order: 0 },
  { id: "slot_4", eventId: "evt_2", name: "Design Team", capacity: 10, available: 8, order: 1 },
  // Workshop slots
  { id: "slot_5", eventId: "evt_3", name: "Session A", capacity: 12, available: 0, order: 0 },
  { id: "slot_6", eventId: "evt_3", name: "Session B", capacity: 12, available: 0, order: 1 },
]

export const MOCK_SIGNUPS: Signup[] = [
  {
    id: "signup_1",
    eventId: "evt_1",
    slotId: "slot_1",
    name: "Alice Johnson",
    email: "alice@example.com",
    status: "confirmed",
    magicLinkToken: "token_abc123",
    createdAt: new Date("2024-12-20"),
  },
  {
    id: "signup_2",
    eventId: "evt_1",
    slotId: "slot_1",
    name: "Bob Smith",
    email: "bob@example.com",
    status: "confirmed",
    magicLinkToken: "token_def456",
    createdAt: new Date("2024-12-21"),
  },
  {
    id: "signup_3",
    eventId: "evt_3",
    slotId: "slot_5",
    name: "Carol White",
    email: "carol@example.com",
    status: "confirmed",
    magicLinkToken: "token_ghi789",
    createdAt: new Date("2024-12-22"),
  },
]

export const MOCK_WAITLIST: WaitlistEntry[] = [
  {
    id: "wait_1",
    eventId: "evt_3",
    slotId: "slot_5",
    name: "David Brown",
    email: "david@example.com",
    position: 1,
    createdAt: new Date("2024-12-23"),
  },
  {
    id: "wait_2",
    eventId: "evt_3",
    slotId: "slot_5",
    name: "Emma Davis",
    email: "emma@example.com",
    position: 2,
    createdAt: new Date("2024-12-24"),
  },
]

export const MOCK_ANALYTICS: Record<string, EventAnalytics> = {
  evt_1: {
    eventId: "evt_1",
    totalSignups: 28,
    totalWaitlist: 0,
    slotUtilization: {
      slot_1: 40, // 8/20 = 40%
      slot_2: 75, // 15/20 = 75%
    },
    signupsByDay: [
      { date: "2024-12-15", count: 5 },
      { date: "2024-12-16", count: 8 },
      { date: "2024-12-17", count: 7 },
      { date: "2024-12-18", count: 4 },
      { date: "2024-12-19", count: 4 },
    ],
  },
  evt_3: {
    eventId: "evt_3",
    totalSignups: 24,
    totalWaitlist: 2,
    slotUtilization: {
      slot_5: 100,
      slot_6: 100,
    },
    signupsByDay: [
      { date: "2024-12-10", count: 12 },
      { date: "2024-12-11", count: 10 },
      { date: "2024-12-12", count: 2 },
    ],
  },
}

export const PRICING = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "Unlimited events",
      "Unlimited recurring series",
      "Unlimited signups",
      "Basic analytics",
      "Email notifications",
    ],
    limits: ["Includes ads", "No CSV export", "No event duplication", "Community support only"],
  },
  pro: {
    name: "Pro",
    price: 29,
    features: [
      "Everything in Free",
      "Ad-free experience",
      "Advanced analytics",
      "CSV export",
      "Event duplication",
      "Priority support",
      "Custom branding",
      "Premium templates",
    ],
    limits: [],
  },
}
