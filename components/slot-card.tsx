import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Slot } from "@/lib/types"

interface SlotCardProps {
  slot: Slot
}

export function SlotCard({ slot }: SlotCardProps) {
  const filledPercentage = ((slot.capacity - slot.available) / slot.capacity) * 100

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{slot.name}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {slot.capacity - slot.available} / {slot.capacity} filled
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Progress value={filledPercentage} className="h-2" />
      </CardContent>
    </Card>
  )
}
