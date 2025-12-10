import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail } from "lucide-react"
import type { WaitlistEntry, Slot } from "@/lib/types"

interface WaitlistViewProps {
  waitlist: WaitlistEntry[]
  slots: Slot[]
}

export function WaitlistView({ waitlist, slots }: WaitlistViewProps) {
  if (waitlist.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No one on the waitlist</CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {waitlist
        .sort((a, b) => a.position - b.position)
        .map((entry) => {
          const slot = slots.find((s) => s.id === entry.slotId)
          return (
            <Card key={entry.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{entry.position}</Badge>
                      <span className="font-medium">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {entry.email}
                    </div>
                    {slot && <div className="text-sm text-muted-foreground">Slot: {slot.name}</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
    </div>
  )
}
