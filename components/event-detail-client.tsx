"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Copy,
  Download,
  Users,
  Trash2,
  Edit,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SlotCard } from "@/components/slot-card";
import { SignupList } from "@/components/signup-list";
import { WaitlistView } from "@/components/waitlist-view";
import type { Event, Slot, Signup, Waitlist } from "@/lib/types";
import { closeEvent, deleteEvent } from "@/lib/actions/events";

interface EventDetailClientProps {
  event: Event;
  slots: Slot[];
  signups: Signup[];
  waitlist: Waitlist[];
  showCopyButton?: boolean; // Added prop to conditionally show just the copy button
}

export function EventDetailClient({
  event,
  slots,
  signups,
  waitlist,
  showCopyButton,
}: EventDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [signupUrl, setSignupUrl] = useState("");

  useEffect(() => {
    // Build the full URL using window.location.origin (same as View Public Page button)
    setSignupUrl(`${window.location.origin}/signup/${event.slug}`);
  }, [event.slug]);

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
      console.error("Duplicate error:", error);
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
      console.error("CSV export error:", error);
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "destructive",
      });
    }
  };

  const handleCloseEvent = async () => {
    if (event.status === "closed") return;

    setIsClosing(true);
    try {
      await closeEvent(event.id);
      toast({
        title: "Event closed",
        description: "The event has been closed to new signups.",
      });
      router.refresh();
    } catch (error) {
      console.error("Close event error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to close event",
        variant: "destructive",
      });
    } finally {
      setIsClosing(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
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
      console.error("Delete event error:", error);
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

  if (showCopyButton) {
    return (
      <Button variant="secondary" size="sm" onClick={handleCopyLink}>
        <Copy className="w-4 h-4 mr-2" />
        Copy Link
      </Button>
    );
  }

  return (
    <>
      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">Share this event</p>
            <p className="text-xs text-muted-foreground truncate">
              {signupUrl}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      {event.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{event.description}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{signups.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Slots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {slots.reduce((acc, s) => acc + s.available, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlist.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="bg-transparent">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Signup Link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCloseEvent}
              disabled={isClosing || event.status === "closed"}
            >
              {event.status === "closed"
                ? "Event Closed"
                : isClosing
                  ? "Closing..."
                  : "Close Event"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteEvent}
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Event"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="slots" className="space-y-4">
        <TabsList>
          <TabsTrigger value="slots">Slots</TabsTrigger>
          <TabsTrigger value="signups">Signups</TabsTrigger>
          <TabsTrigger value="waitlist">
            Waitlist ({waitlist.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          {slots.map((slot) => (
            <SlotCard key={slot.id} slot={slot} />
          ))}
        </TabsContent>

        <TabsContent value="signups">
          <SignupList signups={signups} slots={slots} eventId={event.id} />
        </TabsContent>

        <TabsContent value="waitlist">
          <WaitlistView waitlist={waitlist} slots={slots} />
        </TabsContent>
      </Tabs>
    </>
  );
}
