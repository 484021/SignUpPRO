"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Event } from "@/lib/types";
import { getSignupConfirmationEmail, sendEmail } from "@/lib/email";
import { generateOccurrences } from "@/lib/utils/generate-occurrences";
import { format } from "date-fns";

async function getCurrentUserId(): Promise<string | null> {
  // Check if Clerk is configured
  if (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  ) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      return user?.id || null;
    } catch (error) {
      console.log("Clerk not available, skipping auth check");
      return null;
    }
  }
  // If Clerk is not configured, return a default user ID for demo purposes
  return "demo-user";
}

export async function createEvent(formData: {
  title: string;
  description: string;
  date: string;
  end_time?: string; // ISO string for end datetime
  timezone?: string;
  recurrenceRule?: any;
  slots: { name: string; capacity: number }[];
  showSignups?: boolean;
}) {
  try {
    console.log("Server action createEvent called with:", formData);

    const userId = await getCurrentUserId();

    if (!userId) {
      console.error("No authenticated user found");
      return {
        success: false,
        error: "You must be logged in to create an event",
      };
    }

    const supabase = createServiceRoleClient();

    const { data: userData, error: userQueryError } = await supabase
      .from("users")
      .select("id, plan, clerk_id")
      .eq("clerk_id", userId)
      .maybeSingle();

    console.log("User query result:", { userData, userQueryError });

    let dbUser = userData;

    if (!userData && !userQueryError) {
      console.log("User record not found, creating one with Clerk ID");
      const { data: newUser, error: userInsertError } = await supabase
        .from("users")
        .insert({
          clerk_id: userId,
          email: "", // Email is not available in demo mode
          plan: "free",
        })
        .select()
        .single();

      if (userInsertError) {
        console.error("Error creating user record:", userInsertError);
        console.error(
          "Error details:",
          JSON.stringify(userInsertError, null, 2)
        );
        return {
          success: false,
          error: `Failed to create user record: ${userInsertError.message}`,
        };
      }

      console.log("Created new user record:", newUser);
      dbUser = newUser;
    }

    if (!dbUser) {
      console.error("No user data available after query/insert");
      return { success: false, error: "Failed to get user information" };
    }

    console.log("Using user:", dbUser);

    const slug =
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 50) +
      "-" +
      Date.now().toString(36);

    console.log("Creating event with slug:", slug);

    // Parse the dates to extract time components with validation
    const startDateObj = new Date(formData.date);
    if (isNaN(startDateObj.getTime())) {
      return {
        success: false,
        error: "Invalid start date/time",
      };
    }

    const startTimeStr = format(startDateObj, "HH:mm"); // HH:mm format
    
    let endTimeStr: string | undefined;
    let endDatetimeStr: string | undefined;
    
    if (formData.end_time) {
      const endDateObj = new Date(formData.end_time);
      if (isNaN(endDateObj.getTime())) {
        return {
          success: false,
          error: "Invalid end time",
        };
      }
      endTimeStr = format(endDateObj, "HH:mm"); // HH:mm format (deprecated field)
      endDatetimeStr = formData.end_time; // Full ISO datetime (preferred field)
      if (endDateObj <= startDateObj) {
        return {
          success: false,
          error: "End time must be after start time",
        };
      }
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title: formData.title,
        description: formData.description,
        date: formData.date,
        start_time: startTimeStr,  // Add start_time as HH:mm
        end_time: endTimeStr,  // End time as HH:mm (deprecated, for backward compatibility)
        end_datetime: endDatetimeStr,  // Full end datetime (preferred)
        timezone: formData.timezone || "UTC",
        recurrence_rule: formData.recurrenceRule,
        show_signups: formData.showSignups ?? true, // Default to true to always show attendees
        clerk_id: userId, // Use Clerk ID directly
        user_id: dbUser.id, // Also set user_id for backward compatibility
        slug, // Add slug field
        status: "open", // Must be 'open' or 'closed' per database constraint
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      console.error("Error details:", JSON.stringify(eventError, null, 2));
      return {
        success: false,
        error: `Failed to create event: ${eventError.message}`,
      };
    }

    console.log("Created event:", event);

    if (formData.slots && formData.slots.length > 0) {
      const isRecurring =
        formData.recurrenceRule && formData.recurrenceRule.frequency;

      // Generate occurrence dates (either from recurrence rule or single event date)
      const startDate = new Date(formData.date);
      const occurrenceDates = isRecurring
        ? generateOccurrences(startDate, formData.recurrenceRule)
        : [startDate]; // Non-recurring events have just 1 occurrence

      console.log(
        "Creating slots for",
        occurrenceDates.length,
        isRecurring ? "recurring occurrences" : "single occurrence"
      );

      const slotsToInsert = [];
      for (const occurrenceDate of occurrenceDates) {
        // Add user-defined slots (e.g., General Admission)
        for (const slot of formData.slots) {
          slotsToInsert.push({
            event_id: event.id,
            name: slot.name,
            capacity: slot.capacity,
            available: slot.capacity,
            occurrence_date: occurrenceDate.toISOString(),
          });
        }

        // NOTE: Waitlist is now handled via status="waitlisted" instead of separate slot
        // Automatically add a Waitlist slot for this occurrence
        // slotsToInsert.push({
        //   event_id: event.id,
        //   name: "Waitlist",
        //   capacity: 9999, // Very high capacity for waitlist
        //   available: 9999,
        //   occurrence_date: occurrenceDate.toISOString(),
        // });
      }

      const { error: slotsError } = await supabase
        .from("slots")
        .insert(slotsToInsert);

      if (slotsError) {
        console.error("Error creating slots:", slotsError);
        return {
          success: false,
          error: `Event created but failed to create slots: ${slotsError.message}`,
        };
      }

      console.log(
        "Created",
        slotsToInsert.length,
        "slots (including waitlist)"
      );
    }

    console.log("Event created successfully:", event.id);
    revalidatePath("/dashboard");
    return { success: true, event };
  } catch (error) {
    console.error("Unexpected error in createEvent:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateEvent(
  eventId: string,
  formData: Partial<Event> & { slotCapacities?: { [key: string]: number } }
) {
  try {
    console.log("updateEvent called with:", { eventId, formData });

    const supabase = await createClient();

    const userId = await getCurrentUserId();

    if (!userId) {
      console.error("updateEvent: No user found");
      return { success: false, error: "Unauthorized" };
    }

    console.log("updateEvent: User authenticated:", userId);

    const { data: existingEvent, error: existingError } = await supabase
      .from("events")
      .select("recurrence_rule, clerk_id")
      .eq("id", eventId)
      .eq("clerk_id", userId)
      .single();

    if (existingError || !existingEvent) {
      console.error(
        "updateEvent: Event not found or unauthorized",
        existingError
      );
      return { success: false, error: "Event not found or unauthorized" };
    }

    console.log("updateEvent: Existing event found:", existingEvent);

    const wasRecurring = !!existingEvent.recurrence_rule;
    const willBeRecurring =
      formData.recurrenceRule !== undefined
        ? !!formData.recurrenceRule
        : wasRecurring;

    // Only validate recurring limits if we're actually changing the recurrence
    if (
      !wasRecurring &&
      willBeRecurring &&
      formData.recurrenceRule !== undefined
    ) {
      console.log("updateEvent: Checking recurring event limits");
      const { data: userData } = await supabase
        .from("users")
        .select("plan")
        .eq("clerk_id", userId)
        .single();

      const { data: recurringEvents } = await supabase
        .from("events")
        .select("id")
        .eq("clerk_id", userId)
        .not("recurrence_rule", "is", null);

      const recurringSeriesCount = recurringEvents?.length || 0;

      const userForCheck = {
        id: userId,
        plan: (userData?.plan || "free") as "free" | "pro",
        activeEventsCount: 0,
        recurringSeriesCount,
      };
    }

    console.log("updateEvent: Updating event in database");

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (formData.title !== undefined) updateData.title = formData.title;
    if (formData.description !== undefined)
      updateData.description = formData.description;
    if (formData.date !== undefined) updateData.date = formData.date;
    if (formData.status !== undefined) updateData.status = formData.status;
    if (formData.showSignups !== undefined)
      updateData.show_signups = formData.showSignups;
    if (formData.recurrenceRule !== undefined)
      updateData.recurrence_rule = formData.recurrenceRule || null;

    const { data, error } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .eq("clerk_id", userId)
      .select()
      .single();

    if (error) {
      console.error("updateEvent: Error updating event:", error);
      return { success: false, error: error.message };
    }

    console.log("updateEvent: Event updated successfully:", data);

    if (
      willBeRecurring &&
      formData.date &&
      formData.recurrenceRule !== undefined
    ) {
      console.log("updateEvent: Regenerating slots for recurring event");

      // Get the slot templates from existing slots (use only unique name/capacity pairs)
      const { data: existingSlots } = await supabase
        .from("slots")
        .select("name, capacity")
        .eq("event_id", eventId)
        .order("name");

      // Get unique slot templates (deduplicate by name)
      const uniqueSlotTemplates = existingSlots
        ? Array.from(
            new Map(existingSlots.map((slot) => [slot.name, slot])).values()
          )
        : [];

      if (uniqueSlotTemplates.length > 0) {
        // Delete all existing slots
        await supabase.from("slots").delete().eq("event_id", eventId);
        console.log("updateEvent: Deleted all existing slots");

        // Generate occurrence dates
        const startDate = new Date(formData.date);
        const occurrenceDates = generateOccurrences(
          startDate,
          formData.recurrenceRule
        );
        console.log(
          "updateEvent: Generated",
          occurrenceDates.length,
          "occurrence dates"
        );

        // Create slots for all occurrences
        const slotsToInsert = [];
        for (const occurrenceDate of occurrenceDates) {
          for (const slotTemplate of uniqueSlotTemplates) {
            slotsToInsert.push({
              event_id: eventId,
              name: slotTemplate.name,
              capacity: slotTemplate.capacity,
              available: slotTemplate.capacity,
              occurrence_date: occurrenceDate.toISOString(),
            });
          }

          // NOTE: Waitlist is now handled via status="waitlisted" instead of separate slot
          // Automatically add a Waitlist slot for this occurrence
          // slotsToInsert.push({
          //   event_id: eventId,
          //   name: "Waitlist",
          //   capacity: 9999, // Very high capacity for waitlist
          //   available: 9999,
          //   occurrence_date: occurrenceDate.toISOString(),
          // });
        }

        const { error: insertError } = await supabase
          .from("slots")
          .insert(slotsToInsert);
        if (insertError) {
          console.error("updateEvent: Error inserting slots:", insertError);
        } else {
          console.log(
            "updateEvent: Created",
            slotsToInsert.length,
            "slots (including waitlist) for all occurrences"
          );
        }
      } else {
        console.log(
          "updateEvent: No slot templates found, skipping slot generation"
        );
      }
    } else if (!willBeRecurring) {
      console.log(
        "updateEvent: Converting to non-recurring, removing occurrence dates"
      );
      await supabase
        .from("slots")
        .update({ occurrence_date: null })
        .eq("event_id", eventId);
    }

    if (formData.slotCapacities) {
      console.log(
        "updateEvent: Updating slot capacities:",
        formData.slotCapacities
      );

      for (const [slotId, newCapacity] of Object.entries(
        formData.slotCapacities
      )) {
        try {
          console.log(
            `updateEvent: Updating slot ${slotId} to capacity ${newCapacity}`
          );

          // Get current signup count for this slot
          const { count: signupCount, error: countError } = await supabase
            .from("signups")
            .select("*", { count: "exact", head: true })
            .eq("slot_id", slotId);

          if (countError) {
            console.error(
              `updateEvent: Error counting signups for slot ${slotId}:`,
              countError
            );
            return {
              success: false,
              error: `Failed to count signups: ${countError.message}`,
            };
          }

          console.log(`updateEvent: Slot ${slotId} has ${signupCount} signups`);

          const available = newCapacity - (signupCount || 0);

          const { error: slotError } = await supabase
            .from("slots")
            .update({
              capacity: newCapacity,
              available: available,
            })
            .eq("id", slotId)
            .eq("event_id", eventId);

          if (slotError) {
            console.error(
              `updateEvent: Error updating slot ${slotId}:`,
              slotError
            );
            return {
              success: false,
              error: `Failed to update capacity: ${slotError.message}`,
            };
          }

          console.log(
            `updateEvent: Slot ${slotId} updated successfully. Available: ${available}`
          );
        } catch (slotUpdateError) {
          console.error(
            `updateEvent: Caught error updating slot ${slotId}:`,
            slotUpdateError
          );
          const errorMessage =
            slotUpdateError instanceof Error
              ? slotUpdateError.message
              : "Unknown error updating slot";
          return { success: false, error: errorMessage };
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/events/${eventId}`);

    console.log("updateEvent: Complete success");
    return { success: true, data };
  } catch (error) {
    console.error("updateEvent: Top-level error caught:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("clerk_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function duplicateEvent(eventId: string) {
  const supabase = await createClient();

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("clerk_id", userId)
    .single();

  if (userData?.plan !== "pro") {
    throw new Error("Pro plan required");
  }

  const { data: event } = await supabase
    .from("events")
    .select("*, slots(*)")
    .eq("id", eventId)
    .single();

  if (!event) {
    throw new Error("Event not found");
  }

  const { data: slugData } = await supabase.rpc("generate_slug", {
    title: `${event.title} (Copy)`,
  });

  const { data: newEvent, error: eventError } = await supabase
    .from("events")
    .insert({
      clerk_id: userId,
      title: `${event.title} (Copy)`,
      description: event.description,
      date: event.date,
      recurrence_rule: event.recurrence_rule,
      slug: slugData,
      status: "open",
    })
    .select()
    .single();

  if (eventError) {
    throw new Error(eventError.message);
  }

  if (event.slots && event.slots.length > 0) {
    const slotsToInsert = event.slots.map((slot: any) => ({
      event_id: newEvent.id,
      name: slot.name,
      capacity: slot.capacity,
      available: slot.capacity,
    }));

    await supabase.from("slots").insert(slotsToInsert);
  }

  revalidatePath("/dashboard");
  return newEvent;
}

export async function getEvent(eventId: string) {
  const supabase = createServiceRoleClient();

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("clerk_id", userId)
    .single();

  if (eventError) {
    console.error("Error fetching event:", eventError);
    return null;
  }

  console.log("getEvent - Event fetched:", event?.title);

  const { data: slots, error: slotsError } = await supabase
    .from("slots")
    .select("*")
    .eq("event_id", eventId)
    .order("occurrence_date", { ascending: true, nullsFirst: false })
    .order("created_at");

  if (slotsError) {
    console.error("Error fetching slots:", slotsError);
  }

  console.log("getEvent - Raw slots from DB:", slots?.length, slots);

  const { data: allSignups, error: signupsError } = await supabase
    .from("signups")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (signupsError) {
    console.error("Error fetching signups:", signupsError);
  }

  const confirmedSignups = (allSignups || []).filter(
    (s) => s.status === "confirmed"
  );
  const waitlistedSignups = (allSignups || []).filter(
    (s) => s.status === "waitlisted"
  );

  const slotsWithCorrectAvailability = (slots || []).map((slot) => {
    const confirmedInSlot = confirmedSignups.filter(
      (s) => s.slot_id === slot.id
    ).length;
    return {
      ...slot,
      available: slot.capacity - confirmedInSlot,
    };
  });

  console.log(
    "getEvent - Processed slots:",
    slotsWithCorrectAvailability.length
  );
  console.log("getEvent - Confirmed signups:", confirmedSignups.length);
  console.log("getEvent - Waitlisted signups:", waitlistedSignups.length);
  console.log(
    "getEvent - Returning object with keys:",
    Object.keys({
      event,
      slots: slotsWithCorrectAvailability,
      signups: confirmedSignups,
      waitlist: waitlistedSignups,
    })
  );

  return {
    event,
    slots: slotsWithCorrectAvailability,
    signups: confirmedSignups,
    waitlist: waitlistedSignups,
  };
}

export async function getUserEvents() {
  const supabase = createServiceRoleClient();

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data: events, error } = await supabase
    .from("events")
    .select("*, slots(count)")
    .eq("clerk_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[v0] Error fetching user events:", error);
    throw new Error(error.message);
  }

  return events || [];
}

export async function getEventAnalytics(eventId: string) {
  const supabase = await createClient();

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("clerk_id", userId)
    .single();

  if (!event) {
    return null;
  }

  const { data: signups } = await supabase
    .from("signups")
    .select("*")
    .eq("event_id", eventId);

  const totalSignups = signups?.length || 0;
  const confirmedSignups =
    signups?.filter((s) => s.status === "confirmed").length || 0;
  const cancelledSignups =
    signups?.filter((s) => s.status === "cancelled").length || 0;

  const { count: waitlistCount } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  const signupsByDate: { [key: string]: number } = {};
  signups?.forEach((signup) => {
    const date = new Date(signup.created_at).toLocaleDateString();
    signupsByDate[date] = (signupsByDate[date] || 0) + 1;
  });

  const timeSeriesData = Object.entries(signupsByDate).map(([date, count]) => ({
    date,
    signups: count,
  }));

  const { data: slots } = await supabase
    .from("slots")
    .select("*")
    .eq("event_id", eventId);

  const slotData =
    slots?.map((slot) => ({
      name: slot.name,
      total: slot.capacity,
      filled: slot.capacity - slot.available,
      available: slot.available,
    })) || [];

  return {
    totalSignups,
    confirmedSignups,
    cancelledSignups,
    waitlistCount: waitlistCount || 0,
    timeSeriesData,
    slotData,
  };
}

export async function closeEvent(eventId: string) {
  const supabase = await createClient();

  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("events")
    .update({
      status: "closed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", eventId)
    .eq("clerk_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  return data;
}

export async function updateSignup(
  signupId: string,
  eventId: string,
  updates: { notes?: string }
) {
  console.log("updateSignup called with:", { signupId, eventId, updates });

  try {
    const supabase = await createClient();

    const userId = await getCurrentUserId();

    if (!userId) {
      console.error("updateSignup: No authenticated user");
      throw new Error("You must be logged in to update signups");
    }
    console.log("updateSignup: Checking event ownership");
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("clerk_id, title, date")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("updateSignup: Event query error:", eventError);
      throw new Error(`Failed to find event: ${eventError.message}`);
    }

    if (!event || event.clerk_id !== userId) {
      console.error("updateSignup: Unauthorized");
      throw new Error("You don't have permission to update this signup");
    }
    console.log("updateSignup: Fetching signup details");
    const { data: signup, error: signupFetchError } = await supabase
      .from("signups")
      .select("slot_id, status, slots(name, occurrence_date)")
      .eq("id", signupId)
      .single();

    if (signupFetchError || !signup) {
      console.error("updateSignup: Failed to fetch signup:", signupFetchError);
      throw new Error("Signup not found");
    }
    console.log("updateSignup: Updating with data:", updates);
    const { data: updatedSignup, error: updateError } = await supabase
      .from("signups")
      .update(updates)
      .eq("id", signupId)
      .select()
      .single();

    if (updateError) {
      console.error("updateSignup: Database error:", updateError);
      throw new Error(`Failed to update signup: ${updateError.message}`);
    }
    console.log("updateSignup: Success, data:", updatedSignup);
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, data: updatedSignup };
  } catch (error) {
    console.error("updateSignup: Caught error:", error);
    throw error;
  }
}

export async function removeSelfByEmail(
  eventSlug: string,
  email: string,
  signupId?: string
) {
  console.log("removeSelfByEmail called with:", {
    eventSlug,
    email,
    signupId,
  });

  try {
    const supabase = await createClient();

    if (!email || !email.trim()) {
      console.error("removeSelfByEmail: Empty email");
      return { success: false, error: "Email address is required" };
    }
    console.log("removeSelfByEmail: Looking up event by slug:", eventSlug);
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug)
      .single();

    if (eventError) {
      console.error("removeSelfByEmail: Event query error:", eventError);
      return {
        success: false,
        error: `Failed to find event: ${eventError.message}`,
      };
    }

    if (!event) {
      console.error("removeSelfByEmail: Event not found for slug:", eventSlug);
      return { success: false, error: "Event not found" };
    }

    console.log("removeSelfByEmail: Found event ID:", event.id);
    console.log("removeSelfByEmail: Looking up signups for email:", email);

    const { data: signups, error: signupsError } = await supabase
      .from("signups")
      .select("id, name, email, slot_id, status, occurrence_date, slots(name)")
      .eq("event_id", event.id)
      .ilike("email", email.trim());

    // Also get ALL signups for this email across all events for debugging
    const { data: allSignupsForEmail } = await supabase
      .from("signups")
      .select("id, name, email, slot_id, status, event_id")
      .ilike("email", email.trim());

    console.log(
      "removeSelfByEmail: ALL signups for this email in database:",
      allSignupsForEmail?.map((s: any) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        slot_id: s.slot_id,
        event_id: s.event_id,
      }))
    );

    console.log("removeSelfByEmail: Signups query result:", {
      signupsFound: signups?.length || 0,
      signups: signups?.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        status: (s as any).status,
      })),
      error: signupsError,
    });

    if (signupsError) {
      console.error("removeSelfByEmail: Signups query error:", signupsError);
      return {
        success: false,
        error: `Failed to look up signups: ${signupsError.message}`,
      };
    }

    if (!signups || signups.length === 0) {
      console.error("removeSelfByEmail: No signup found for email:", email);
      return {
        success: false,
        error: "No signup found with that email address",
      };
    }

    const confirmedSignups = signups.filter(
      (s: any) => s.status === "confirmed"
    );

    console.log(
      "removeSelfByEmail: Confirmed signups:",
      confirmedSignups.length
    );

    if (confirmedSignups.length === 0) {
      console.error("removeSelfByEmail: No confirmed signup found");
      return {
        success: false,
        error: "No confirmed signup found with that email address",
      };
    }

    if (confirmedSignups.length > 1 && !signupId) {
      console.log(
        "removeSelfByEmail: Multiple confirmed signups found, returning list"
      );
      return {
        success: false,
        error: "multiple_signups",
        signups: confirmedSignups.map((s: any) => ({
          id: s.id,
          name: s.name,
          slotName: s.slots?.name || "Unknown",
        })),
      };
    }

    const signupToDelete = signupId
      ? confirmedSignups.find((s) => s.id === signupId)
      : confirmedSignups[0];

    if (!signupToDelete) {
      console.error("removeSelfByEmail: Signup not found in filtered list");
      return { success: false, error: "Signup not found" };
    }
    console.log(
      "removeSelfByEmail: Deleting signup:",
      signupToDelete.id,
      "occurrence_date:",
      signupToDelete.occurrence_date
    );
    const { error: deleteError } = await supabase
      .from("signups")
      .delete()
      .eq("id", signupToDelete.id);

    if (deleteError) {
      console.error("removeSelfByEmail: Delete error:", deleteError);
      return {
        success: false,
        error: `Failed to remove signup: ${deleteError.message}`,
      };
    }
    console.log("removeSelfByEmail: Signup deleted successfully");

    if (signupToDelete.slot_id) {
      console.log(
        "removeSelfByEmail: Checking for waitlist entries for slot:",
        signupToDelete.slot_id,
        "with occurrence_date:",
        signupToDelete.occurrence_date
      );

      // Look for entries with status="waitlisted" in the SAME slot
      const { data: allWaitlist, error: allWaitlistError } = await supabase
        .from("signups")
        .select("*")
        .eq("slot_id", signupToDelete.slot_id)
        .eq("status", "waitlisted")
        .order("created_at", { ascending: true });

      console.log(
        "removeSelfByEmail: Waitlist entries with status='waitlisted' for slot:",
        allWaitlist?.map((w: any) => ({
          id: w.id,
          name: w.name,
          occurrence_date: w.occurrence_date,
          created_at: w.created_at,
        }))
      );

      if (allWaitlistError) {
        console.error(
          "removeSelfByEmail: Waitlist query error:",
          allWaitlistError
        );
      }

      let waitlistEntries = allWaitlist || [];

      // If occurrence_date exists on deleted signup, filter to matching occurrence
      if (signupToDelete.occurrence_date && waitlistEntries.length > 0) {
        const matchingOccurrence = waitlistEntries.filter(
          (w: any) => w.occurrence_date === signupToDelete.occurrence_date
        );
        if (matchingOccurrence.length > 0) {
          waitlistEntries = matchingOccurrence;
        }
      }

      // Get the first person in line (already sorted by created_at)
      if (waitlistEntries.length > 0) {
        waitlistEntries = waitlistEntries.slice(0, 1);
      }

      console.log(
        "removeSelfByEmail: Found",
        waitlistEntries.length,
        "entries in waitlist to promote"
      );

      if (waitlistEntries && waitlistEntries.length > 0) {
        const firstInLine = waitlistEntries[0];
        console.log(
          "removeSelfByEmail: Promoting waitlist entry:",
          firstInLine.id
        );

        const { error: promoteError } = await supabase
          .from("signups")
          .update({
            status: "confirmed",
          })
          .eq("id", firstInLine.id);

        if (promoteError) {
          console.error(
            "removeSelfByEmail: Failed to promote waitlist entry:",
            promoteError
          );
        } else {
          console.log(
            "removeSelfByEmail: Promoted waitlist entry successfully"
          );

          // Fetch slot details for the email
          const { data: slotDetails } = await supabase
            .from("slots")
            .select("name")
            .eq("id", signupToDelete.slot_id)
            .single();

          try {
            const confirmationEmail = getSignupConfirmationEmail({
              name: firstInLine.name,
              email: firstInLine.email,
              eventTitle: event.title || "Event",
              eventDate: event.date || new Date().toISOString(),
              slotName: slotDetails?.name || "General Admission",
              manageUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://signuppro.app"}/signup/${eventSlug}/manage`,
            });

            await sendEmail({
              to: firstInLine.email,
              subject: `🎉 Good news! A spot opened up for ${event.title || "Event"}`,
              html: confirmationEmail,
            });

            console.log(
              "removeSelfByEmail: Promotion confirmation email sent to:",
              firstInLine.email
            );
          } catch (emailError) {
            console.error(
              "removeSelfByEmail: Failed to send confirmation email:",
              emailError
            );
          }
        }
      } else {
        // No waitlist entries, just increment availability
        console.log(
          "removeSelfByEmail: No waitlist entries, updating slot availability"
        );
      }
    }

    console.log("[v0] removeSelfByEmail: Success");
    revalidatePath(`/signup/${eventSlug}`);
    return {
      success: true,
      message: "Your signup has been removed successfully",
    };
  } catch (error) {
    console.error("[v0] removeSelfByEmail: Caught error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function removeWaitlistByEmail(
  eventSlug: string,
  email: string,
  waitlistId?: string
) {
  console.log("removeWaitlistByEmail called with:", {
    eventSlug,
    email,
    waitlistId,
  });

  try {
    const supabase = await createClient();

    if (!email || !email.trim()) {
      console.error("removeWaitlistByEmail: Empty email");
      return { success: false, error: "Email address is required" };
    }
    console.log("removeWaitlistByEmail: Looking up event by slug");
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", eventSlug)
      .single();

    if (eventError || !event) {
      console.error("removeWaitlistByEmail: Event query error:", eventError);
      return { success: false, error: "Event not found" };
    }
    console.log("removeWaitlistByEmail: Looking up waitlist entries for email");
    const { data: waitlistEntries, error: waitlistError } = await supabase
      .from("signups")
      .select("id, name, slot_id, slots(name)")
      .eq("event_id", event.id)
      .ilike("email", email.trim())
      .eq("status", "waitlisted");

    if (waitlistError) {
      console.error(
        "removeWaitlistByEmail: Waitlist query error:",
        waitlistError
      );
      return {
        success: false,
        error: `Failed to look up waitlist: ${waitlistError.message}`,
      };
    }

    if (!waitlistEntries || waitlistEntries.length === 0) {
      console.error(
        "removeWaitlistByEmail: No waitlist entry found for email:",
        email
      );
      return {
        success: false,
        error: "No waitlist entry found with that email address",
      };
    }

    if (waitlistEntries.length > 1 && !waitlistId) {
      console.log(
        "removeWaitlistByEmail: Multiple waitlist entries found, returning list"
      );
      return {
        success: false,
        error: "multiple_waitlist",
        waitlist: waitlistEntries.map((w: any) => ({
          id: w.id,
          name: w.name,
          slotName: w.slots?.name || "Unknown",
        })),
      };
    }

    const waitlistToDelete = waitlistId
      ? waitlistEntries.find((w) => w.id === waitlistId)
      : waitlistEntries[0];

    if (!waitlistToDelete) {
      return { success: false, error: "Waitlist entry not found" };
    }

    console.log(
      "removeWaitlistByEmail: Deleting waitlist entry:",
      waitlistToDelete.id
    );
    const { error: deleteError } = await supabase
      .from("signups")
      .delete()
      .eq("id", waitlistToDelete.id);

    if (deleteError) {
      console.error("removeWaitlistByEmail: Delete error:", deleteError);
      return {
        success: false,
        error: `Failed to remove waitlist entry: ${deleteError.message}`,
      };
    }

    // Update remaining waitlist positions
    if (waitlistToDelete.slot_id) {
      const { error: updatePositionsError } = await supabase.rpc(
        "update_waitlist_positions",
        {
          p_slot_id: waitlistToDelete.slot_id,
        }
      );

      if (updatePositionsError) {
        console.error(
          "removeWaitlistByEmail: Failed to update waitlist positions:",
          updatePositionsError
        );
      }
    }
    console.log("removeWaitlistByEmail: Success");
    revalidatePath(`/signup/${eventSlug}`);
    return { success: true, message: "You've been removed from the waitlist" };
  } catch (error) {
    console.error("removeWaitlistByEmail: Caught error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function removeSignup(signupId: string, eventId: string) {
  console.log("removeSignup called with:", { signupId, eventId });

  try {
    const supabase = createServiceRoleClient();

    const userId = await getCurrentUserId();

    if (!userId) {
      console.error("removeSignup: No authenticated user");
      throw new Error("You must be logged in to remove signups");
    }
    console.log("removeSignup: Checking event ownership");
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .eq("clerk_id", userId)
      .single();

    if (eventError || !event) {
      console.error("removeSignup: Event query error:", eventError);
      throw new Error("Event not found");
    }

    if (event.clerk_id !== userId) {
      console.error("removeSignup: Unauthorized");
      throw new Error("You don't have permission to remove this signup");
    }

    console.log("removeSignup: Fetching signup details");
    const { data: signup, error: signupFetchError } = await supabase
      .from("signups")
      .select("slot_id, status, slots(name, occurrence_date)")
      .eq("id", signupId)
      .single();

    if (signupFetchError || !signup) {
      console.error("removeSignup: Failed to fetch signup:", signupFetchError);
      throw new Error("Signup not found");
    }

    console.log("removeSignup: Deleting signup from database");
    const { error: deleteError } = await supabase
      .from("signups")
      .delete()
      .eq("id", signupId);

    if (deleteError) {
      console.error("removeSignup: Delete error:", deleteError);
      throw new Error(`Failed to remove signup: ${deleteError.message}`);
    }

    console.log(
      "removeSignup: Checking if promotion needed. Signup status:",
      signup.status
    );
    if (signup.slot_id && signup.status === "confirmed") {
      console.log("removeSignup: Checking for waitlist entries to promote");
      const { data: waitlistEntries, error: waitlistError } = await supabase
        .from("signups")
        .select("*")
        .eq("slot_id", signup.slot_id)
        .eq("status", "waitlisted")
        .order("created_at", { ascending: true })
        .limit(1);

      if (waitlistError) {
        console.error("removeSignup: Waitlist query error:", waitlistError);
      }

      if (waitlistEntries && waitlistEntries.length > 0) {
        const firstInLine = waitlistEntries[0];
        console.log("removeSignup: Promoting waitlist entry:", firstInLine.id);

        const { error: promoteError } = await supabase
          .from("signups")
          .update({
            status: "confirmed",
          })
          .eq("id", firstInLine.id);

        if (promoteError) {
          console.error(
            "removeSignup: Failed to promote waitlist entry:",
            promoteError
          );
        } else {
          console.log("removeSignup: Waitlist entry promoted successfully");

          try {
            const confirmationEmail = getSignupConfirmationEmail({
              name: firstInLine.name,
              email: firstInLine.email,
              eventTitle: event.title || "Event",
              eventDate:
                (signup as any).slots?.occurrence_date ||
                event.date ||
                new Date().toISOString(),
              slotName: (signup as any).slots?.name || "General Admission",
              manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://signuppro.app"}/signup/manage/${firstInLine.manage_token}`,
            });

            await sendEmail({
              to: firstInLine.email,
              subject: `You're in! Spot available for ${event.title || "Event"}`,
              html: confirmationEmail,
            });

            console.log(
              "removeSignup: Confirmation email sent to promoted person"
            );
          } catch (emailError) {
            console.error(
              "removeSignup: Failed to send confirmation email:",
              emailError
            );
          }
        }
      } else {
        console.log("removeSignup: No waitlist entries to promote");
      }
    } else {
      console.log(
        "removeSignup: Skipping promotion - removed signup was waitlisted or had no slot"
      );
    }
    console.log("removeSignup: Success, revalidating paths");
    revalidatePath(`/dashboard/events/${eventId}`);
    revalidatePath(`/events/${event.slug}`);
  } catch (error) {
    console.error("removeSignup: Caught error:", error);
    throw error;
  }
}

export async function deleteOccurrence(
  eventId: string,
  occurrenceDate: string
) {
  console.log("deleteOccurrence called with:", {
    eventId,
    occurrenceDate,
  });

  try {
    const supabase = await createClient();

    const userId = await getCurrentUserId();

    if (!userId) {
      console.error("deleteOccurrence: No authenticated user");
      throw new Error("You must be logged in to delete occurrences");
    }
    console.log("deleteOccurrence: Checking event ownership");
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("clerk_id, recurrence_rule")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("deleteOccurrence: Event query error:", eventError);
      throw new Error(`Failed to find event: ${eventError.message}`);
    }

    if (!event || event.clerk_id !== userId) {
      console.error("deleteOccurrence: Unauthorized");
      throw new Error("You don't have permission to delete this occurrence");
    }

    if (!event.recurrence_rule) {
      console.error("deleteOccurrence: Not a recurring event");
      throw new Error("This is not a recurring event");
    }

    const occurrenceDay = new Date(occurrenceDate);
    const startOfDay = new Date(occurrenceDay);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(occurrenceDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log("deleteOccurrence: Date range:", {
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString(),
    });
    console.log("deleteOccurrence: Finding slots for occurrence date");
    const { data: slots, error: slotsError } = await supabase
      .from("slots")
      .select("id")
      .eq("event_id", eventId)
      .gte("occurrence_date", startOfDay.toISOString())
      .lte("occurrence_date", endOfDay.toISOString());

    if (slotsError) {
      console.error("deleteOccurrence: Slots query error:", slotsError);
      throw new Error(`Failed to find slots: ${slotsError.message}`);
    }
    console.log("deleteOccurrence: Found", slots?.length || 0, "slots");

    if (!slots || slots.length === 0) {
      console.log("deleteOccurrence: No slots found for this occurrence");
      return { success: true, message: "No slots found for this occurrence" };
    }

    const slotIds = slots.map((s) => s.id);
    console.log(
      "deleteOccurrence: Deleting",
      slotIds.length,
      "slots with IDs:",
      slotIds
    );

    // Delete signups for these slots (cascading should handle this, but doing it explicitly)
    const { error: signupsDeleteError } = await supabase
      .from("signups")
      .delete()
      .in("slot_id", slotIds);

    if (signupsDeleteError) {
      console.error(
        "deleteOccurrence: Signups delete error:",
        signupsDeleteError
      );
      throw new Error(
        `Failed to delete signups: ${signupsDeleteError.message}`
      );
    }

    // Delete waitlist entries for these slots
    const { error: waitlistDeleteError } = await supabase
      .from("signups")
      .delete()
      .in("slot_id", slotIds)
      .eq("status", "waitlisted");

    if (waitlistDeleteError) {
      console.error(
        "deleteOccurrence: Waitlist delete error:",
        waitlistDeleteError
      );
      throw new Error(
        `Failed to delete waitlist: ${waitlistDeleteError.message}`
      );
    }

    // Delete the slots themselves
    const { error: slotsDeleteError } = await supabase
      .from("slots")
      .delete()
      .in("id", slotIds);

    if (slotsDeleteError) {
      console.error("deleteOccurrence: Slots delete error:", slotsDeleteError);
      throw new Error(`Failed to delete slots: ${slotsDeleteError.message}`);
    }

    console.log("deleteOccurrence: Successfully deleted occurrence");
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, message: "Occurrence deleted successfully" };
  } catch (error) {
    console.error("deleteOccurrence: Caught error:", error);
    throw error;
  }
}
