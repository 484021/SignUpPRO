"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Calendar, Trash2, Edit2, Check, X, FileText } from "lucide-react"
import type { Signup, Slot } from "@/lib/types"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { removeSignup, updateSignup } from "@/lib/actions/events"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface SignupListProps {
  signups: Signup[]
  slots: Slot[]
  eventId: string
}

export function SignupList({ signups, slots, eventId }: SignupListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [signupToDelete, setSignupToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleRemove = async (signupId: string) => {
    console.log("[v0] SignupList.handleRemove called with:", signupId)
    setIsLoading(true)
    try {
      const result = await removeSignup(signupId, eventId)
      console.log("[v0] SignupList.handleRemove result:", result)
      toast({
        title: "Signup removed",
        description: "The signup has been removed successfully.",
      })
      setDeleteDialogOpen(false)
      setSignupToDelete(null)
      window.location.reload()
    } catch (error) {
      console.error("[v0] SignupList.handleRemove error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove signup",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (signupId: string) => {
    console.log("[v0] handleUpdate called with:", { signupId, notes: editNotes })
    setIsLoading(true)
    try {
      const result = await updateSignup(signupId, eventId, {
        notes: editNotes,
      })
      console.log("[v0] handleUpdate result:", result)
      toast({
        title: "Success",
        description: "Notes have been saved successfully.",
      })
      setEditingId(null)
      window.location.reload()
    } catch (error) {
      console.error("[v0] handleUpdate error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update signup"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startEdit = (signup: Signup) => {
    setEditingId(signup.id)
    setEditNotes((signup as any).notes || "")
  }

  if (signups.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">No signups yet</CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {signups.map((signup) => {
          const slot = slots.find((s) => s.id === ((signup as any).slot_id || signup.slotId))
          const createdAt = (signup as any).created_at || signup.createdAt
          const signupDate = createdAt ? new Date(createdAt) : null
          const isValidDate = signupDate && !isNaN(signupDate.getTime())
          const isEditing = editingId === signup.id
          const notes = (signup as any).notes || ""

          return (
            <Card key={signup.id}>
              <CardContent className="py-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{signup.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{signup.email}</div>
                      </div>
                      <div className="flex gap-2 justify-end sm:justify-start">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdate(signup.id)}
                          disabled={isLoading}
                          className="flex-1 sm:flex-none"
                        >
                          <Check className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Save</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          className="flex-1 sm:flex-none"
                        >
                          <X className="w-4 h-4" />
                          <span className="sm:hidden">Cancel</span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`notes-${signup.id}`} className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        Notes
                      </Label>
                      <Textarea
                        id={`notes-${signup.id}`}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Add notes about this signup..."
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium text-sm sm:text-base truncate">{signup.name}</div>
                        <Badge
                          variant={signup.status === "confirmed" ? "default" : "secondary"}
                          className="text-xs shrink-0"
                        >
                          {signup.status}
                        </Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{signup.email}</span>
                        </div>
                        {isValidDate && (
                          <div className="flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{format(signupDate, "MMM d, yyyy")}</span>
                          </div>
                        )}
                      </div>
                      {slot && <div className="text-xs sm:text-sm text-muted-foreground">Category: {slot.name}</div>}
                      {notes && (
                        <div className="text-xs sm:text-sm text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                          <FileText className="w-3 h-3 inline mr-1" />
                          <span className="break-words">{notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 justify-end sm:justify-start">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(signup)} className="h-8">
                        <Edit2 className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSignupToDelete(signup.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Remove Signup</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Are you sure you want to remove this signup? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
              className="w-full sm:w-auto m-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => signupToDelete && handleRemove(signupToDelete)}
              disabled={isLoading}
              className="w-full sm:w-auto m-0"
            >
              {isLoading ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
