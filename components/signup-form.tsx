"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignupFormProps {
  eventId: string
  slotId: string
  slotName?: string
  occurrenceDate?: string | null
  onSuccess: (data: { name: string; email: string; slotId: string; isWaitlist: boolean }) => void
  onBack?: () => void
}

export function SignupForm({ eventId, slotId, slotName, occurrenceDate, onSuccess, onBack }: SignupFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/signups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          slotId,
          name: name.trim(),
          email: email.trim(),
          occurrenceDate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.isWaitlist) {
          toast({
            title: "Added to waitlist!",
            description: `You're #${data.position} on the waitlist. We'll notify you if a spot opens up.`,
          })
        } else {
          toast({
            title: "Success!",
            description: "You've been signed up successfully. Check your email for confirmation.",
          })
        }
        try {
          onSuccess?.({ name, email, slotId, isWaitlist: data.isWaitlist || false })
        } catch (error) {
          console.error("Error in onSuccess callback:", error)
        }
      } else {
        const errorMessage = data.error || "Failed to complete signup"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              We'll send you a confirmation and a link to manage your signup
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing up...
                </>
              ) : (
                "Complete Signup"
              )}
            </Button>
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
