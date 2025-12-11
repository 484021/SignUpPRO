import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateManageToken } from "@/lib/utils/generate-token";
import { sendEmail } from "@/lib/email/send";
import {
  getSignupConfirmationEmail,
  getWaitlistEmail,
} from "@/lib/email/templates";
import { format } from "date-fns";

export async function POST(request: Request) {
  try {
    console.log("[v0] Signup API called");
    const data = await request.json();
    const { eventId, slotId, name, email, phone, occurrenceDate } = data;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedName = (name || "").trim();

    console.log("[v0] Signup data:", {
      eventId,
      slotId,
      name: normalizedName,
      email: normalizedEmail,
      occurrenceDate,
    });

    if (!normalizedName || !normalizedEmail) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: slot, error: slotError } = await supabase
      .from("slots")
      .select("*, events(*)")
      .eq("id", slotId)
      .single();

    if (slotError || !slot) {
      console.error("[v0] Slot not found:", slotError);
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    console.log("[v0] Found slot:", {
      id: slot.id,
      name: slot.name,
      capacity: slot.capacity,
      available: slot.available,
      eventTitle: slot.events.title,
    });

    const { count: confirmedCount, error: countError } = await supabase
      .from("signups")
      .select("*", { count: "exact", head: true })
      .eq("slot_id", slotId)
      .eq("status", "confirmed");

    if (countError) {
      console.error("[v0] Error counting signups:", countError);
      return NextResponse.json(
        { error: "Failed to check availability" },
        { status: 500 }
      );
    }

    // Validate occurrence date against slot occurrence if provided
    const slotDate = slot.occurrence_date || slot.events?.date || null;
    if (slotDate && occurrenceDate) {
      const slotDay = slotDate.split("T")[0];
      const reqDay = occurrenceDate.split("T")[0];
      if (slotDay !== reqDay) {
        return NextResponse.json(
          { error: "Selected date does not match this slot" },
          { status: 400 }
        );
      }
    }
    const effectiveOccurrenceDate = slotDate || occurrenceDate || null;

    // Prevent duplicate confirmed/waitlist entries for the same slot+email
    const { data: existingSignups, error: dupError } = await supabase
      .from("signups")
      .select("id, status")
      .eq("slot_id", slotId)
      .ilike("email", normalizedEmail)
      .in("status", ["confirmed", "waitlisted"]);

    if (dupError) {
      console.error("[v0] Duplicate check failed:", dupError);
      return NextResponse.json(
        { error: "Failed to validate signup" },
        { status: 500 }
      );
    }

    if (existingSignups && existingSignups.length > 0) {
      const existingStatus = existingSignups[0].status;
      const message =
        existingStatus === "waitlisted"
          ? "You're already on the waitlist for this slot"
          : "You're already signed up for this slot";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    const manageToken = generateManageToken();

    // Check if this is actually a waitlist slot
    const isWaitlistSlot = slot.name?.toLowerCase().includes("waitlist");

    // For regular slots, check if full and add to waitlist with status="waitlisted"
    // For waitlist slots, just add normally
    const isSlotFull =
      !isWaitlistSlot && (confirmedCount || 0) >= slot.capacity;

    if (isSlotFull) {
      console.log(
        "[v0] Slot is full, adding to waitlist with status='waitlisted'"
      );

      const { count: waitlistCount } = await supabase
        .from("signups")
        .select("*", { count: "exact", head: true })
        .eq("slot_id", slotId)
        .eq("status", "waitlisted");

      const position = (waitlistCount || 0) + 1;
      console.log("[v0] Waitlist position:", position);

      const { data: waitlistEntry, error: waitlistError } = await supabase
        .from("signups")
        .insert({
          event_id: eventId,
          slot_id: slotId,
          name: normalizedName,
          email: normalizedEmail,
          phone: phone || null,
          manage_token: manageToken,
          status: "waitlisted",
          occurrence_date: effectiveOccurrenceDate,
        })
        .select()
        .single();

      if (waitlistError) {
        console.error("[v0] Waitlist insert error:", waitlistError);
        return NextResponse.json(
          { error: waitlistError.message },
          { status: 500 }
        );
      }

      console.log("[v0] Created waitlist entry:", waitlistEntry.id);

      try {
        console.log("[v0] Preparing to send waitlist email");
        const emailData = getWaitlistEmail({
          name: normalizedName,
          eventTitle: slot.events.title,
          slotName: slot.name,
          position,
          manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://signuppro.app"}/signup/manage/${manageToken}`,
        });

        console.log("[v0] Email data prepared:", {
          hasSubject: !!emailData.subject,
          hasHtml: !!emailData.html,
          hasText: !!emailData.text,
        });

        const emailResult = await sendEmail({
          to: normalizedEmail,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });

        console.log("[v0] Email result:", emailResult);

        if (!emailResult.success) {
          console.error(
            "[v0] Failed to send waitlist confirmation email:",
            emailResult.error
          );
        } else {
          console.log("[v0] Waitlist confirmation email sent successfully");
        }
      } catch (emailError) {
        console.error("[v0] Error sending waitlist email:", emailError);
        console.error(
          "[v0] Email error details:",
          JSON.stringify(emailError, Object.getOwnPropertyNames(emailError))
        );
      }

      return NextResponse.json({
        success: true,
        isWaitlist: true,
        position,
        message: `Added to waitlist at position ${position}`,
      });
    }

    console.log("[v0] Creating confirmed signup");
    const { data: signup, error: insertError } = await supabase
      .from("signups")
      .insert({
        event_id: eventId,
        slot_id: slotId,
        name: normalizedName,
        email: normalizedEmail,
        phone: phone || null,
        manage_token: manageToken,
        status: "confirmed",
        occurrence_date: effectiveOccurrenceDate,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[v0] Signup insert error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("[v0] Created confirmed signup:", signup.id);

    // Recalculate availability based on confirmed count to avoid drift
    const { count: latestConfirmed } = await supabase
      .from("signups")
      .select("*", { count: "exact", head: true })
      .eq("slot_id", slotId)
      .eq("status", "confirmed");

    const nextAvailable = Math.max(
      (slot.capacity || 0) - (latestConfirmed || 0),
      0
    );

    const { error: availabilityError } = await supabase
      .from("slots")
      .update({ available: nextAvailable })
      .eq("id", slotId);

    if (availabilityError) {
      console.error(
        "[v0] Error recalculating availability:",
        availabilityError
      );
    }

    try {
      const eventDate = slot.occurrence_date || slot.events.date || null;
      const emailData = getSignupConfirmationEmail({
        name: normalizedName,
        eventTitle: slot.events.title,
        slotName: slot.name,
        eventDate: eventDate
          ? format(new Date(eventDate), "PPP 'at' p")
          : "Date TBA",
        eventTime: slot.events.time,
        eventLocation: slot.events.location,
        manageUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "https://signuppro.app"}/signup/manage/${manageToken}`,
      });

      console.log("[v0] Preparing to send confirmation email");
      console.log("[v0] Email data prepared:", {
        hasSubject: !!emailData.subject,
        hasHtml: !!emailData.html,
        hasText: !!emailData.text,
      });

      const emailResult = await sendEmail({
        to: normalizedEmail,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });

      console.log("[v0] Email result:", emailResult);

      if (!emailResult.success) {
        console.error(
          "[v0] Failed to send confirmation email:",
          emailResult.error
        );
      } else {
        console.log("[v0] Confirmation email sent successfully");
      }
    } catch (emailError) {
      console.error("[v0] Error sending confirmation email:", emailError);
      console.error(
        "[v0] Email error details:",
        JSON.stringify(emailError, Object.getOwnPropertyNames(emailError))
      );
    }

    return NextResponse.json({
      success: true,
      isWaitlist: false,
      message: "Signup successful",
    });
  } catch (error) {
    console.error("[v0] Signup API error:", error);
    console.error(
      "[v0] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create signup",
      },
      { status: 500 }
    );
  }
}
