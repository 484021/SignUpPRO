"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { RecurrenceRule } from "@/lib/types"

interface RecurrenceSelectorProps {
  value: RecurrenceRule | null
  onChange: (rule: RecurrenceRule) => void
}

const DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
]

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const rule = value || { frequency: "weekly" as const, interval: 1, daysOfWeek: [1] }

  const updateRule = (updates: Partial<RecurrenceRule>) => {
    onChange({ ...rule, ...updates })
  }

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={rule.frequency}
            onValueChange={(frequency: "daily" | "weekly" | "monthly") => updateRule({ frequency })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Every</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="12"
              value={rule.interval}
              onChange={(e) => updateRule({ interval: Number.parseInt(e.target.value) || 1 })}
            />
            <span className="text-sm text-muted-foreground">
              {rule.frequency === "weekly" ? "week(s)" : "month(s)"}
            </span>
          </div>
        </div>
      </div>

      {rule.frequency === "weekly" && (
        <div className="space-y-2">
          <Label>Repeat on</Label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <div key={day.value} className="flex items-center">
                <Checkbox
                  id={`day-${day.value}`}
                  checked={rule.daysOfWeek?.includes(day.value)}
                  onCheckedChange={(checked) => {
                    const current = rule.daysOfWeek || []
                    const updated = checked ? [...current, day.value].sort() : current.filter((d) => d !== day.value)
                    updateRule({ daysOfWeek: updated })
                  }}
                />
                <label htmlFor={`day-${day.value}`} className="ml-2 text-sm">
                  {day.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>End Date (Optional)</Label>
          <Input
            type="date"
            value={rule.endDate ? new Date(rule.endDate).toISOString().split("T")[0] : ""}
            onChange={(e) => updateRule({ endDate: e.target.value ? new Date(e.target.value) : undefined })}
          />
        </div>

        <div className="space-y-2">
          <Label>Or after (occurrences)</Label>
          <Input
            type="number"
            min="1"
            placeholder="e.g., 10"
            value={rule.occurrences || ""}
            onChange={(e) => updateRule({ occurrences: e.target.value ? Number.parseInt(e.target.value) : undefined })}
          />
        </div>
      </div>
    </div>
  )
}
