"use client";

import type React from "react";
import { Clock2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavPublic } from "@/components/nav-public";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  Share2,
  AlertCircle,
  Link2,
  Mail,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { SignupForm } from "@/components/signup-form";
import type { Event, Slot, Signup } from "@/lib/types";
import { removeSelfByEmail, removeWaitlistByEmail } from "@/lib/actions/events";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateOccurrences as generateOccurrencesUtil } from "@/lib/utils/generate-occurrences";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SignupPageClientProps {
  event: Event;
  slots: Slot[]; // Renamed from initialSlots
  publicSignups?: Signup[]; // Renamed from initialSignups
  publicWaitlist?: Array<{
    id: string;
    name: string;
    slot_id: string;
    status: string;
    created_at: string;
  }>; // Updated type
  organizerPlan?: string;
}

export function SignupPageClient({
  event,
  slots: initialSlots, // Renamed to initialSlots for internal use
  publicSignups: initialPublicSignups, // Renamed to initialPublicSignups for internal use
  publicWaitlist: initialPublicWaitlist,
  organizerPlan = "free",
}: SignupPageClientProps) {
  const slots = initialSlots || [];
  const publicSignups = initialPublicSignups || []; // Initialize publicSignups
  const publicWaitlist = initialPublicWaitlist || [];
  const confirmedSignups = useMemo(
    () => (publicSignups || []).filter((s) => s.status === "confirmed"),
    [publicSignups]
  );
  const waitlistedSignups = useMemo(
    () => (publicSignups || []).filter((s) => s.status === "waitlisted"),
    [publicSignups]
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedOccurrenceDate, setSelectedOccurrenceDate] = useState<
    string | null
  >(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    slotName: string;
  } | null>(null);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [removeEmail, setRemoveEmail] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [multipleSignups, setMultipleSignups] = useState<
    Array<{ id: string; name: string; slotName: string }>
  >([]);
  const [selectedSignupId, setSelectedSignupId] = useState<string | null>(null);
  const [removeType, setRemoveType] = useState<"signup" | "waitlist">("signup");
  const [multipleWaitlist, setMultipleWaitlist] = useState<
    Array<{ id: string; name: string; slotName: string }>
  >([]);
  const [selectedWaitlistId, setSelectedWaitlistId] = useState<string | null>(
    null
  );
  const [showWaitlistEmailDialog, setShowWaitlistEmailDialog] = useState(false);
  const [waitlistEmailToVerify, setWaitlistEmailToVerify] = useState("");
  const [waitlistIdToDelete, setWaitlistIdToDelete] = useState<string | null>(
    null
  );
  const { toast } = useToast();
  const router = useRouter();
  const [showDatesOpen, setShowDatesOpen] = useState(false);
  // occurrence modal removed — signups occur inline on the page

  // State for email verification dialog
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState<{
    id: string;
    name: string;
    type: "signup" | "waitlist";
  } | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<{
    date: string | null;
  } | null>(null); // To hold selected occurrence date for signup removal
  const [signupToRemove, setSignupToRemove] = useState<string | null>(null); // Declare signupToRemove
  const [removeSignupEmail, setRemoveSignupEmail] = useState(""); // Declare removeSignupEmail
  const [isRemoveSignupDialogOpen, setIsRemoveSignupDialogOpen] =
    useState(false); // Declare setIsRemoveSignupDialogOpen

  const handleShare = async () => {
    const url = window.location.href;
    const shareText = `Sign up for ${event.title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: url,
        });
        toast({
          title: "Shared!",
          description: "Event link shared successfully",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error);
        }
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Event link copied to clipboard",
    });
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join me for ${event.title}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this event:\n\n${event.title}\n${event.description || ""}\n\nSign up here: ${window.location.href}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(
      `Check out this event: ${event.title}\n${window.location.href}`
    );
    window.location.href = `sms:?&body=${text}`;
  };

  // Small DateRow subcomponent
  function DateRow({ date, onSelect }: { date: Date; onSelect: () => void }) {
    return (
      <button
        onClick={onSelect}
        className="w-full flex items-center justify-between rounded-lg px-4 py-4 hover:bg-muted/30 transition"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-md bg-purple-100 dark:bg-purple-900/20">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <div className="font-semibold">
              {format(date, "EEEE, MMMM d, yyyy")}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(date, "h:mm a")}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </button>
    );
  }

  const handleSignupSuccess = (data: {
    name: string;
    email: string;
    slotId: string;
    isWaitlist: boolean;
  }) => {
    const slot = slots.find((s) => s.id === data.slotId);
    setSubmittedData({
      name: data.name,
      email: data.email,
      slotName: slot?.name || "Unknown",
    });
    setIsSubmitted(true);

    router.refresh();
  };

  const handleSelfRemove = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = removeEmail.trim();
    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (
      multipleSignups.length > 0 &&
      !selectedSignupId &&
      removeType === "signup"
    ) {
      toast({
        title: "Error",
        description: "Please select which signup to remove",
        variant: "destructive",
      });
      return;
    }

    if (
      multipleWaitlist.length > 0 &&
      !selectedWaitlistId &&
      removeType === "waitlist"
    ) {
      toast({
        title: "Error",
        description: "Please select which waitlist entry to remove",
        variant: "destructive",
      });
      return;
    }

    setIsRemoving(true);
    try {
      let result;
      if (removeType === "waitlist") {
        result = await removeWaitlistByEmail(
          event.slug || "",
          trimmedEmail,
          selectedWaitlistId || undefined
        );

        if (
          !result.success &&
          (result as any).error === "multiple_waitlist" &&
          (result as any).waitlist
        ) {
          setMultipleWaitlist((result as any).waitlist);
          toast({
            title: "Multiple Waitlist Entries Found",
            description:
              "You have multiple waitlist entries. Please select which one to remove.",
          });
          setIsRemoving(false);
          return;
        }
      } else {
        result = await removeSelfByEmail(
          event.slug || "",
          trimmedEmail,
          selectedSignupId || undefined
        );

        if (
          !result.success &&
          (result as any).error === "multiple_signups" &&
          (result as any).signups
        ) {
          setMultipleSignups((result as any).signups);
          toast({
            title: "Multiple Signups Found",
            description:
              "You have multiple signups for this event. Please select which one to remove.",
          });
          setIsRemoving(false);
          return;
        }
      }

      if (!result.success) {
        throw new Error(result.error || "Failed to remove");
      }

      toast({
        title: "Success",
        description: result.message || "Removed successfully.",
      });
      setRemoveEmail("");
      setShowRemoveForm(false);
      setMultipleSignups([]);
      setMultipleWaitlist([]);
      setSelectedSignupId(null);
      setSelectedWaitlistId(null);
      router.refresh();
    } catch (error) {
      console.error("handleSelfRemove error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove. Please check your email and try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleWaitlistDeleteClick = (
    waitlistId: string,
    waitlistName: string
  ) => {
    setWaitlistIdToDelete(waitlistId);
    setWaitlistEmailToVerify("");
    setShowWaitlistEmailDialog(true);
  };

  const handleSignupRemoveClick = (signupId: string) => {
    console.log("Signup remove clicked:", signupId);
    const signup = publicSignups.find((s) => s.id === signupId);
    if (signup) {
      setSelectedToRemove({
        id: signupId,
        name: signup.name,
        type: "signup",
      });
      setShowVerifyEmail(true);
    }
  };

  const handleVerifyAndDeleteWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = waitlistEmailToVerify.trim();
    if (!trimmedEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsRemoving(true);
    try {
      const result = await removeWaitlistByEmail(
        event.slug || "",
        trimmedEmail,
        waitlistIdToDelete || undefined
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to remove waitlist entry");
      }

      toast({
        title: "Success",
        description: "You've been removed from the waitlist.",
      });
      setShowWaitlistEmailDialog(false);
      setWaitlistEmailToVerify("");
      setWaitlistIdToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("handleVerifyAndDeleteWaitlist error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove. Please check your email and try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const generateOccurrences = () => {
    if (!event.recurrence_rule) {
      // For non-recurring events, create a single occurrence with the event date
      return [new Date(event.date)];
    }
    return generateOccurrencesUtil(new Date(event.date), event.recurrence_rule);
  };

  const occurrences = generateOccurrences();

  // Filter occurrences to only include dates that have slots
  const occurrencesWithSlots = occurrences.filter((date) => {
    const dateString = date.toISOString().split("T")[0];
    return slots.some(
      (slot) => slot.occurrence_date?.split("T")[0] === dateString
    );
  });

  const isRecurring = occurrences.length > 1; // Recurring means multiple occurrences

  const filteredSlots = useMemo(() => {
    // If event is recurring, require the user to pick an occurrence date
    if (isRecurring && !selectedOccurrenceDate) return [];

    // For non-recurring events or when a date is selected, filter slots
    if (!selectedOccurrenceDate) return slots;
    const dateString = selectedOccurrenceDate.split("T")[0];
    return slots.filter(
      (s) => s.occurrence_date && s.occurrence_date.split("T")[0] === dateString
    );
  }, [slots, selectedOccurrenceDate, isRecurring]);

  const waitlistCounts = useMemo(() => {
    const map: Record<string, number> = {};
    (waitlistedSignups || []).forEach((s) => {
      if (!s || !s.slot_id) return;

      // If a date is selected, only count waitlist entries for that occurrence
      if (selectedOccurrenceDate && s.occurrence_date) {
        const occ = s.occurrence_date.split("T")[0];
        const sel = selectedOccurrenceDate.split("T")[0];
        if (occ !== sel) return;
      }

      map[s.slot_id] = (map[s.slot_id] || 0) + 1;
    });
    return map;
  }, [waitlistedSignups, selectedOccurrenceDate]);

  // Auto-select the next available occurrence so users can sign up immediately
  useEffect(() => {
    if (!selectedOccurrenceDate && occurrencesWithSlots.length > 0) {
      // pick the first upcoming occurrence that has slots
      setSelectedOccurrenceDate(occurrencesWithSlots[0].toISOString());
      setSelectedOccurrence({ date: occurrencesWithSlots[0].toISOString() });
    }
  }, [occurrencesWithSlots, selectedOccurrenceDate]);

  const handleOccurrenceSelect = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    console.log("Selected occurrence date string:", dateString);
    setSelectedOccurrenceDate(date.toISOString());
    setSelectedOccurrence({ date: date.toISOString() }); // store for possible removal flows
    setSelectedSlotId(null);
    setShowDatesOpen(false); // Close the date list after selection

    // Scroll the signup card into view so the user can choose a category and sign up
    setTimeout(() => {
      const el = document.querySelector("[data-reserve-card]");
      if (el && typeof (el as any).scrollIntoView === "function") {
        (el as any).scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 70);
  };

  // occurrence modal removed; no modal close handler needed

  const handleVerifyAndDelete = async () => {
    if (!removeEmail || !selectedToRemove) return;

    setIsRemoving(true);
    console.log("Starting removal process:", {
      type: selectedToRemove.type,
      id: selectedToRemove.id,
      name: selectedToRemove.name,
      email: removeEmail,
      eventSlug: event.slug,
      eventId: event.id,
    });

    try {
      let result;
      if (selectedToRemove.type === "waitlist") {
        console.log("Calling removeWaitlistByEmail with:", {
          eventSlug: event.slug,
          email: removeEmail,
          waitlistId: selectedToRemove.id,
        });
        result = await removeWaitlistByEmail(
          event.slug || "",
          removeEmail,
          selectedToRemove.id
        );
      } else {
        console.log("Calling removeSelfByEmail with:", {
          eventSlug: event.slug,
          email: removeEmail,
          signupId: selectedToRemove.id,
        });
        result = await removeSelfByEmail(
          event.slug || "",
          removeEmail,
          selectedToRemove.id
        );
      }

      console.log("Removal result:", result);

      if (result.success) {
        toast({
          title: "Removed Successfully",
          description:
            result.message || `Your ${selectedToRemove.type} has been removed`,
        });
        setShowVerifyEmail(false);
        setSelectedToRemove(null);
        setRemoveEmail("");
        router.refresh();
      } else {
        console.error("Removal failed:", result.error);
        toast({
          title: "Removal Failed",
          description: result.error || "Could not remove your entry",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing entry:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleConfirmSignupRemoval = async () => {
    if (!signupToRemove || !removeSignupEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email to verify removal",
        variant: "destructive",
      });
      return;
    }

    console.log("Confirming signup removal:", {
      signupId: signupToRemove,
      email: removeSignupEmail,
    });

    try {
      const result = await removeSelfByEmail(
        event.slug || "",
        removeSignupEmail.trim(),
        signupToRemove
      );

      if (result.success) {
        toast({
          title: "Removed Successfully",
          description: result.message || "Your signup has been removed",
        });
        setIsRemoveSignupDialogOpen(false);
        setSignupToRemove(null);
        setRemoveSignupEmail("");

        // Refresh the page data
        window.location.reload();
      } else {
        toast({
          title: "Removal Failed",
          description: result.message || "Could not remove your signup",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing signup:", error);
      toast({
        title: "Error",
        description: "An error occurred while removing your signup",
        variant: "destructive",
      });
    }
  };

  if (event.status === "closed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center border-2">
          <CardContent className="pt-12 pb-8 space-y-6">
            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <Badge variant="secondary" className="text-base px-4 py-1">
                Event Closed
              </Badge>
            </div>
            <p className="text-muted-foreground">
              This event is no longer accepting signups. Contact the organizer
              if you have questions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted && submittedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/25">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">You're all set!</CardTitle>
            <CardDescription className="text-base">
              Confirmation sent to{" "}
              <span className="font-semibold text-foreground">
                {submittedData.email}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl space-y-3 border-2 border-purple-500/20">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Event</span>
                <span className="font-semibold text-right">{event.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold">{submittedData.slotName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Name</span>
                <span className="font-semibold">{submittedData.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-semibold">
                  {format(new Date(event.date), "PPP 'at' p")}
                </span>
              </div>
            </div>

            <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-900 dark:text-blue-100">
                Check your email for a link to edit or cancel your signup
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => {
                  setIsSubmitted(false);
                  setSelectedSlotId(null);

                  // Scroll to attendee list section
                  setTimeout(() => {
                    const attendeeSection = document.querySelector(
                      "[data-attendee-list]"
                    );
                    if (attendeeSection) {
                      attendeeSection.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }, 100);
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                View Attendee List
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/20 bg-transparent"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Organize Your Own Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
      <NavPublic />

      {/* Hero Card */}
      <div className="container mx-auto max-w-6xl p-4 pt-24 md:pt-32">
        <div className="bg-white/60 dark:bg-[#0b1220]/40 rounded-2xl p-6 shadow-sm border border-transparent">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                {event.title}
              </h1>
              {event.description && (
                <p className="mt-3 text-base text-muted-foreground max-w-2xl leading-relaxed">
                  {event.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  {format(
                    new Date(selectedOccurrenceDate || event.date),
                    "EEEE, MMM d"
                  )}
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40">
                  <Clock className="w-4 h-4 text-blue-600" />
                  {format(
                    new Date(selectedOccurrenceDate || event.date),
                    "h:mm a"
                  )}
                </span>
                <Badge className="py-1 px-3 rounded-md text-sm uppercase tracking-wide">
                  {event.status}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCopyLink}
                  className="rounded-xl h-10 transform active:scale-95 transition"
                >
                  {" "}
                  <Link2 className="w-4 h-4 mr-2" /> Copy Link
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  className="rounded-xl h-10 transform active:scale-95 transition"
                >
                  {" "}
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
              <Link
                href={`/signup/${event.slug}/manage`}
                className="text-sm text-muted-foreground"
              >
                Organizer tools
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <main className="container mx-auto max-w-6xl p-4 pb-32">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left: Dates */}
          <section className="space-y-6">
            <div className="rounded-2xl bg-white/60 dark:bg-[#061223]/30 p-6 shadow-sm border border-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Date</h2>
                  <p className="text-sm text-muted-foreground">Selected date</p>
                </div>
                {occurrencesWithSlots.length > 1 && (
                  <button
                    onClick={() => setShowDatesOpen((v) => !v)}
                    className="text-sm text-primary hover:underline"
                  >
                    {showDatesOpen ? "Hide dates ×" : "Change date ›"}
                  </button>
                )}
              </div>

              <div className="mt-4">
                <div className="rounded-lg p-4 bg-white dark:bg-transparent shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {format(
                          new Date(selectedOccurrenceDate || event.date),
                          "EEEE, MMMM d, yyyy"
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(selectedOccurrenceDate || event.date),
                          "h:mm a"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible dates list */}
              <div
                className={`mt-4 overflow-hidden transition-all ${showDatesOpen ? "max-h-96 overflow-y-auto" : "max-h-0"}`}
              >
                <div className="space-y-2 pr-2">
                  {occurrencesWithSlots.map((date, idx) => (
                    <DateRow
                      key={idx}
                      date={date}
                      onSelect={() => handleOccurrenceSelect(date)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Right: Signup & stats */}
          <aside className="space-y-6">
            <div
              className="rounded-2xl bg-white/60 dark:bg-[#061223]/30 p-6 shadow-sm border border-transparent"
              data-reserve-card
            >
              <h3 className="text-lg font-semibold">Reserve Your Spot</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fast, secure sign up — no account required
              </p>

              <div className="mt-4">
                {selectedSlotId ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Selected
                          </div>
                          <div className="font-semibold">
                            {(() => {
                              const s = slots.find(
                                (x) => x.id === selectedSlotId
                              );
                              return s?.name || "Category";
                            })()}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          {(() => {
                            const s = slots.find(
                              (x) => x.id === selectedSlotId
                            );
                            if (!s) return null;
                            const wlCount = waitlistCounts[s.id] || 0;

                            if (
                              typeof s.available === "number" &&
                              s.available > 0
                            ) {
                              return (
                                <>
                                  <div className="font-semibold">{`${s.capacity - s.available} / ${s.capacity}`}</div>
                                  <div className="text-xs text-muted-foreground">
                                    spots filled
                                  </div>
                                </>
                              );
                            }

                            return (
                              <div>
                                {wlCount > 0 ? (
                                  <div className="text-sm font-semibold">
                                    {wlCount} on waitlist
                                  </div>
                                ) : (
                                  <div className="text-sm font-semibold">
                                    Join waitlist
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <SignupForm
                      eventId={event.id}
                      slotId={selectedSlotId}
                      onSuccess={handleSignupSuccess}
                      onBack={() => setSelectedSlotId(null)}
                      occurrenceDate={selectedOccurrenceDate}
                    />
                  </div>
                ) : filteredSlots.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    Choose a date on the left to see available spots.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const regularSlots = filteredSlots.filter(
                        (s) =>
                          !(
                            (s.name || "").toLowerCase().includes("waitlist") ||
                            (s as any).is_waitlist
                          )
                      );
                      return (
                        <>
                          {regularSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className="w-full text-left p-4 rounded-xl hover:bg-muted/30 transition"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">
                                    {slot.name}
                                  </div>
                                  {slot.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {slot.description}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  {typeof slot.available === "number" &&
                                  slot.available > 0 ? (
                                    <div className="text-sm font-semibold">
                                      {slot.available} available
                                    </div>
                                  ) : (
                                    <div className="text-sm font-semibold text-amber-600">
                                      Join waitlist
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Summary card */}
            <div className="rounded-xl p-4 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-100 dark:border-purple-900/30">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {(() => {
                      const waitlistSlots = filteredSlots.filter(
                        (s) =>
                          (s.name || "").toLowerCase().includes("waitlist") ||
                          (s as any).is_waitlist
                      );
                      const filteredSlotIds = filteredSlots.map((s) => s.id);
                      const signupsWithSpots = confirmedSignups.filter(
                        (s) =>
                          s.slot_id &&
                          filteredSlotIds.includes(s.slot_id) &&
                          !waitlistSlots.some((ws) => ws.id === s.slot_id)
                      );
                      return signupsWithSpots.length;
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Signed Up
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {(() => {
                      const totalAvailable = filteredSlots
                        .filter(
                          (s) =>
                            !(
                              (s.name || "")
                                .toLowerCase()
                                .includes("waitlist") || (s as any).is_waitlist
                            )
                        )
                        .reduce((acc, s) => acc + s.available, 0);
                      return totalAvailable;
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Spots Left
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Attendees & Waitlist Section */}
        <div className="mt-12 space-y-8" data-attendee-list>
          {/* Attendees by Category */}
          {filteredSlots
            .filter(
              (slot) =>
                !(
                  (slot.name || "").toLowerCase().includes("waitlist") ||
                  (slot as any).is_waitlist
                )
            )
            .map((slot) => {
              const slotSignups = confirmedSignups.filter(
                (s) => s.slot_id === slot.id
              );
              if (slotSignups.length === 0) return null;

              return (
                <div
                  key={slot.id}
                  className="rounded-2xl bg-white/60 dark:bg-[#061223]/30 p-6 shadow-sm border border-transparent"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{slot.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {slotSignups.length} / {slot.capacity} attendees
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {slot.capacity - slot.available} attending
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slotSignups.map((signup, idx) => (
                      <div
                        key={signup.id || idx}
                        className="p-3 rounded-lg bg-muted/30 flex items-center gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {signup.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {signup.name || "Anonymous"}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleSignupRemoveClick(signup.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Waitlist Section */}
          {(() => {
            const waitlistEntries = (waitlistedSignups || []).filter((s) => {
              if (!s.slot_id) return false;
              const slotMatches = filteredSlots.some(
                (slot) => slot.id === s.slot_id
              );
              if (!slotMatches) return false;

              if (selectedOccurrenceDate && s.occurrence_date) {
                const occ = s.occurrence_date.split("T")[0];
                const sel = selectedOccurrenceDate.split("T")[0];
                if (occ !== sel) return false;
              }
              return true;
            });

            if (waitlistEntries.length === 0) return null;

            return (
              <div className="rounded-2xl bg-white/60 dark:bg-[#061223]/30 p-6 shadow-sm border border-amber-200 dark:border-amber-900/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Waitlist</h3>
                    <p className="text-sm text-muted-foreground">
                      {waitlistEntries.length} on waitlist
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800"
                  >
                    {waitlistEntries.length} waiting
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {waitlistEntries.map((signup, idx) => (
                    <div
                      key={signup.id || idx}
                      className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/30 flex items-center gap-3 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {signup.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {signup.name || "Anonymous"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleSignupRemoveClick(signup.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </main>

      {/* Sticky CTA (bottom) */}
      {!selectedSlotId &&
        filteredSlots.length > 0 &&
        (() => {
          const regularSlots = filteredSlots.filter(
            (s) =>
              !(
                (s.name || "").toLowerCase().includes("waitlist") ||
                (s as any).is_waitlist
              )
          );
          const allRegularFull = regularSlots.every(
            (s) => typeof s.available === "number" && s.available <= 0
          );
          const firstAvailable = regularSlots.find(
            (s) => typeof s.available === "number" && s.available > 0
          );
          const firstRegular = regularSlots[0];
          const isWaitlistMode = allRegularFull && !!firstRegular;

          return (
            <div className="fixed left-0 right-0 bottom-4 pointer-events-none z-50">
              <div className="container mx-auto max-w-6xl px-4">
                <div className="pointer-events-auto flex justify-center">
                  <div className="w-full md:w-1/2 bg-background/95 backdrop-blur-sm rounded-xl shadow-2xl">
                    <Button
                      size="lg"
                      className={`w-full rounded-xl transform active:scale-95 transition ${isWaitlistMode ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"}`}
                      onClick={() => {
                        // If all regular slots are full, select waitlist
                        if (isWaitlistMode && firstRegular) {
                          setSelectedSlotId(firstRegular.id);
                        } else if (firstAvailable) {
                          setSelectedSlotId(firstAvailable.id);
                        }

                        // Scroll to form
                        setTimeout(() => {
                          const el = document.querySelector(
                            "[data-reserve-card]"
                          );
                          if (el) {
                            el.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          }
                        }, 100);
                      }}
                    >
                      {isWaitlistMode ? "Join Waitlist" : "Sign Up Now"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Email verification dialog for waitlist deletion */}
      {showWaitlistEmailDialog && (
        <Dialog
          open={showWaitlistEmailDialog}
          onOpenChange={setShowWaitlistEmailDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Verify Your Email</DialogTitle>
              <DialogDescription>
                Please enter your email address to remove yourself from the
                waitlist
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleVerifyAndDeleteWaitlist}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="waitlistEmail">Email Address</Label>
                <Input
                  id="waitlistEmail"
                  type="email"
                  value={waitlistEmailToVerify}
                  onChange={(e) => setWaitlistEmailToVerify(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowWaitlistEmailDialog(false);
                    setWaitlistEmailToVerify("");
                    setWaitlistIdToDelete(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isRemoving}
                >
                  {isRemoving ? "Removing..." : "Remove from Waitlist"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for verifying email to remove signup or waitlist entry */}
      <Dialog open={showVerifyEmail} onOpenChange={setShowVerifyEmail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              Please enter your email address to confirm removal of your{" "}
              {selectedToRemove?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verify-email">Email Address</Label>
              <Input
                id="verify-email"
                type="email"
                placeholder="Enter your email"
                value={removeEmail}
                onChange={(e) => setRemoveEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleVerifyAndDelete();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowVerifyEmail(false);
                setSelectedToRemove(null);
                setRemoveEmail("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVerifyAndDelete}
              disabled={!removeEmail.trim() || isRemoving}
            >
              {isRemoving
                ? "Removing..."
                : `Remove ${selectedToRemove?.type === "signup" ? "Signup" : "Waitlist Entry"}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
