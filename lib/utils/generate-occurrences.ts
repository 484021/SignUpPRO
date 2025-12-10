export function generateOccurrences(
  startDate: Date,
  recurrenceRule: { frequency?: string; interval?: number; count?: number } | null | undefined,
): Date[] {
  if (!recurrenceRule || !recurrenceRule.frequency) {
    return []
  }

  const { frequency, interval = 1, count = 4 } = recurrenceRule
  const occurrences: Date[] = []

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate)

    if (frequency === "daily") {
      date.setDate(startDate.getDate() + i * interval)
    } else if (frequency === "weekly") {
      date.setDate(startDate.getDate() + i * 7 * interval)
    } else if (frequency === "monthly") {
      date.setMonth(startDate.getMonth() + i * interval)
    }

    occurrences.push(date)
  }

  return occurrences
}
