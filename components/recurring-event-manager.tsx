"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreVertical, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  deleteEvent,
  removeSignup,
  deleteOccurrence,
} from "@/lib/actions/events";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { generateOccurrences as generateOccurrencesUtil } from "@/lib/utils/generate-occurrences";

interface RecurringEventManagerProps {
  event: any;
  slots: any[];
  signups: any[];
  waitlist: any[];
  publicSignups?: any[];
  publicWaitlist?: any[];
}

interface EventOccurrence {
  date: Date;
  slots: Array<{
    id: string;
    name: string;
    time: string;
    filled: number;
    capacity: number;
    signups: any[];
    waitlist: any[];
    isWaitlist: boolean;
    available: number;
  }>;
}

interface OccurrenceSlot {
  id: string;
  name: string;
  time: string;
  filled: number;
  capacity: number;
  signups: any[];
  waitlist: any[];
  isWaitlist: boolean;
  available: number;
}

// Helper function to format relative time
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

// Helper function to get border color based on fill rate and date status
function getStatusBorderColor(fillRate: number, isPast: boolean, totalCapacity: number): string {
  if (isPast) return 'border-slate-300 dark:border-slate-700';
  if (totalCapacity === 0 || fillRate === 0) return 'border-slate-300 dark:border-slate-700';
  if (fillRate < 25) return 'border-blue-500 dark:border-blue-600';
  if (fillRate < 75) return 'border-emerald-500 dark:border-emerald-600';
  if (fillRate < 90) return 'border-amber-500 dark:border-amber-600';
  return 'border-red-500 dark:border-red-600';
}

