import type { User } from "./types"

// Free users have unlimited access, but see ads
// Pro users get ad-free experience and premium features
export function canCreateEvent(user: User): { allowed: boolean; reason?: string } {
  return { allowed: true }
}

export function canCreateRecurring(user: User): { allowed: boolean; reason?: string } {
  return { allowed: true }
}

export function canAcceptSignup(user: User): { allowed: boolean; reason?: string } {
  return { allowed: true }
}

export function isFeatureAllowed(
  user: User,
  feature: "csv-export" | "duplicate-event" | "premium-templates" | "ad-free",
): boolean {
  return user.plan === "pro"
}
