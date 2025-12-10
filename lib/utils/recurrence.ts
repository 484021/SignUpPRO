export interface RecurrenceRule {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval?: number
  until?: string
  count?: number
  byweekday?: number[] // 0 = Monday, 6 = Sunday
  bymonthday?: number[]
  bymonth?: number[]
}

const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FULL_WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function formatRecurrenceDetails(rule: RecurrenceRule): string {
  const { frequency, interval = 1, byweekday, until } = rule

  let details = ""

  // Frequency with interval
  if (interval === 1) {
    details = frequency.charAt(0).toUpperCase() + frequency.slice(1)
  } else {
    details = `Every ${interval} ${frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : frequency === "monthly" ? "months" : "years"}`
  }

  // Days of the week (for weekly recurrence)
  if (frequency === "weekly" && byweekday && byweekday.length > 0) {
    const dayNames = byweekday.map((day) => WEEKDAY_NAMES[day]).join(", ")
    details += ` on ${dayNames}`
  }

  // Until date
  if (until) {
    const untilDate = new Date(until)
    details += ` until ${untilDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }

  return details
}

export function formatRecurrenceBadge(rule: RecurrenceRule): string {
  const { frequency, interval = 1 } = rule

  if (interval === 1) {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  return `Every ${interval} ${frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : frequency === "monthly" ? "months" : "years"}`
}
