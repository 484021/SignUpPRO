"use client"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, MoreVertical, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { deleteEvent, removeSignup } from "@/lib/actions/events"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { LinkIcon } from "lucide-react"
import { generateOccurrences as generateOccurrencesUtil } from "@/lib/utils/generate-occurrences"

interface RecurringEventManagerProps {
  event: any
  slots: any[]
  signups: any[]
  waitlist: any[]
  publicSignups: any[]
  publicWaitlist: any[]
}

interface EventOccurrence {
  date: Date
  slots: Array<{
    id: string
    name: string
    time: string
    filled: number
    capacity: number
    signups: any[]
    waitlist: any[]
    isWaitlist: boolean
    available: number
  }>
}

interface OccurrenceSlot {
  id: string
  name: string
  time: string
  filled: number
  capacity: number
  signups: any[]
  waitlist: any[]
  isWaitlist: boolean
  available: number
}

export function RecurringEventManager({
  event,
  slots,
  signups,
  waitlist,
  publicSignups,
  publicWaitlist,
}: RecurringEventManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set())
  const [hidePastSpots, setHidePastSpots] = useState(false)
  const [hideFullSpots, setHideFullSpots] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [removingSignupId, setRemovingSignupId] = useState<string | null>(null)
  const [deletingOccurrence, setDeletingOccurrence] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)
  const [selectedOccurrence, setSelectedOccurrence] = useState<any | null>(null)

  console.log("[v0] RecurringEventManager - Props received:")
  console.log("[v0] - event:", event?.title)
  console.log("[v0] - slots:", slots?.length, slots)
  console.log("[v0] - signups:", signups?.length)
  console.log("[v0] - waitlist:", waitlist?.length)
  console.log("[v0] - publicSignups:", publicSignups?.length)
  console.log("[v0] - publicWaitlist:", publicWaitlist?.length)

  const safeSlots = Array.isArray(slots) ? slots : []
  const safeSignups = Array.isArray(signups) ? signups : []
  const safeWaitlist = Array.isArray(waitlist) ? waitlist : []

  const occurrences = useMemo(() => {
    console.log("[v0] Building occurrences...")
    console.log("[v0] - safeSlots length:", safeSlots.length)
    console.log("[v0] - safeSlots data:", safeSlots)
    console.log("[v0] - event.recurrence_rule:", event?.recurrence_rule)
    console.log("[v0] - event.date:", event?.date)

    safeSlots.forEach((slot, idx) => {
      console.log(`[v0] Slot ${idx}: name="${slot?.name}", occurrence_date="${slot?.occurrence_date}"`)
    })

    let generatedDates: Date[] = []

    if (!event.recurrence_rule) {
      // For non-recurring events, use the event date
      generatedDates = [new Date(event.date)]
    } else {
      // For recurring events, generate occurrences from the recurrence rule
      generatedDates = generateOccurrencesUtil(new Date(event.date), event.recurrence_rule)
    }

    console.log("[v0] Generated", generatedDates.length, "occurrence dates from recurrence pattern")

    // Separate slots into those with specific dates and template slots (no occurrence_date)
    const templateSlots = safeSlots.filter((slot) => !slot?.occurrence_date)
    const specificDateSlots = safeSlots.filter((slot) => slot?.occurrence_date)

    console.log("[v0] Template slots (no occurrence_date):", templateSlots.length)
    console.log("[v0] Specific date slots:", specificDateSlots.length)

    // For each generated occurrence, collect applicable slots
    return generatedDates
      .map((date) => {
        const occurrenceDateStr = format(date, "yyyy-MM-dd")

        // Include template slots (apply to all occurrences) + slots with matching occurrence_date
        const applicableSlots = [
          ...templateSlots,
          ...specificDateSlots.filter((slot) => {
            try {
              const slotDateStr = format(parseISO(slot.occurrence_date!), "yyyy-MM-dd")
              return slotDateStr === occurrenceDateStr
            } catch (err) {
              console.error("[v0] Error parsing slot occurrence_date:", slot.occurrence_date, err)
              return false
            }
          }),
        ]

        console.log(`[v0] Occurrence ${occurrenceDateStr} has ${applicableSlots.length} applicable slots`)

        // Filter out "Waitlist" named slots
        const regularSlots = applicableSlots.filter(
          (slot) => slot?.name && !slot.name.toLowerCase().includes("waitlist"),
        )

        // Get waitlist for this occurrence
        const relevantWaitlist = safeWaitlist.filter((w: any) => {
          const slot = regularSlots.find((slot) => slot.id === w.slot_id)
          return !!slot
        })

        const occurrenceSlotsData: OccurrenceSlot[] = []

        regularSlots.forEach((regularSlot) => {
          // For template slots, only show signups/waitlist that match this specific occurrence date
          const slotSignups = safeSignups.filter((s: any) => {
            if (s.slot_id !== regularSlot.id) return false

            // If the signup has an occurrence_date, check if it matches
            if (s.occurrence_date) {
              try {
                const signupDateStr = format(parseISO(s.occurrence_date), "yyyy-MM-dd")
                return signupDateStr === occurrenceDateStr
              } catch (err) {
                console.error("[v0] Error parsing signup occurrence_date:", s.occurrence_date, err)
                return false
              }
            }

            // If no occurrence_date on signup, include it (backward compatibility)
            return true
          })

          const slotWaitlist = relevantWaitlist.filter((w: any) => {
            if (w.slot_id !== regularSlot.id) return false

            // Similar logic for waitlist entries
            if (w.occurrence_date) {
              try {
                const waitlistDateStr = format(parseISO(w.occurrence_date), "yyyy-MM-dd")
                return waitlistDateStr === occurrenceDateStr
              } catch (err) {
                console.error("[v0] Error parsing waitlist occurrence_date:", w.occurrence_date, err)
                return false
              }
            }

            return true
          })

          console.log(`[v0] Slot "${regularSlot.name}" (${regularSlot.id}) for ${occurrenceDateStr}:`, {
            signups: slotSignups.length,
            waitlist: slotWaitlist.length,
          })

          const available = regularSlot.capacity - slotSignups.length

          occurrenceSlotsData.push({
            id: regularSlot.id,
            name: regularSlot.name,
            time:
              regularSlot.start_time && regularSlot.end_time
                ? `${regularSlot.start_time} - ${regularSlot.end_time}`
                : "",
            filled: slotSignups.length,
            capacity: regularSlot.capacity,
            signups: slotSignups,
            waitlist: slotWaitlist,
            available,
            isWaitlist: false,
          })
        })

        return {
          date,
          slots: occurrenceSlotsData,
          filled: occurrenceSlotsData.reduce((sum, slot) => sum + slot.filled, 0),
          capacity: occurrenceSlotsData.reduce((sum, slot) => sum + slot.capacity, 0),
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [safeSlots, safeSignups, safeWaitlist, event.recurrence_rule, event.date])

  const filteredOccurrences = useMemo(() => {
    console.log("[v0] Filtering occurrences...")
    console.log("[v0] - Total occurrences:", occurrences.length)
    console.log("[v0] - hidePastSpots:", hidePastSpots)
    console.log("[v0] - hideFullSpots:", hideFullSpots)

    let filtered = occurrences

    if (hidePastSpots) {
      const now = new Date()
      filtered = filtered.filter((occ) => occ.date >= now)
      console.log("[v0] - After hidePastSpots filter:", filtered.length)
    }

    if (hideFullSpots) {
      filtered = filtered.filter((occ) => {
        const hasAvailableSpots = occ.slots.some((slot) => !slot.isWaitlist && slot.available > 0)
        return hasAvailableSpots
      })
      console.log("[v0] - After hideFullSpots filter:", filtered.length)
    }

    console.log("[v0] Final filtered occurrences:", filtered.length)
    return filtered
  }, [occurrences, hidePastSpots, hideFullSpots])

  console.log("[v0] About to render. filteredOccurrences:", filteredOccurrences.length)

  if (!event) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">Error: Event data is missing</p>
      </div>
    )
  }

  const toggleDate = (dateStr: string) => {
    const newExpanded = new Set(expandedDates)
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr)
    } else {
      newExpanded.add(dateStr)
    }
    setExpandedDates(newExpanded)
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/signup/${event.slug}`
    navigator.clipboard.writeText(url)
    toast({ title: "Link copied", description: "Signup link copied to clipboard." })
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/duplicate`, { method: "POST" })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to duplicate event")
      }

      const data = await response.json()
      toast({ title: "Event duplicated", description: "Your event has been duplicated successfully." })
      router.push(`/dashboard/events/${data.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate event",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    try {
      const csvHeaders = ["Name", "Email", "Category", "Status", "Signed Up At"]
      const csvRows = signups.map((signup) => {
        const slot = slots.find((s) => s.id === (signup as any).slot_id)
        return [
          signup.name,
          signup.email,
          slot?.name || "Unknown",
          signup.status,
          new Date(signup.createdAt).toLocaleString(),
        ]
          .map((field) => `"${field}"`)
          .join(",")
      })

      const csv = [csvHeaders.join(","), ...csvRows].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-signups.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({ title: "CSV exported", description: "Your signup data has been exported." })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      })
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this entire recurring event? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEvent(event.id)
      toast({ title: "Event deleted", description: "The event has been deleted successfully." })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteAllOccurrences = async () => {
    if (!confirm("Are you sure you want to delete all occurrences of this event? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEvent(event.id)
      toast({ title: "All occurrences deleted", description: "All occurrences have been deleted successfully." })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete all occurrences",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveSignup = async (signupId: string, occurrenceDate: Date) => {
    if (!confirm("Are you sure you want to remove this participant from this occurrence?")) {
      return
    }

    setRemovingSignupId(signupId)
    try {
      await removeSignup(signupId, event.id)
      toast({
        title: "Participant removed",
        description: "The participant has been removed from the occurrence.",
      })
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove participant",
        variant: "destructive",
      })
    } finally {
      setRemovingSignupId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHidePastSpots(!hidePastSpots)}
            className="text-xs sm:text-sm"
          >
            {hidePastSpots ? "Show Past" : "Hide Past"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHideFullSpots(!hideFullSpots)}
            className="text-xs sm:text-sm"
          >
            {hideFullSpots ? "Show Full" : "Hide Full"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLink} className="text-xs sm:text-sm bg-transparent">
            <LinkIcon className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}>
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteAllOccurrences} className="text-destructive">
              Delete All Occurrences
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredOccurrences.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">
            {hidePastSpots || hideFullSpots ? "No occurrences match your filters" : "No occurrences found"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOccurrences.map((occurrence) => {
            const dateStr = format(occurrence.date, "yyyy-MM-dd")
            const isExpanded = expandedDates.has(dateStr)
            const totalFilled = occurrence.slots.reduce((sum, slot) => sum + slot.filled, 0)
            const totalCapacity = occurrence.slots.reduce((sum, slot) => sum + slot.capacity, 0)

            return (
              <Card key={dateStr} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer bg-gray-50 p-4 hover:bg-gray-100"
                  onClick={() => toggleDate(dateStr)}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      <h3 className="text-base font-semibold sm:text-lg">
                        {format(occurrence.date, "EEEE, MMM d, yyyy")}
                      </h3>
                    </div>
                    <span className="text-sm text-gray-500 sm:text-base">
                      {totalFilled} of {totalCapacity} filled
                    </span>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead className="border-b bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 sm:text-sm">
                              Spot
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 sm:text-sm">
                              Time
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 sm:text-sm">
                              Capacity
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 sm:text-sm">
                              Participants
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {occurrence.slots
                            .filter((slot) => !slot.isWaitlist)
                            .map((slot) => (
                              <tr key={slot.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium sm:text-base">{slot.name}</td>
                                <td className="px-4 py-3 text-xs text-gray-500 sm:text-sm">{slot.time}</td>
                                <td className="px-4 py-3 text-sm sm:text-base">
                                  {slot.filled} / {slot.capacity}
                                  {slot.waitlist && slot.waitlist.length > 0 && (
                                    <span className="ml-1 text-orange-600">(+{slot.waitlist.length} waitlist)</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-primary hover:text-primary sm:text-sm"
                                        onClick={() => {
                                          setSelectedSlot(slot)
                                          setSelectedOccurrence(occurrence)
                                          console.log("[v0] Opening dialog for slot:", {
                                            slotName: slot.name,
                                            signupsCount: slot.signups?.length,
                                            waitlistCount: slot.waitlist?.length,
                                            waitlistData: slot.waitlist,
                                          })
                                        }}
                                      >
                                        <Users className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                        View ({slot.filled + (slot.waitlist?.length || 0)})
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
                                      <DialogHeader>
                                        <DialogTitle className="text-base sm:text-lg">
                                          {slot.name} - {format(occurrence.date, "MMM d, yyyy")}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-6">
                                        {slot.signups && slot.signups.length > 0 && (
                                          <div>
                                            <h4 className="mb-3 text-sm font-semibold text-gray-900 sm:text-base">
                                              Confirmed ({slot.signups.length})
                                            </h4>
                                            <div className="space-y-2">
                                              {slot.signups.map((signup: any) => (
                                                <div
                                                  key={signup.id}
                                                  className="flex items-center justify-between rounded-lg border p-3"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary sm:h-10 sm:w-10 sm:text-sm">
                                                      {signup.name?.[0]?.toUpperCase() || "?"}
                                                    </div>
                                                    <div>
                                                      <p className="text-sm font-medium sm:text-base">{signup.name}</p>
                                                      <p className="text-xs text-gray-500 sm:text-sm">{signup.email}</p>
                                                    </div>
                                                  </div>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                      <DropdownMenuItem
                                                        onClick={() => handleRemoveSignup(signup.id, occurrence.date)}
                                                        className="text-destructive"
                                                      >
                                                        Remove
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {slot.waitlist && slot.waitlist.length > 0 && (
                                          <div>
                                            <h4 className="mb-3 text-sm font-semibold text-orange-600 sm:text-base">
                                              Waitlist ({slot.waitlist.length})
                                            </h4>
                                            <div className="space-y-2">
                                              {slot.waitlist.map((waitlistSignup: any, index: number) => (
                                                <div
                                                  key={waitlistSignup.id}
                                                  className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 p-3"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600 sm:h-10 sm:w-10 sm:text-sm">
                                                      {index + 1}
                                                    </div>
                                                    <div>
                                                      <p className="text-sm font-medium sm:text-base">
                                                        {waitlistSignup.name}
                                                      </p>
                                                      <p className="text-xs text-gray-600 sm:text-sm">
                                                        {waitlistSignup.email}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                      <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                      </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                      <DropdownMenuItem
                                                        onClick={() =>
                                                          handleRemoveSignup(waitlistSignup.id, occurrence.date)
                                                        }
                                                        className="text-destructive"
                                                      >
                                                        Remove from Waitlist
                                                      </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                  </DropdownMenu>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {(!slot.signups || slot.signups.length === 0) &&
                                          (!slot.waitlist || slot.waitlist.length === 0) && (
                                            <p className="text-center text-sm text-gray-500">No participants yet</p>
                                          )}
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
