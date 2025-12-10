"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { Event, Slot } from "@/lib/types"

interface EditEventClientProps {
  event: Event
  existingSlots: Slot[]
  user: {
    plan: string
    recurringSeriesCount: number
  }
}

export function EditEventClient({ event, existingSlots, user }: EditEventClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState(event.title)
  const [description, setDescription] = useState(event.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { updateEvent } = await import("@/lib/actions/events")

      const result = await updateEvent(event.id, {
        title,
        description,
      })

      if (result && typeof result === "object" && "success" in result) {
        if (!result.success) {
          toast({
            title: "Error updating event",
            description: result.error || "Failed to update event. Please try again.",
            variant: "destructive",
          })
          return
        }
      }

      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      })

      router.push(`/dashboard/events/${event.id}`)
      router.refresh()
    } catch (error) {
      let errorMessage = "An unknown error occurred. Please try again."

      if (error instanceof Error) {
        errorMessage = error.message || errorMessage
      } else if (typeof error === "string") {
        errorMessage = error
      } else if (error && typeof error === "object") {
        errorMessage = (error as any).message || (error as any).error || JSON.stringify(error)
      }

      toast({
        title: "Error updating event",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Update basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Product Launch Webinar"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell attendees about your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/dashboard/events/${event.id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
