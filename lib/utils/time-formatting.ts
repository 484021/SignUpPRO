import { format } from "date-fns";

/**
 * Format event time display consistently
 * Handles both start and end times
 */
export function formatEventTime(
  startDate: Date,
  endDate?: Date | null
): string {
  const startTime = format(startDate, "h:mm a");
  if (!endDate) return startTime;
  const endTime = format(endDate, "h:mm a");
  return `${startTime} — ${endTime}`;
}

/**
 * Format full event datetime with date and time
 */
export function formatEventDateTime(
  startDate: Date,
  endDate?: Date | null
): string {
  const dateStr = format(startDate, "EEEE, MMM d, yyyy");
  const timeStr = formatEventTime(startDate, endDate);
  return `${dateStr} · ${timeStr}`;
}

/**
 * Ensure time is in HH:mm format
 */
export function normalizeTime(time: string): string {
  // Convert 12h to 24h if needed
  const [hours, minutes] = time.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${time}`);
  }
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

/**
 * Convert 24h time to 12h format with AM/PM
 */
export function convertTo12h(hour24: string): {
  hour: string;
  period: "AM" | "PM";
} {
  let h = parseInt(hour24) || 0;
  if (h === 0) return { hour: "12", period: "AM" };
  if (h < 12) return { hour: String(h).padStart(2, "0"), period: "AM" };
  if (h === 12) return { hour: "12", period: "PM" };
  return { hour: String(h - 12).padStart(2, "0"), period: "PM" };
}

/**
 * Convert 12h time with period to 24h format
 */
export function convertTo24h(hour12: string, period: "AM" | "PM"): number {
  let h = parseInt(hour12) || 0;
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h;
}

/**
 * Get days in month (handles leap years)
 */
export function getDaysInMonth(
  year: string | number,
  month: string | number
): number {
  const y = typeof year === "string" ? parseInt(year) : year;
  const m = typeof month === "string" ? parseInt(month) : month;
  return new Date(y, m, 0).getDate();
}

/**
 * Validate timezone is supported
 */
export function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}
