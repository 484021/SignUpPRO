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
      <Card className="border-slate-200 dark:border-white/10 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Signup Link
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate font-mono bg-white/50 dark:bg-black/20 px-3 py-2 rounded-lg">
                {signupUrl}
              </p>
            </div>
            <Button
              onClick={handleCopyLink}
              className="rounded-xl h-11 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all whitespace-nowrap font-semibold"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:gap-5 grid-cols-3">
        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                Total Signups
              </p>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {signups.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                Available
              </p>
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
              {slots.reduce((acc, s) => acc + s.available, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm font-semibold text-muted-foreground">
                Waitlist
              </p>
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
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
              className="rounded-xl h-10 px-4 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 shadow-sm"
            >
              <MoreVertical className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Actions</span>
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
        <TabsList className="bg-slate-100/50 dark:bg-white/5 rounded-xl p-1 gap-1 w-full sm:w-auto backdrop-blur-sm border border-slate-200 dark:border-white/10">
          <TabsTrigger
            value="slots"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 px-4 py-2 font-semibold text-sm transition-all"
          >
            Slots
          </TabsTrigger>
          <TabsTrigger
            value="signups"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 px-4 py-2 font-semibold text-sm transition-all"
          >
            Signups
          </TabsTrigger>
          <TabsTrigger
            value="waitlist"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-white/10 px-4 py-2 font-semibold text-sm transition-all"
          >
            Waitlist
            {waitlist.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                {waitlist.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="slots" className="space-y-4">
          {slots.length === 0 ? (
            <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No slots created yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            slots.map((slot) => <SlotCard key={slot.id} slot={slot} />)
          )}
        </TabsContent>

        <TabsContent value="signups">
          {signups.length === 0 ? (
            <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No signups yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <SignupList signups={signups} slots={slots} eventId={event.id} />
          )}
        </TabsContent>

        <TabsContent value="waitlist">
          {waitlist.length === 0 ? (
            <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm rounded-2xl">
              <CardContent className="py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No one on the waitlist</p>
                </div>
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
