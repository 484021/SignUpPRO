"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Event, Signup, Slot } from "@/lib/types"

interface ManageSignupClientProps {
  signup: Signup
  event: Event
  slot: Slot
}

export function ManageSignupClient({ signup, event, slot }: ManageSignupClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState(signup.name)
  const [email, setEmail] = useState(signup.email)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/signups/${signup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      if (response.ok) {
        toast({
          title: "Updated successfully",
          description: "Your signup information has been updated.",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to update signup",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update signup",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)

    try {
      const response = await fetch(`/api/signups/${signup.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Cancelled successfully",
          description: result.promoted
            ? "Your signup has been cancelled and someone from the waitlist has been promoted."
            : "Your signup has been cancelled.",
        })
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: "Failed to cancel signup",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel signup",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="text-xl font-semibold">SignUpPRO</div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Manage Your Signup</h1>
          <p className="text-muted-foreground">Update your information or cancel your registration</p>
        </div>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Event</span>
              <span className="font-medium">{event.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slot</span>
              <span className="font-medium">{slot.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{signup.status}</span>
            </div>
          </CardContent>
        </Card>

        {/* Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>Update your name or email address</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isUpdating}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cancel Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Cancel Registration</CardTitle>
            <CardDescription>This action cannot be undone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showCancelConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCancelling}
              >
                Cancel My Signup
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-center">Are you sure you want to cancel your registration?</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={isCancelling}
                  >
                    Keep Signup
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
