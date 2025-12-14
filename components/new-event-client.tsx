"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { RecurrenceRule } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
// Popover calendar removed for drop-down date selection
// Date calendar replaced with scrollable Day/Month/Year selects
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  convertTo12h,
  getDaysInMonth,
  convertTo24h,
} from "@/lib/utils/time-formatting";
import { motion } from "framer-motion";

interface SlotInput {
  name: string;
  capacity: string; // keep raw string to avoid leading zero issues
}

export function NewEventClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [is24h, setIs24h] = useState(false); // Default to 12h AM/PM
  const resolvedTimeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const [timezone, setTimezone] = useState(resolvedTimeZone);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(
    null
  );
  const [slots, setSlots] = useState<SlotInput[]>([
    { name: "General Admission", capacity: "50" },
  ]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Day/Month/Year dropdown model
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear + i));

  const initialParts = (() => {
    const today = new Date();
    const defaultDate = date ? parseISO(date) : today;
    return {
      y: String(defaultDate.getFullYear()),
      m: String(defaultDate.getMonth() + 1).padStart(2, "0"),
      d: String(defaultDate.getDate()).padStart(2, "0"),
    };
  })();

  const [dateYear, setDateYear] = useState<string>(initialParts.y);
  const [dateMonth, setDateMonth] = useState<string>(initialParts.m);
  const [dateDay, setDateDay] = useState<string>(initialParts.d);

  useEffect(() => {
    if (dateYear && dateMonth && dateDay) {
      setDate(`${dateYear}-${dateMonth}-${dateDay}`);
    } else {
      setDate("");
    }
  }, [dateYear, dateMonth, dateDay]);

  const commonTimezones = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Singapore",
    "Asia/Kolkata",
    "Australia/Sydney",
  ];

  const timezones = Array.from(new Set([resolvedTimeZone, ...commonTimezones]));

  const addSlot = () => {
    setSlots([...slots, { name: "", capacity: "10" }]);
  };

  const removeSlot = (index: number) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    }
  };

  const updateSlot = (
    index: number,
    field: "name" | "capacity",
    value: string | number
  ) => {
    setSlots(
      slots.map((s, i) =>
        i === index
          ? {
              ...s,
              [field]: value,
            }
          : s
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      });
      return;
    }

    const normalizedTime = normalizeToHHMM(time);
    const normalizedEndTime = endTime ? normalizeToHHMM(endTime) : "";

    if (!date || !normalizedTime) {
      logValidationState("handleSubmit_missing_date_or_time", {
        date,
        time,
        timezone,
      });
      toast({
        title: "Error",
        description: "Event date and time are required",
        variant: "destructive",
      });
      return;
    }

    if (normalizedTime !== time) {
      setTime(normalizedTime);
    }
    if (normalizedEndTime && normalizedEndTime !== endTime) {
      setEndTime(normalizedEndTime);
    }

    const eventDateTime = safeParseDateTime(date, normalizedTime);
    logValidationState("handleSubmit_start", {
      date,
      time: normalizedTime,
      timezone,
      eventDateTime,
    });
    const now = new Date();
    if (!eventDateTime) {
      logValidationState("handleSubmit_invalid_start", {
        date,
        time,
        timezone,
      });
      toast({
        title: "Invalid date/time",
        description: "Please choose a valid start date and time",
        variant: "destructive",
      });
      return;
    }
    if (eventDateTime < now) {
      toast({
        title: "Invalid date",
        description: "Event date must be in the future",
        variant: "destructive",
      });
      return;
    }

    let eventEndDateTime: Date | null = null;
    if (endTime) {
      eventEndDateTime = safeParseDateTime(date, normalizedEndTime);
      logValidationState("handleSubmit_end", {
        date,
        endTime: normalizedEndTime,
        timezone,
        eventEndDateTime,
      });
      if (!eventEndDateTime) {
        logValidationState("handleSubmit_invalid_end", {
          date,
          endTime: normalizedEndTime,
          timezone,
        });
        toast({
          title: "Invalid end time",
          description: "Please choose a valid end time",
          variant: "destructive",
        });
        return;
      }
      if (eventEndDateTime <= eventDateTime) {
        logValidationState("handleSubmit_end_before_start", {
          start: eventDateTime,
          end: eventEndDateTime,
        });
        toast({
          title: "Invalid end time",
          description: "End time must be after the start time",
          variant: "destructive",
        });
        return;
      }
    }

    const validSlots = slots
      .map((s) => ({
        name: s.name.trim(),
        capacity: Number.parseInt(s.capacity || "", 10) || 0,
      }))
      .filter((s) => s.name && s.capacity > 0);
    if (validSlots.length === 0) {
      toast({
        title: "Error",
        description: "At least one slot with a name and capacity is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { createEvent } = await import("@/lib/actions/events");

      const finalRecurrenceRule = isRecurring
        ? {
            frequency: recurrenceRule?.frequency || "weekly",
            interval: recurrenceRule?.interval || 1,
            count: recurrenceRule?.count || 4,
          }
        : undefined;

      const eventData = {
        title,
        description,
        date: new Date(`${date}T${normalizedTime}`).toISOString(),
        end_time: eventEndDateTime ? eventEndDateTime.toISOString() : undefined,
        timezone,
        recurrenceRule: finalRecurrenceRule,
        slots: validSlots,
        showSignups: true,
      };

      console.log("Creating event with data:", eventData);
      const result = await createEvent(eventData);
      console.log("Create event result:", result);

      if (!result.success) {
        // Check if upgrade is required
        if (result.error === "UPGRADE_REQUIRED" || result.upgradeRequired) {
          toast({
            title: "Upgrade Required",
            description:
              result.message || "Free plan limited to 1 active event.",
            variant: "destructive",
          });
          router.push("/upgrade");
          return;
        }
        throw new Error(result.error || "Failed to create event");
      }

      const event = result.event;

      if (!event || !event.id) {
        throw new Error("Event was created but no ID was returned");
      }

      console.log("Event created successfully with ID:", event.id);

      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      toast({
        title: "Error creating event",
        description:
          errorMessage ||
          "An unknown error occurred. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayDate = date
    ? format(parseISO(date), "MMM d, yyyy")
    : "Pick a date";

  const debugLog = (...args: unknown[]) => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  };

  const logValidationState = (label: string, data: Record<string, unknown>) => {
    debugLog(`new-event-client:${label}`, {
      ...data,
      now: new Date().toISOString(),
    });
  };

  const safeParseDateTime = (d?: string, t?: string) => {
    if (!d || !t) return null;
    const parsedDate = parseISO(d);
    if (isNaN(parsedDate.getTime())) {
      logValidationState("safeParseDateTime_invalid_parsedDate", { d, t });
      return null;
    }
    const candidateStr = `${format(parsedDate, "yyyy-MM-dd")}T${t}`;
    const candidate = new Date(candidateStr);
    if (isNaN(candidate.getTime())) {
      logValidationState("safeParseDateTime_invalid_candidate", {
        d,
        t,
        candidateStr,
        parsedDate,
      });
      return null;
    }
    return candidate;
  };

  const displaySummary = (() => {
    try {
      if (!date || !time) return "Set date and start time to preview";

      const start = safeParseDateTime(date, time);
      if (!start) return "Invalid start date/time";

      const end = endTime ? safeParseDateTime(date, endTime) : null;
      if (endTime && !end) return "Invalid end time";

      const dateLabel = format(start, "EEE, MMM d, yyyy");
      const startLabel = format(start, "h:mm a");
      const endLabel = end ? format(end, "h:mm a") : null;
      return endLabel
        ? `${dateLabel} — ${startLabel} to ${endLabel}`
        : `${dateLabel} — ${startLabel}`;
    } catch (error) {
      console.error("Error formatting summary:", error);
      return "Error formatting date/time";
    }
  })();

  const displayTime = time ? time : "Pick a start time";
  const displayEndTime = endTime ? endTime : "Add end time (optional)";

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = ["00", "15", "30", "45"];

  const getHour = (value: string) => (value ? value.split(":")[0] : "");
  const getMinute = (value: string) => (value ? value.split(":")[1] : "");

  const padTime = (hour: string | number, minute: string | number = "00") =>
    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  const normalizeToHHMM = (value?: string | null) => {
    if (!value) return "";
    const [hRaw = "", mRaw = "00"] = value.split(":");
    const hNum = Number(hRaw);
    const mNum = Number(mRaw);
    if (Number.isNaN(hNum) || Number.isNaN(mNum)) return "";
    return padTime(hNum, mNum);
  };

  const hours12 = [
    "12",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
  ];

  return (
    <main className="container mx-auto px-4 pt-28 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Create New Event
          </h1>
          <p className="text-lg text-muted-foreground">
            Stop reposting lists in chats. Create your signup link and share it once.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">
                  Create Your Event
                </CardTitle>
                <CardDescription className="text-sm">
                  Just the essentials to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Product Launch Webinar"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="text-sm sm:text-base rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell attendees about your event..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="text-sm sm:text-base rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 resize-none"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="date" className="text-sm">
                      Date *
                    </Label>
                    <div className="grid grid-cols-[1.5fr_0.8fr_1.1fr] gap-2">
                      <Select
                        value={dateMonth || undefined}
                        onValueChange={(m) => {
                          const max = getDaysInMonth(dateYear, m);
                          let d = dateDay;
                          if (d && Number(d) > max)
                            d = String(max).padStart(2, "0");
                          setDateMonth(m);
                          if (d !== dateDay) setDateDay(d);
                        }}
                      >
                        <SelectTrigger className="h-12 w-full justify-between rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <SelectValue placeholder="Month" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {monthNames.map((name, idx) => {
                            const v = String(idx + 1).padStart(2, "0");
                            return (
                              <SelectItem key={v} value={v}>
                                {name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>

                      <Select
                        value={dateDay || undefined}
                        onValueChange={(d) => setDateDay(d)}
                      >
                        <SelectTrigger className="h-12 w-full justify-between rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            {
                              length: getDaysInMonth(
                                dateYear,
                                dateMonth || "01"
                              ),
                            },
                            (_, i) => {
                              const dd = String(i + 1).padStart(2, "0");
                              return (
                                <SelectItem key={dd} value={dd}>
                                  {i + 1}
                                </SelectItem>
                              );
                            }
                          )}
                        </SelectContent>
                      </Select>

                      <Select
                        value={dateYear || undefined}
                        onValueChange={(y) => {
                          const max = getDaysInMonth(y, dateMonth || "01");
                          let d = dateDay;
                          if (d && Number(d) > max)
                            d = String(max).padStart(2, "0");
                          setDateYear(y);
                          if (d !== dateDay) setDateDay(d);
                        }}
                      >
                        <SelectTrigger className="h-12 w-full justify-between rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Choose day, month and year (future dates recommended)
                    </p>
                    <p className="text-xs font-medium text-foreground mt-1">
                      {displaySummary}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="time" className="text-sm">
                        Time *
                      </Label>
                      <button
                        type="button"
                        onClick={() => setIs24h(!is24h)}
                        className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 text-muted-foreground"
                      >
                        {is24h ? "24h" : "12h"}
                      </button>
                    </div>
                    <div
                      className={`grid gap-2 ${is24h ? "grid-cols-2" : "grid-cols-3"}`}
                    >
                      {is24h ? (
                        <>
                          <Select
                            value={getHour(time) || undefined}
                            onValueChange={(h) =>
                              setTime(padTime(h, getMinute(time) || "00"))
                            }
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Hour" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {hours.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={getMinute(time) || undefined}
                            onValueChange={(m) =>
                              setTime(padTime(getHour(time) || "09", m))
                            }
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {minutes.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Select
                            value={
                              time
                                ? convertTo12h(getHour(time)).hour
                                : undefined
                            }
                            onValueChange={(h) => {
                              const h24 = convertTo24h(
                                h,
                                time ? convertTo12h(getHour(time)).period : "AM"
                              );
                              setTime(padTime(h24, getMinute(time) || "00"));
                            }}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <SelectValue placeholder="Hour" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {hours12.map((h) => (
                                <SelectItem key={h} value={h}>
                                  {h}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={getMinute(time) || undefined}
                            onValueChange={(m) =>
                              setTime(padTime(getHour(time) || "09", m))
                            }
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {minutes.map((m) => (
                                <SelectItem key={m} value={m}>
                                  {m}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select
                            value={
                              time ? convertTo12h(getHour(time)).period : "AM"
                            }
                            onValueChange={(p) => {
                              const h24 = convertTo24h(
                                time ? convertTo12h(getHour(time)).hour : "12",
                                p
                              );
                              setTime(padTime(h24, getMinute(time) || "00"));
                            }}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                              <SelectValue placeholder="AM/PM" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set the start time ({is24h ? "24h" : "12h AM/PM"})
                    </p>
                  </div>
                </div>

                {/* Signup Categories inline */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">
                        Signup Categories
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Add categories for attendees
                      </p>
                    </div>
                  </div>
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-2 items-start"
                    >
                      <div className="flex-1 w-full space-y-3 sm:space-y-0 sm:flex sm:gap-2">
                        <div className="flex-1">
                          <Input
                            id={`slot-name-${index}`}
                            placeholder="Category name (e.g., General Admission)"
                            value={slot.name}
                            onChange={(e) =>
                              updateSlot(index, "name", e.target.value)
                            }
                            required
                            className="text-sm h-10 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
                          />
                        </div>
                        <div className="w-full sm:w-28">
                          <Input
                            id={`slot-capacity-${index}`}
                            type="number"
                            min="1"
                            placeholder="Capacity"
                            value={slot.capacity}
                            onChange={(e) =>
                              updateSlot(index, "capacity", e.target.value)
                            }
                            required
                            className="text-sm h-10 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          />
                        </div>
                      </div>
                      {slots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(index)}
                          className="h-10 w-10 self-end sm:self-auto"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSlot}
                    size="sm"
                    className="w-full border-dashed border-slate-300 dark:border-white/20 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 h-9"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Category
                  </Button>
                </div>

                {/* Advanced Options - Collapsible */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <div>
                      <Label className="text-sm font-semibold cursor-pointer group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        Advanced Options
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        End time, timezone, recurring events
                      </p>
                    </div>
                    <div
                      className={`transform transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                    >
                      <svg
                        className="w-5 h-5 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 pt-3"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="endTime" className="text-sm">
                            End Time (optional)
                          </Label>
                          <div
                            className={`grid gap-2 ${is24h ? "grid-cols-2" : "grid-cols-3"}`}
                          >
                            {is24h ? (
                              <>
                                <Select
                                  value={getHour(endTime) || undefined}
                                  onValueChange={(h) =>
                                    setEndTime(
                                      padTime(h, getMinute(endTime) || "00")
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      <SelectValue placeholder="Hour" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hours.map((h) => (
                                      <SelectItem key={h} value={h}>
                                        {h}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={getMinute(endTime) || undefined}
                                  onValueChange={(m) =>
                                    setEndTime(
                                      padTime(getHour(endTime) || "09", m)
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                                    <SelectValue placeholder="Min" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {minutes.map((m) => (
                                      <SelectItem key={m} value={m}>
                                        {m}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </>
                            ) : (
                              <>
                                <Select
                                  value={
                                    endTime
                                      ? convertTo12h(getHour(endTime)).hour
                                      : undefined
                                  }
                                  onValueChange={(h) => {
                                    const h24 = convertTo24h(
                                      h,
                                      endTime
                                        ? convertTo12h(getHour(endTime)).period
                                        : "AM"
                                    );
                                    setEndTime(
                                      padTime(h24, getMinute(endTime) || "00")
                                    );
                                  }}
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-muted-foreground" />
                                      <SelectValue placeholder="Hour" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {hours12.map((h) => (
                                      <SelectItem key={h} value={h}>
                                        {h}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={getMinute(endTime) || undefined}
                                  onValueChange={(m) =>
                                    setEndTime(
                                      padTime(getHour(endTime) || "09", m)
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                                    <SelectValue placeholder="Min" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {minutes.map((m) => (
                                      <SelectItem key={m} value={m}>
                                        {m}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={
                                    endTime
                                      ? convertTo12h(getHour(endTime)).period
                                      : "AM"
                                  }
                                  onValueChange={(p) => {
                                    const h24 = convertTo24h(
                                      endTime
                                        ? convertTo12h(getHour(endTime)).hour
                                        : "12",
                                      p
                                    );
                                    setEndTime(
                                      padTime(h24, getMinute(endTime) || "00")
                                    );
                                  }}
                                >
                                  <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 text-sm">
                                    <SelectValue placeholder="AM/PM" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AM">AM</SelectItem>
                                    <SelectItem value="PM">PM</SelectItem>
                                  </SelectContent>
                                </Select>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Optional: add an end time so the event auto-ends (
                            {is24h ? "24h" : "12h AM/PM"})
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="timezone" className="text-sm">
                            Timezone
                          </Label>
                          <Select
                            value={timezone}
                            onValueChange={(value) => setTimezone(value)}
                          >
                            <SelectTrigger
                              id="timezone"
                              className="text-sm rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
                            >
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                            <SelectContent>
                              {timezones.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Times are saved using this timezone
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                          Event Repeat
                        </Label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsRecurring(false);
                              setRecurrenceRule(null);
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              !isRecurring
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20"
                            }`}
                          >
                            One-time
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsRecurring(true);
                              setRecurrenceRule({
                                frequency: "weekly",
                                interval: 1,
                                count: 4,
                              });
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isRecurring &&
                              recurrenceRule?.frequency === "weekly"
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20"
                            }`}
                          >
                            Weekly
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsRecurring(true);
                              setRecurrenceRule({
                                frequency: "daily",
                                interval: 1,
                                count: 7,
                              });
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isRecurring &&
                              recurrenceRule?.frequency === "daily"
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                                : "bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20"
                            }`}
                          >
                            Daily
                          </button>
                        </div>
                        {isRecurring && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Repeats for</span>
                            <Input
                              type="number"
                              min="2"
                              max="52"
                              value={recurrenceRule?.count || 4}
                              onChange={(e) => {
                                const count = parseInt(e.target.value) || 4;
                                setRecurrenceRule({
                                  ...recurrenceRule,
                                  frequency:
                                    recurrenceRule?.frequency || "weekly",
                                  interval: 1,
                                  count,
                                });
                              }}
                              className="w-16 h-8 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span>
                              {recurrenceRule?.frequency === "daily"
                                ? "days"
                                : "weeks"}
                            </span>
                          </div>
                        )}
                      </div>

                      {isRecurring && (
                        <Card className="border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/5 rounded-xl">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold">
                              Recurrence Settings
                            </CardTitle>
                            <CardDescription className="text-sm">
                              Configure how often this event repeats
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor="frequency" className="text-sm">
                                  Frequency
                                </Label>
                                <Select
                                  value={recurrenceRule?.frequency || "weekly"}
                                  onValueChange={(value: any) =>
                                    setRecurrenceRule({
                                      ...recurrenceRule,
                                      frequency: value,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    id="frequency"
                                    className="text-sm"
                                  >
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">
                                      Weekly
                                    </SelectItem>
                                    <SelectItem value="monthly">
                                      Monthly
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="interval" className="text-sm">
                                  Every
                                </Label>
                                <Input
                                  id="interval"
                                  type="number"
                                  min="1"
                                  max="12"
                                  value={recurrenceRule?.interval || 1}
                                  onChange={(e) =>
                                    setRecurrenceRule({
                                      ...recurrenceRule,
                                      interval:
                                        Number.parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="text-sm sm:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="count" className="text-sm">
                                  Occurrences
                                </Label>
                                <Input
                                  id="count"
                                  type="number"
                                  min="2"
                                  max="52"
                                  value={recurrenceRule?.count || 4}
                                  onChange={(e) =>
                                    setRecurrenceRule({
                                      ...recurrenceRule,
                                      count:
                                        Number.parseInt(e.target.value) || 4,
                                    })
                                  }
                                  className="text-sm sm:text-base [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                />
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-muted-foreground">
                              This will automatically create{" "}
                              {recurrenceRule?.count || 4} separate events,
                              repeating every {recurrenceRule?.interval || 1}{" "}
                              {recurrenceRule?.frequency === "daily"
                                ? "day(s)"
                                : recurrenceRule?.frequency === "weekly"
                                  ? "week(s)"
                                  : "month(s)"}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-2"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={loading}
              className="w-full sm:w-auto rounded-xl border-slate-300 dark:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-xl bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold h-11 px-8 shadow-lg"
            >
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </motion.div>
        </form>
      </div>
    </main>
  );
}
