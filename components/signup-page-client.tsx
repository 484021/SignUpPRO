"use client";

import type React from "react";
import { Clock2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

import { useState } from "react";
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
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);

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

  const handleOccurrenceSelect = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    console.log("Selected occurrence date string:", dateString);
    setSelectedOccurrenceDate(date.toISOString());
    setSelectedOccurrence({ date: date.toISOString() }); // Store selected occurrence for removal
    setIsOccurrenceModalOpen(true);
  };

  const handleModalClose = () => {
    setIsOccurrenceModalOpen(false);
    setSelectedOccurrenceDate(null);
    setSelectedOccurrence(null);
    setSelectedSlotId(null);
  };

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
    // Background gradient for the main page
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-7 h-7 md:w-8 md:h-8" />
              <span className="text-lg md:text-xl font-semibold">
                SignUpPRO
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content area with spacing and max width */}
      <main className="container mx-auto max-w-4xl p-4 py-8 space-y-6">
        <Card className="border-2 border-purple-500/20 shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                    {event.status}
                  </Badge>
                </div>
                {event.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {navigator.share && (
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share via...
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleCopyLink}>
                        <Link2 className="w-4 h-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleEmailShare}>
                        <Mail className="w-4 h-4 mr-2" />
                        Share via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSMSShare}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Share via SMS
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">
                  {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">
                  {format(new Date(event.date), "h:mm a")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
            <CardDescription>
              Choose which date you want to attend:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {occurrencesWithSlots.map((date, index) => (
                <button
                  key={index}
                  onClick={() => handleOccurrenceSelect(date)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 hover:scale-[1.02] bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {format(date, "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(date, "h:mm a")}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isOccurrenceModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {selectedOccurrenceDate &&
                  format(
                    new Date(selectedOccurrenceDate),
                    "EEEE, MMMM d, yyyy"
                  )}
              </DialogTitle>
              <DialogDescription className="text-base">
                {selectedOccurrenceDate &&
                  format(new Date(selectedOccurrenceDate), "h:mm a")}
                {/* event.location && ` • ${event.location}` */}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {selectedOccurrenceDate && (
                <>
                  {(() => {
                    const occurrenceSignups = publicSignups.filter((s) => {
                      const slot = slots.find((sl) => sl.id === s.slot_id);
                      return (
                        slot?.occurrence_date &&
                        new Date(slot.occurrence_date)
                          .toISOString()
                          .split("T")[0] ===
                          new Date(selectedOccurrenceDate)
                            .toISOString()
                            .split("T")[0]
                      );
                    });

                    if (occurrenceSignups.length > 0) {
                      return (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Who's Attending ({occurrenceSignups.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2 max-h-48 overflow-y-auto">
                              {occurrenceSignups.map((signup) => {
                                const slot = slots.find(
                                  (s) => s.id === signup.slot_id
                                );
                                return (
                                  <div
                                    key={signup.id}
                                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 font-semibold text-sm">
                                      {signup.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">
                                        {signup.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {slot?.name || "General Admission"}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleSignupRemoveClick(signup.id)
                                      }
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })()}

                  {(() => {
                    const occurrenceWaitlist = publicWaitlist.filter((w) => {
                      const slot = slots.find((sl) => sl.id === w.slot_id);
                      return (
                        slot?.occurrence_date &&
                        new Date(slot.occurrence_date)
                          .toISOString()
                          .split("T")[0] ===
                          new Date(selectedOccurrenceDate)
                            .toISOString()
                            .split("T")[0]
                      );
                    });

                    if (occurrenceWaitlist.length > 0) {
                      return (
                        <Card className="border-orange-200 dark:border-orange-800">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                              <Clock2 className="w-5 h-5" />
                              Waiting for Spots ({occurrenceWaitlist.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2 max-h-48 overflow-y-auto">
                              {occurrenceWaitlist.map(
                                (waitlistEntry, index) => {
                                  const slot = slots.find(
                                    (s) => s.id === waitlistEntry.slot_id
                                  );
                                  return (
                                    <div
                                      key={waitlistEntry.id}
                                      className="flex items-center gap-3 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800"
                                    >
                                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-sm font-semibold">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">
                                          {waitlistEntry.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {slot?.name || "General Admission"}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleWaitlistDeleteClick(
                                            waitlistEntry.id,
                                            waitlistEntry.name
                                          )
                                        }
                                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:text-orange-400 dark:hover:text-orange-300 dark:hover:bg-orange-900/40"
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })()}
                </>
              )}

              {!selectedSlotId ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Select a Category</h3>
                  {(() => {
                    const filteredSlots = slots
                      .filter((slot) => {
                        if (!selectedOccurrenceDate) return true;

                        // Parse both dates and compare just the date components
                        const slotDate = slot.occurrence_date
                          ? new Date(slot.occurrence_date)
                          : null;
                        const selectedDate = new Date(selectedOccurrenceDate);

                        // If slot has no occurrence_date, it applies to all occurrences
                        if (!slotDate) return true;

                        // Compare year, month, and day
                        const slotYear = slotDate.getUTCFullYear();
                        const slotMonth = slotDate.getUTCMonth();
                        const slotDay = slotDate.getUTCDate();

                        const selectedYear = selectedDate.getUTCFullYear();
                        const selectedMonth = selectedDate.getUTCMonth();
                        const selectedDay = selectedDate.getUTCDate();

                        const matches =
                          slotYear === selectedYear &&
                          slotMonth === selectedMonth &&
                          slotDay === selectedDay;

                        console.log("Filtering slot:", {
                          slotName: slot.name,
                          slotDate: slotDate
                            ? `${slotYear}-${slotMonth + 1}-${slotDay}`
                            : "null (applies to all)",
                          selectedDate: `${selectedYear}-${selectedMonth + 1}-${selectedDay}`,
                          matches,
                        });

                        return matches;
                      })
                      .filter((slot) => {
                        const isWaitlist = slot.name
                          .toLowerCase()
                          .includes("waitlist");
                        if (isWaitlist) {
                          return false;
                        }
                        return true;
                      });

                    console.log("Filtered slots count:", filteredSlots.length);
                    console.log(
                      "Filtered slots:",
                      filteredSlots.map((s) => ({ name: s.name, id: s.id }))
                    );

                    if (filteredSlots.length === 0) {
                      return (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No slots available for this date.</p>
                        </div>
                      );
                    }

                    return filteredSlots.map((slot) => {
                      const isFull = slot.available === 0;
                      const percentFilled =
                        ((slot.capacity - slot.available) / slot.capacity) *
                        100;
                      const isWaitlist = slot.name
                        .toLowerCase()
                        .includes("waitlist");
                      const filled = slot.capacity - slot.available;

                      return (
                        <button
                          key={slot.id}
                          onClick={() => {
                            console.log("Slot clicked:", {
                              id: slot.id,
                              name: slot.name,
                              capacity: slot.capacity,
                              available: slot.available,
                              filled: slot.capacity - slot.available,
                            });
                            setSelectedSlotId(slot.id);
                          }}
                          className="w-full text-left p-6 rounded-xl border-2 transition-all hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 bg-card"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-lg">
                              {slot.name}
                            </h3>
                            {isFull ? (
                              <Badge variant="destructive">Full</Badge>
                            ) : (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                                Available
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Users className="w-4 h-4" />
                            <span>
                              {isWaitlist
                                ? `${filled} on waitlist`
                                : `${filled} / ${slot.capacity} spots filled`}
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                              style={{ width: `${percentFilled}%` }}
                            />
                          </div>

                          {isFull && (
                            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 text-sm text-orange-700 dark:text-orange-300">
                              Join the waitlist and we'll notify you if a spot
                              opens up
                            </div>
                          )}
                        </button>
                      );
                    });
                  })()}
                </div>
              ) : (
                <SignupForm
                  eventId={event.id}
                  slotId={selectedSlotId}
                  onSuccess={handleSignupSuccess}
                  onBack={() => {
                    setSelectedSlotId(null);
                    // Keep selectedOccurrenceDate if it was selected
                  }}
                  occurrenceDate={selectedOccurrenceDate}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

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
