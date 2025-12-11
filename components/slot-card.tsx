import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format, parseISO } from "date-fns";
import type { Slot } from "@/lib/types";

interface SlotCardProps {
  slot: Slot;
}

export function SlotCard({ slot }: SlotCardProps) {
  const filledPercentage =
    ((slot.capacity - slot.available) / slot.capacity) * 100;
  const isFull = slot.available === 0;

  return (
    <Card className="rounded-2xl shadow-sm border-0 hover:shadow-md transition-shadow">
      <CardContent className="py-6 px-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {slot.name}
              </h3>
              {slot.occurrence_date && (
                <p className="text-sm text-muted-foreground mt-1">
                  {format(
                    parseISO(slot.occurrence_date),
                    "EEE, MMM d • h:mm a"
                  )}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">
                {slot.capacity - slot.available} / {slot.capacity}
              </p>
              <p
                className={`text-xs mt-1 font-medium ${isFull ? "text-destructive" : "text-muted-foreground"}`}
              >
                {isFull ? "Full" : `${slot.available} available`}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress
            value={filledPercentage}
            className="h-2 rounded-full bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
}
