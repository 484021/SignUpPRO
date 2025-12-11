"use client";

import type React from "react";
import { useState } from "react";
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
import { Plus, X, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface SlotInput {
  name: string;
  capacity: number;
}

export function NewEventClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | null>(
    null
  );
  const [slots, setSlots] = useState([
    { name: "General Admission", capacity: 50 },
  ]);
  const [loading, setLoading] = useState(false);

  const addSlot = () => {
    setSlots([...slots, { name: "", capacity: 10 }]);
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
              [field]:
                field === "capacity"
                  ? Number.parseInt(value as string) || 0
                  : value,
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

    if (!date || !time) {
      toast({
        title: "Error",
        description: "Event date and time are required",
        variant: "destructive",
      });
      return;
    }

    const eventDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    if (eventDateTime < now) {
      toast({
        title: "Invalid date",
        description: "Event date must be in the future",
        variant: "destructive",
      });
      return;
    }

    const validSlots = slots.filter((s) => s.name.trim() && s.capacity > 0);
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
        date: new Date(`${date}T${time}`).toISOString(),
        recurrenceRule: finalRecurrenceRule,
        slots: validSlots,
        showSignups: true,
      };

      console.log("Creating event with data:", eventData);
      const result = await createEvent(eventData);
      console.log("Create event result:", result);

      if (!result.success) {
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
            Set up your event with custom slots and manage signups
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
                  Event Details
                </CardTitle>
                <CardDescription className="text-sm">
                  Basic information about your event
                </CardDescription>
              </CardHeader>
            <CardContent className="space-y-4">
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
                  className="text-sm sm:text-base"
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
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm">
                    Date *
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm">
                    Time *
                  </Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) => {
                    setIsRecurring(checked as boolean);
                    if (!checked) setRecurrenceRule(null);
                  }}
                />
                <Label htmlFor="recurring" className="text-sm cursor-pointer">
                  Make this a recurring event
                </Label>
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
                          <SelectTrigger id="frequency" className="text-sm">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
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
                              interval: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="text-sm sm:text-base"
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
                              count: Number.parseInt(e.target.value) || 4,
                            })
                          }
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground">
                      This will automatically create{" "}
                      {recurrenceRule?.count || 4} separate events, repeating
                      every {recurrenceRule?.interval || 1}{" "}
                      {recurrenceRule?.frequency === "daily"
                        ? "day(s)"
                        : recurrenceRule?.frequency === "weekly"
                          ? "week(s)"
                          : "month(s)"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
          <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold">
                Signup Categories
              </CardTitle>
              <CardDescription className="text-sm">
                Create different categories for attendees (e.g., Male/Female,
                VIP/General, Morning/Evening)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {slots.map((slot, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row gap-3 items-start"
                >
                  <div className="flex-1 w-full space-y-4 sm:space-y-0 sm:flex sm:gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`slot-name-${index}`} className="text-sm">
                        Category Name *
                      </Label>
                      <Input
                        id={`slot-name-${index}`}
                        placeholder="e.g., Male, Female, VIP, General Admission"
                        value={slot.name}
                        onChange={(e) =>
                          updateSlot(index, "name", e.target.value)
                        }
                        required
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="w-full sm:w-32 space-y-2">
                      <Label
                        htmlFor={`slot-capacity-${index}`}
                        className="text-sm"
                      >
                        Capacity *
                      </Label>
                      <Input
                        id={`slot-capacity-${index}`}
                        type="number"
                        min="1"
                        value={slot.capacity}
                        onChange={(e) =>
                          updateSlot(
                            index,
                            "capacity",
                            Number.parseInt(e.target.value) || 0
                          )
                        }
                        required
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  {slots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSlot(index)}
                      className="mt-0 sm:mt-8 self-end sm:self-auto"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove category</span>
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addSlot}
                className="w-full border-slate-300 dark:border-white/20 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Category
              </Button>
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