export function RecurringEventManager({
  event,
  slots,
  signups,
  waitlist,
  publicSignups,
  publicWaitlist,
}: RecurringEventManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [removingSignupId, setRemovingSignupId] = useState<string | null>(null);
  const [deletingOccurrence, setDeletingOccurrence] = useState<string | null>(
    null
  );
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<any | null>(
    null
  );

  const safeSlots = Array.isArray(slots) ? slots : [];
  const safeSignups = Array.isArray(signups) ? signups : [];
  const safeWaitlist = Array.isArray(waitlist) ? waitlist : [];

  const occurrences = useMemo(() => {
    let generatedDates: Date[] = [];

    if (!event.recurrence_rule) {
      // For non-recurring events, use the event date
      generatedDates = [new Date(event.date)];
    } else {
      // For recurring events, generate occurrences from the recurrence rule
      generatedDates = generateOccurrencesUtil(
        new Date(event.date),
        event.recurrence_rule
      );
    }

    // Separate slots into those with specific dates and template slots (no occurrence_date)
    const templateSlots = safeSlots.filter((slot) => !slot?.occurrence_date);
    const specificDateSlots = safeSlots.filter((slot) => slot?.occurrence_date);

    // For each generated occurrence, collect applicable slots
    return generatedDates
      .map((date) => {
        const occurrenceDateStr = format(date, "yyyy-MM-dd");

        // Include template slots (apply to all occurrences) + slots with matching occurrence_date
        const applicableSlots = [
          ...templateSlots,
          ...specificDateSlots.filter((slot) => {
            try {
              const slotDateStr = format(
                parseISO(slot.occurrence_date!),
                "yyyy-MM-dd"
              );
              return slotDateStr === occurrenceDateStr;
            } catch (err) {
              return false;
            }
          }),
        ];

        // Filter out "Waitlist" named slots
        const regularSlots = applicableSlots.filter(
          (slot) => slot?.name && !slot.name.toLowerCase().includes("waitlist")
        );

        // Get waitlist for this occurrence
        const relevantWaitlist = safeWaitlist.filter((w: any) => {
          const slot = regularSlots.find((slot) => slot.id === w.slot_id);
          return !!slot;
        });

        const occurrenceSlotsData: OccurrenceSlot[] = [];

        regularSlots.forEach((regularSlot) => {
          // For template slots, only show signups/waitlist that match this specific occurrence date
          const slotSignups = safeSignups.filter((s: any) => {
            if (s.slot_id !== regularSlot.id) return false;

            // If the signup has an occurrence_date, check if it matches
            if (s.occurrence_date) {
              try {
                const signupDateStr = format(
                  parseISO(s.occurrence_date),
                  "yyyy-MM-dd"
                );
                return signupDateStr === occurrenceDateStr;
              } catch (err) {
                return false;
              }
            }

            // If no occurrence_date on signup, include it (backward compatibility)
            return true;
          });

          const slotWaitlist = relevantWaitlist.filter((w: any) => {
            if (w.slot_id !== regularSlot.id) return false;

            // Similar logic for waitlist entries
            if (w.occurrence_date) {
              try {
                const waitlistDateStr = format(
                  parseISO(w.occurrence_date),
                  "yyyy-MM-dd"
                );
                return waitlistDateStr === occurrenceDateStr;
              } catch (err) {
                return false;
              }
            }

            return true;
          });

          const available = regularSlot.capacity - slotSignups.length;

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
          });
        });

        return {
          date,
          slots: occurrenceSlotsData,
          filled: occurrenceSlotsData.reduce(
            (sum, slot) => sum + slot.filled,
            0
          ),
          capacity: occurrenceSlotsData.reduce(
            (sum, slot) => sum + slot.capacity,
            0
          ),
        };
      })
      .filter((occurrence) => occurrence.slots.length > 0) // Filter out occurrences with no slots
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [safeSlots, safeSignups, safeWaitlist, event.recurrence_rule, event.date]);

  const filteredOccurrences = occurrences;

  // Calculate insights for upcoming occurrences only
  const now = new Date();
  const upcomingOccurrences = occurrences.filter(occ => occ.date >= now);
  const thisWeekOccurrences = upcomingOccurrences.filter(
    occ => occ.date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const almostFullOccurrences = upcomingOccurrences.filter(occ => {
    const fillRate = occ.capacity > 0 ? (occ.filled / occ.capacity) * 100 : 0;
    return fillRate >= 80 && fillRate < 100;
  });
  const fullOccurrences = upcomingOccurrences.filter(occ => occ.filled >= occ.capacity && occ.capacity > 0);
  
  // Get recent signups (last 5) sorted by date
  const recentSignups = [...safeSignups]
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 5);

  if (!event) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">Error: Event data is missing</p>
      </div>
    );
  }

  const toggleDate = (dateStr: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateStr)) {
      newExpanded.delete(dateStr);
    } else {
      newExpanded.add(dateStr);
    }
    setExpandedDates(newExpanded);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/signup/${event.slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Signup link copied to clipboard.",
    });
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate event");
      }

      const data = await response.json();
      toast({
        title: "Event duplicated",
        description: "Your event has been duplicated successfully.",
      });
      router.push(`/dashboard/events/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to duplicate event",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    try {
      const csvHeaders = [
        "Name",
        "Email",
        "Category",
        "Status",
        "Signed Up At",
      ];
      const csvRows = signups.map((signup) => {
        const slot = slots.find((s) => s.id === (signup as any).slot_id);
        return [
          signup.name,
          signup.email,
          slot?.name || "Unknown",
          signup.status,
          new Date(signup.createdAt).toLocaleString(),
        ]
          .map((field) => `"${field}"`)
          .join(",");
      });

      const csv = [csvHeaders.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-signups.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exported",
        description: "Your signup data has been exported.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entire recurring event? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAllOccurrences = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all occurrences of this event? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      toast({
        title: "All occurrences deleted",
        description: "All occurrences have been deleted successfully.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete all occurrences",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemoveSignup = async (signupId: string, occurrenceDate: Date) => {
    if (
      !confirm(
        "Are you sure you want to remove this participant from this occurrence?"
      )
    ) {
      return;
    }

    setRemovingSignupId(signupId);
    try {
      await removeSignup(signupId, event.id);
      toast({
        title: "Participant removed",
        description: "The participant has been removed from the occurrence.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove participant",
        variant: "destructive",
      });
    } finally {
      setRemovingSignupId(null);
    }
  };

  const handleDeleteOccurrence = async (occurrenceDate: Date) => {
    if (
      !confirm(
        "Are you sure you want to delete this occurrence? This will remove all signups for this date."
      )
    ) {
      return;
    }

    const dateStr = format(occurrenceDate, "yyyy-MM-dd");
    setDeletingOccurrence(dateStr);
    try {
      await deleteOccurrence(event.id, dateStr);
      toast({
        title: "Occurrence deleted",
        description: "This occurrence and all its signups have been deleted.",
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete occurrence",
        variant: "destructive",
      });
    } finally {
      setDeletingOccurrence(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Items & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Action Items */}
        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Action Items</h3>
                <p className="text-xs text-muted-foreground">Dates needing attention</p>
              </div>
            </div>
            <div className="space-y-3">
              {thisWeekOccurrences.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">This Week</p>
                      <p className="text-xs text-muted-foreground">{thisWeekOccurrences.length} {thisWeekOccurrences.length === 1 ? 'occurrence' : 'occurrences'} coming up</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">{thisWeekOccurrences.length}</span>
                </div>
              )}
              {almostFullOccurrences.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Almost Full</p>
                      <p className="text-xs text-muted-foreground">{almostFullOccurrences.length} {almostFullOccurrences.length === 1 ? 'date is' : 'dates are'} 80%+ full</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{almostFullOccurrences.length}</span>
                </div>
              )}
              {fullOccurrences.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Fully Booked</p>
                      <p className="text-xs text-muted-foreground">{fullOccurrences.length} {fullOccurrences.length === 1 ? 'date has' : 'dates have'} no spots left</p>
                    </div>
                  </div>
                  <span className="text-lg font-black text-red-600 dark:text-red-400">{fullOccurrences.length}</span>
                </div>
              )}
              {thisWeekOccurrences.length === 0 && almostFullOccurrences.length === 0 && fullOccurrences.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">All clear!</p>
                  <p className="text-xs text-muted-foreground mt-1">No urgent action items</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
                <p className="text-xs text-muted-foreground">Latest signups</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentSignups.length > 0 ? (
                recentSignups.map((signup, idx) => {
                  const slot = safeSlots.find(s => s.id === signup.slot_id);
                  const createdAt = signup.created_at || signup.createdAt;
                  const timeAgo = createdAt ? formatTimeAgo(new Date(createdAt)) : 'Recently';
                  return (
                    <div key={signup.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{signup.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{signup.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{slot?.name || 'Unknown slot'}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">No signups yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Waiting for first registration</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Quick Actions</p>
                <p className="text-xs text-muted-foreground">Manage your event efficiently</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="rounded-lg h-9 text-xs border-slate-200 dark:border-white/10"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
                className="rounded-lg h-9 text-xs border-slate-200 dark:border-white/10"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Event
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="rounded-lg h-9 text-xs border-slate-200 dark:border-white/10"
              >
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-9 w-9 p-0 border-slate-200 dark:border-white/10"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDuplicate}>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate Event
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDeleteAllOccurrences}
                    className="text-destructive"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete All Occurrences
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Occurrences Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground">Event Occurrences</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage individual dates and track signups</p>
        </div>
      </div>

      {filteredOccurrences.length === 0 ? (
        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No occurrences found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOccurrences.map((occurrence) => {
            const dateStr = format(occurrence.date, "yyyy-MM-dd");
            const isExpanded = expandedDates.has(dateStr);
            const totalFilled = occurrence.slots.reduce(
              (sum, slot) => sum + slot.filled,
              0
            );
            const totalCapacity = occurrence.slots.reduce(
              (sum, slot) => sum + slot.capacity,
              0
            );
            const fillRate = totalCapacity > 0 ? (totalFilled / totalCapacity) * 100 : 0;
            const isPast = occurrence.date < new Date();
            const borderColor = getStatusBorderColor(fillRate, isPast, totalCapacity);
            
            // Get unique signups for this occurrence (across all slots)
            const occurrenceSignups = occurrence.slots.flatMap(slot => slot.signups || []);
            const uniqueSignups = Array.from(new Map(occurrenceSignups.map(s => [s.id, s])).values());

            return (
              <Card
                key={dateStr}
                className={`border-2 ${borderColor} ${isPast ? 'opacity-70' : ''} bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all group`}
              >
                <CardHeader
                  className="cursor-pointer p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => toggleDate(dateStr)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-200 leading-none">
                            {format(occurrence.date, "MMM")}
                          </div>
                          <div className="text-lg sm:text-xl font-black text-purple-900 dark:text-purple-100 leading-none mt-0.5">
                            {format(occurrence.date, "d")}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                            {format(occurrence.date, "EEEE")}
                          </h3>
                          {occurrence.date < new Date() && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Past
                            </span>
                          )}
                          {occurrence.date >= new Date() && occurrence.date < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              This Week
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {format(occurrence.date, "MMM d, yyyy")} • {occurrence.slots.filter(s => !s.isWaitlist).length} {occurrence.slots.filter(s => !s.isWaitlist).length === 1 ? 'slot' : 'slots'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {/* Avatar Stack Preview */}
                      {uniqueSignups.length > 0 && (
                        <div className="hidden lg:flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {uniqueSignups.slice(0, 3).map((signup, idx) => (
                              <div
                                key={signup.id || idx}
                                className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"
                                title={signup.name}
                              >
                                <span className="text-xs font-bold text-white">
                                  {signup.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ))}
                            {uniqueSignups.length > 3 && (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                  +{uniqueSignups.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="hidden md:flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">
                            {totalFilled}<span className="text-muted-foreground font-normal">/{totalCapacity}</span>
                          </span>
                        </div>
                        {totalCapacity > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <div className="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                                style={{ width: `${fillRate}%` }}
                              />
                            </div>
                            <span className="font-semibold">{Math.round(fillRate)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="md:hidden px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10">
                        <span className="text-xs font-semibold">
                          {totalFilled}/{totalCapacity}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOccurrence(occurrence.date);
                        }}
                        disabled={deletingOccurrence === dateStr}
                        className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-colors"
                        title="Delete occurrence"
                      >
                        {deletingOccurrence === dateStr ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </Button>
                      <div className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-4 sm:p-5 space-y-4 border-t border-slate-200 dark:border-white/10">
                    {/* Empty State with CTA */}
                    {totalFilled === 0 && !isPast && (
                      <div className="text-center py-8 px-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-2">No signups yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Share your event link to get registrations</p>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const url = `${window.location.origin}/signup/${event.slug || event.id}`;
                            navigator.clipboard.writeText(url);
                            toast({
                              title: "Link copied",
                              description: "Share this link to get signups.",
                            });
                          }}
                          className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          Copy & Share Link
                        </Button>
                      </div>
                    )}
                    
                    {/* Per-Date Stats */}
                    {totalFilled > 0 && (
                      <div className="grid grid-cols-3 gap-3 pb-4 border-b border-slate-200 dark:border-white/10">
                        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                          <div className="text-xl sm:text-2xl font-black text-foreground">{totalFilled}</div>
                          <div className="text-xs text-muted-foreground mt-1">Signups</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                          <div className="text-xl sm:text-2xl font-black text-foreground">{totalCapacity - totalFilled}</div>
                          <div className="text-xs text-muted-foreground mt-1">Available</div>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                          <div className="text-xl sm:text-2xl font-black text-foreground">{occurrence.slots.filter(s => s.waitlist?.length > 0).reduce((sum, s) => sum + (s.waitlist?.length || 0), 0)}</div>
                          <div className="text-xs text-muted-foreground mt-1">Waitlist</div>
                        </div>
                      </div>
                    )}

                    {occurrence.slots.filter((slot) => !slot.isWaitlist)
                      .length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No slots for this date
                      </p>
                    ) : (
                      occurrence.slots
                        .filter((slot) => !slot.isWaitlist)
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-sm sm:text-base text-foreground truncate">
                                    {slot.name}
                                  </h4>
                                  {slot.waitlist && slot.waitlist.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                      {slot.waitlist.length} waiting
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-full max-w-[120px] h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all"
                                        style={{
                                          width: `${(slot.filled / slot.capacity) * 100}%`,
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                                      {slot.filled}/{slot.capacity}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-lg text-xs sm:text-sm h-9 px-3 shrink-0 border-slate-200 dark:border-white/10"
                                    onClick={() => {
                                      setSelectedSlot(slot);
                                      setSelectedOccurrence(occurrence);
                                    }}
                                  >
                                    <Users className="mr-1.5 h-4 w-4" />
                                    <span className="hidden sm:inline">View </span>
                                    ({slot.filled + (slot.waitlist?.length || 0)})
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[550px]">
                                  <DialogHeader className="border-b border-slate-200 dark:border-white/10 pb-4">
                                    <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center flex-shrink-0">
                                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                      </div>
                                      <span className="truncate">{slot.name}</span>
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground pl-10">
                                      {format(occurrence.date, "EEEE, MMMM d, yyyy")}
                                    </p>
                                  </DialogHeader>
                                  <div className="space-y-6 pt-2">
                                    {slot.signups &&
                                      slot.signups.length > 0 && (
                                        <div>
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                              Confirmed
                                            </h4>
                                            <span className="text-xs font-semibold text-muted-foreground bg-slate-100 dark:bg-white/10 px-2 py-1 rounded-full">
                                              {slot.signups.length}
                                            </span>
                                          </div>
                                          <div className="space-y-2">
                                            {slot.signups.map((signup: any) => (
                                              <div
                                                key={signup.id}
                                                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 hover:shadow-sm transition-all group"
                                              >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-sm font-bold text-white flex-shrink-0">
                                                    {signup.name?.[0]?.toUpperCase() ||
                                                      "?"}
                                                  </div>
                                                  <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold truncate">
                                                      {signup.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                      {signup.email}
                                                    </p>
                                                  </div>
                                                </div>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleRemoveSignup(
                                                      signup.id,
                                                      occurrence.date
                                                    )
                                                  }
                                                  disabled={removingSignupId === signup.id}
                                                  className="h-8 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                                                >
                                                  {removingSignupId === signup.id ? (
                                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                  ) : (
                                                    <span className="text-xs font-medium">Remove</span>
                                                  )}
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                    {slot.waitlist &&
                                      slot.waitlist.length > 0 && (
                                        <div>
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                                              Waitlist
                                            </h4>
                                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                              {slot.waitlist.length}
                                            </span>
                                          </div>
                                          <div className="space-y-2">
                                            {slot.waitlist.map(
                                              (
                                                waitlistSignup: any,
                                                index: number
                                              ) => (
                                                <div
                                                  key={waitlistSignup.id}
                                                  className="flex items-center justify-between rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-3 hover:shadow-sm transition-all group"
                                                >
                                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white flex-shrink-0">
                                                      #{index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                      <p className="text-sm font-semibold truncate">
                                                        {waitlistSignup.name}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground truncate">
                                                        {waitlistSignup.email}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                      handleRemoveSignup(
                                                        waitlistSignup.id,
                                                        occurrence.date
                                                      )
                                                    }
                                                    disabled={removingSignupId === waitlistSignup.id}
                                                    className="h-8 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                                                  >
                                                    {removingSignupId === waitlistSignup.id ? (
                                                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                      </svg>
                                                    ) : (
                                                      <span className="text-xs font-medium">Remove</span>
                                                    )}
                                                  </Button>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {(!slot.signups ||
                                      slot.signups.length === 0) &&
                                      (!slot.waitlist ||
                                        slot.waitlist.length === 0) && (
                                        <div className="text-center py-12">
                                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-3">
                                            <Users className="w-6 h-6 text-muted-foreground" />
                                          </div>
                                          <p className="text-sm font-medium text-muted-foreground">
                                            No participants yet
                                          </p>
                                        </div>
                                      )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        ))
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
