"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Plus, X } from "lucide-react"

interface SlotInput {
  id: string
  name: string
  capacity: number
}

interface SlotCreatorProps {
  slots: SlotInput[]
  onChange: (slots: SlotInput[]) => void
}

export function SlotCreator({ slots, onChange }: SlotCreatorProps) {
  const handleAdd = () => {
    onChange([...slots, { id: Date.now().toString(), name: "", capacity: 10 }])
  }

  const handleRemove = (id: string) => {
    if (slots.length > 1) {
      onChange(slots.filter((slot) => slot.id !== id))
    }
  }

  const handleChange = (id: string, field: "name" | "capacity", value: string | number) => {
    onChange(slots.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot)))
  }

  return (
    <div className="space-y-4">
      {slots.map((slot) => (
        <Card key={slot.id} className="p-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`slot-name-${slot.id}`}>Slot Name</Label>
              <Input
                id={`slot-name-${slot.id}`}
                placeholder="e.g., Morning Session"
                value={slot.name}
                onChange={(e) => handleChange(slot.id, "name", e.target.value)}
              />
            </div>
            <div className="w-32 space-y-2">
              <Label htmlFor={`slot-capacity-${slot.id}`}>Capacity</Label>
              <Input
                id={`slot-capacity-${slot.id}`}
                type="number"
                min="1"
                value={slot.capacity}
                onChange={(e) => handleChange(slot.id, "capacity", Number.parseInt(e.target.value) || 0)}
              />
            </div>
            {slots.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemove(slot.id)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={handleAdd} className="w-full bg-transparent">
        <Plus className="w-4 h-4 mr-2" />
        Add Slot
      </Button>
    </div>
  )
}
