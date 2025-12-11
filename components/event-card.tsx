"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Repeat,
  ExternalLink,
  Copy,
  Users,
  Trash2,
} from "lucide-react";
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { deleteEvent } from "@/lib/actions/events";
import { formatRecurrenceDetails } from "@/lib/utils/recurrence";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [isCopying, setIsCopying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const statusColors = {
    draft: "bg-gray-500",
    open: "bg-green-500",
    closed: "bg-red-500",
    full: "bg-yellow-500",
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!event.slug) {
      toast({
        title: "Error",
        description: "Event link not available",
        variant: "destructive",
      });
      return;
    }

    setIsCopying(true);
    try {
      const url = `${window.location.origin}/signup/${event.slug}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "✓ Link copied!",
        description: "Share this link with attendees",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  const handleExternalLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (event.slug) {
      window.open(`/signup/${event.slug}`, "_blank");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteEvent(event.id);
      toast({
        title: "Event deleted",
        description: "Your event has been permanently deleted",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Get the next upcoming date that has slots for this event
  const getUpcomingDate = () => {
    const eventDate = new Date(event.date);
    const now = new Date();

    console.log("[EventCard] getUpcomingDate called:", {
      eventTitle: event.title,
      eventDate: event.date,
      hasRecurrenceRule: !!(event.recurrence_rule || event.recurrenceRule),
      slotCount: event.slots?.length || 0,
      slots:
        event.slots?.map((s) => ({
          id: s.id,
          occurrence_date: s.occurrence_date,
        })) || [],
    });

    // If not recurring, just use the event date
    if (!event.recurrence_rule && !event.recurrenceRule) {
      return eventDate > now ? eventDate : now;
    }

    // For recurring events, find the next date that actually has slots
    if (event.slots && event.slots.length > 0) {
      const upcomingSlots = event.slots
        .filter((slot) => slot.occurrence_date)
        .sort(
          (a, b) =>
            new Date(a.occurrence_date!).getTime() -
            new Date(b.occurrence_date!).getTime()
        )
        .filter((slot) => new Date(slot.occurrence_date!) > now);

      console.log("[EventCard] upcomingSlots after filtering:", {
        eventTitle: event.title,
        upcomingSlotsCount: upcomingSlots.length,
        upcomingSlots: upcomingSlots.map((s) => s.occurrence_date),
      });

      if (upcomingSlots.length > 0) {
        const nextDate = new Date(upcomingSlots[0].occurrence_date!);
        return nextDate;
      }
    }

    // Fallback to event date

    return eventDate > now ? eventDate : now;
  };

  const upcomingDate = getUpcomingDate();
  const upcomingDateString = upcomingDate.toISOString().split("T")[0];

  // Calculate confirmed signups and waitlisted for the upcoming occurrence
  const { confirmed: totalSignups, waitlisted: totalWaitlisted } = (
    event.slots || []
  ).reduce(
    (acc, slot) => {
      // For recurring events, only count for the upcoming occurrence
      if (event.recurrence_rule || event.recurrenceRule) {
        const slotDate = slot.occurrence_date
          ? new Date(slot.occurrence_date).toISOString().split("T")[0]
          : null;
        if (slotDate === upcomingDateString) {
          const confirmedCount =
            event.signups?.filter(
              (s) => s.slot_id === slot.id && s.status === "confirmed"
            ).length || 0;
          const waitlistedCount =
            event.signups?.filter(
              (s) => s.slot_id === slot.id && s.status === "waitlisted"
            ).length || 0;
          return {
            confirmed: acc.confirmed + confirmedCount,
            waitlisted: acc.waitlisted + waitlistedCount,
          };
        }
        return acc;
      }
      // For non-recurring events, count all signups
      const confirmedCount =
        event.signups?.filter(
          (s) => s.slot_id === slot.id && s.status === "confirmed"
        ).length || 0;
      const waitlistedCount =
        event.signups?.filter(
          (s) => s.slot_id === slot.id && s.status === "waitlisted"
        ).length || 0;
      return {
        confirmed: acc.confirmed + confirmedCount,
        waitlisted: acc.waitlisted + waitlistedCount,
      };
    },
    { confirmed: 0, waitlisted: 0 }
  );

  const recurrenceRule = event.recurrence_rule || event.recurrenceRule;
  const recurrenceDetails = recurrenceRule
    ? formatRecurrenceDetails(recurrenceRule)
    : null;

  return (
    <>
      <Card className="group rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl overflow-hidden hover:border-slate-300 dark:hover:border-white/20">
        <Link href={`/dashboard/events/${event.id}`} className="block h-full">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 space-y-1 min-w-0">
                <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {event.title}
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline"
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.status === 'open' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                        : event.status === 'closed'
                        ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {event.status === 'open' ? '● Active' : event.status === 'closed' ? '● Closed' : '● Draft'}
                  </Badge>
                  {recurrenceDetails && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 rounded-full">
                      {recurrenceDetails}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-3 space-y-3">
            {/* Signup Stats */}
            {totalSignups > 0 || totalWaitlisted > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {totalSignups} signed up
                    </span>
                  </div>
                  {totalWaitlisted > 0 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                      {totalWaitlisted} waitlisted
                    </span>
                  )}
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500"
                    style={{
                      width: `${Math.min(
                        (totalSignups / (totalSignups + totalWaitlisted)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>No signups yet</span>
              </div>
            )}

            {/* Date Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {format(upcomingDate, "MMM d")}
              </span>
            </div>
          </CardContent>
        </Link>

        {/* Action Buttons */}
        <CardContent className="pb-4 pt-0 space-y-3">
          <Button
            variant="default"
            className="w-full rounded-xl bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold h-9 text-sm"
            size="sm"
            asChild
          >
            <Link href={`/dashboard/events/${event.id}`}>
              Manage Event
            </Link>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              disabled={isCopying || !event.slug}
              className="flex-1 rounded-lg h-9 border-slate-300 dark:border-white/20 text-sm"
              title="Copy signup link"
            >
              <Copy className="w-4 h-4 mr-1.5" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExternalLink}
              disabled={!event.slug}
              className="flex-1 rounded-lg h-9 border-slate-300 dark:border-white/20 text-sm"
              title="Open public page"
            >
              <ExternalLink className="w-4 h-4 mr-1.5" />
              Open
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="flex-1 rounded-lg h-9 border-slate-300 dark:border-white/20 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 text-sm"
              title="Delete event"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg mx-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Delete Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Are you sure you want to delete "{event.title}"? This will
              permanently remove the event and all associated signups and
              waitlist entries. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isDeleting}
              className="w-full sm:w-auto m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto m-0"
            >
              {isDeleting ? "Deleting..." : "Delete Event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
