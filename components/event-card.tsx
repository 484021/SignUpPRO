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

  // Calculate confirmed signups and waitlisted for the upcoming occurrence only
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
              (s: any) => s.slot_id === slot.id && s.status === "confirmed"
            ).length || 0;
          const waitlistedCount =
            event.signups?.filter(
              (s: any) => s.slot_id === slot.id && s.status === "waitlisted"
            ).length || 0;
          return {
            confirmed: acc.confirmed + confirmedCount,
            waitlisted: acc.waitlisted + waitlistedCount,
          };
        }
        return acc;
      }
      // For non-recurring events, count all signups and waitlisted
      const confirmedCount =
        event.signups?.filter(
          (s: any) => s.slot_id === slot.id && s.status === "confirmed"
        ).length || 0;
      const waitlistedCount =
        event.signups?.filter(
          (s: any) => s.slot_id === slot.id && s.status === "waitlisted"
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
      <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer">
        <Link href={`/dashboard/events/${event.id}`} className="block">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1 min-w-0">
                <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {event.title}
                </CardTitle>
                {totalSignups > 0 || totalWaitlisted > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span className="whitespace-nowrap font-medium text-foreground">
                        {totalSignups} Signed Up
                      </span>
                      {totalWaitlisted > 0 && (
                        <span className="whitespace-nowrap text-amber-600 font-medium">
                          • {totalWaitlisted} Waitlisted
                        </span>
                      )}
                    </div>
                    {totalSignups > 0 && (
                      <div className="h-1.5 flex-1 max-w-[200px] bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                          style={{
                            width: `${
                              (totalSignups /
                                (totalSignups + totalWaitlisted)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">
                      No one signed up yet
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Badge
                  className={`${statusColors[event.status]} text-white text-xs`}
                  variant="secondary"
                >
                  {event.status}
                </Badge>
                {recurrenceRule && (
                  <Badge
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs whitespace-nowrap"
                    variant="secondary"
                  >
                    <Repeat className="w-3 h-3 mr-1" />
                    Recurring
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 pt-0">
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">
                  {format(upcomingDate, "PPP 'at' p")}
                </span>
              </div>
              {recurrenceDetails && (
                <div className="flex items-start gap-2">
                  <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm leading-relaxed">
                    {recurrenceDetails}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="default"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-9"
                size="sm"
                asChild
              >
                <span>Manage Event</span>
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={isCopying || !event.slug}
                  className="flex-1 sm:flex-none bg-transparent h-9"
                  title="Copy signup link"
                >
                  <Copy className="w-4 h-4" />
                  <span className="sr-only">Copy link</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExternalLink}
                  disabled={!event.slug}
                  className="flex-1 sm:flex-none bg-transparent h-9"
                  title="Open public page"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="sr-only">Open public page</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteClick}
                  className="flex-1 sm:flex-none bg-transparent hover:bg-destructive/10 hover:text-destructive hover:border-destructive h-9"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Delete event</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Link>
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
