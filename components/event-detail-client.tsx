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
      {/* Share Section */}
      <Card className="rounded-2xl shadow-sm border-purple-200/50 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/30 to-blue-50/30 dark:from-purple-950/10 dark:to-blue-950/10">
        <CardContent className="py-6 px-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-2">
                Signup Link
              </p>
              <p className="text-sm text-muted-foreground truncate font-mono">
                {signupUrl}
              </p>
            </div>
            <Button
              onClick={handleCopyLink}
              className="rounded-xl h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Total Signups
            </p>
            <p className="text-4xl font-bold text-foreground">
              {signups.length}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-0">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Available Slots
            </p>
            <p className="text-4xl font-bold text-foreground">
              {slots.reduce((acc, s) => acc + s.available, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-0">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              On Waitlist
            </p>
            <p className="text-4xl font-bold text-foreground">
              {waitlist.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Menu */}
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-xl h-10 px-4 border-purple-200 hover:border-purple-400 dark:border-purple-900 dark:hover:border-purple-700"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
              className="cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-3" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDuplicate}
              className="cursor-pointer"
            >
              <Copy className="w-4 h-4 mr-3" />
              <span>Duplicate</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportCSV}
              className="cursor-pointer"
            >
              <Download className="w-4 h-4 mr-3" />
              <span>Export CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleCloseEvent}
              disabled={isClosing || event.status === "closed"}
              className="cursor-pointer"
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
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-3" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="slots" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border rounded-none p-0 gap-6 w-full justify-start">
          <TabsTrigger
            value="slots"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-0 py-3"
          >
            Slots
          </TabsTrigger>
          <TabsTrigger
            value="signups"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-0 py-3"
          >
            Signups
          </TabsTrigger>
          <TabsTrigger
            value="waitlist"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent px-0 py-3"
          >
            Waitlist
            {waitlist.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-purple-600 rounded-full">
                {waitlist.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          {slots.length === 0 ? (
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No slots created yet</p>
              </CardContent>
            </Card>
          ) : (
            slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
          )}
        </TabsContent>

        <TabsContent value="signups">
          {signups.length === 0 ? (
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No signups yet</p>
              </CardContent>
            </Card>
          ) : (
            <SignupList signups={signups} slots={slots} eventId={event.id} />
          )}
        </TabsContent>

        <TabsContent value="waitlist">
          {waitlist.length === 0 ? (
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No one on the waitlist</p>
              </CardContent>
            </Card>
          ) : (
            <WaitlistView waitlist={waitlist} slots={slots} />
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
