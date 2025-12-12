"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { AppEvent, AppSlot, AppSignup } from "@/lib/schemas/database";
import {
  transformEventRow,
  transformEventRows,
  transformSlotRow,
  transformSlotRows,
  transformSignupRow,
  transformSignupRows,
  eventToDbFormat,
} from "@/lib/transformers/database";
import {
  CreateEventRequestSchema,
  CreateSignupRequestSchema,
} from "@/lib/schemas/database";

/**
 * Safe event fetching with automatic transformation and validation
 * Returns typed, normalized data or throws validation error
 */

export async function fetchEventBySlug(slug: string): Promise<AppEvent | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) return null;

    // Transform validates the data shape
    return transformEventRow(data);
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    throw new Error("Failed to fetch event");
  }
}

export async function fetchEventById(id: string): Promise<AppEvent | null> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return transformEventRow(data);
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw new Error("Failed to fetch event");
  }
}

export async function fetchEventSlots(eventId: string): Promise<AppSlot[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return transformSlotRows(data || []);
  } catch (error) {
    console.error("Error fetching slots:", error);
    throw new Error("Failed to fetch slots");
  }
}

export async function fetchEventSignups(eventId: string): Promise<AppSignup[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("signups")
      .select("*")
      .eq("event_id", eventId)
      .eq("status", "confirmed")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return transformSignupRows(data || []);
  } catch (error) {
    console.error("Error fetching signups:", error);
    throw new Error("Failed to fetch signups");
  }
}

export async function createEventSafe(input: unknown) {
  try {
    // Validate input
    const validInput = CreateEventRequestSchema.parse(input);

    const supabase = await createClient();

    // Generate slug
    const slug =
      validInput.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 50) +
      "-" +
      Date.now().toString(36);

    // Insert event with validated data
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: validInput.title,
        description: validInput.description || null,
        date: validInput.date,
        end_time: validInput.endTime,
        timezone: validInput.timezone,
        recurrence_rule: validInput.recurrenceRule,
        show_signups: validInput.showSignups,
        slug,
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;

    const event = transformEventRow(data);

    // Create slots
    if (validInput.slots && validInput.slots.length > 0) {
      const slotsToInsert = validInput.slots.map((slot) => ({
        event_id: event.id,
        name: slot.name,
        capacity: slot.capacity,
        available: slot.capacity,
      }));

      const { error: slotsError } = await supabase
        .from("slots")
        .insert(slotsToInsert);

      if (slotsError) throw slotsError;
    }

    revalidatePath("/dashboard/events");

    return { success: true, event };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}

export async function createSignupSafe(input: unknown) {
  try {
    const validInput = CreateSignupRequestSchema.parse(input);

    const supabase = await createClient();
    const manageToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from("signups")
      .insert({
        slot_id: validInput.slotId,
        name: validInput.name,
        email: validInput.email,
        phone: validInput.phone || null,
        manage_token: manageToken,
        status: "confirmed",
      })
      .select()
      .single();

    if (error) throw error;

    const signup = transformSignupRow(data);

    return { success: true, signup, manageToken };
  } catch (error) {
    console.error("Error creating signup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create signup",
    };
  }
}
