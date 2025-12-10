import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WaitlistEntry } from "@/lib/types"

interface WaitlistItemProps {
  entry: WaitlistEntry
  slotName?: string
}

export function WaitlistItem({ entry, slotName }: WaitlistItemProps) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Position #{entry.position}</Badge>
              <span className="font-medium">{entry.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">{entry.email}</div>
            {slotName && <div className="text-sm text-muted-foreground">Slot: {slotName}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
