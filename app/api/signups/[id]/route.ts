import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendEmail } from "@/lib/email/send"
import { getSignupConfirmationEmail } from "@/lib/email/templates"
import { format } from "date-fns"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await request.json()
    const supabase = await createClient()

    const { data: updated, error } = await supabase.from("signups").update(data).eq("id", id).select().single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update signup" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get the signup to know which slot to update
    const { data: signup, error: signupError } = await supabase
      .from("signups")
      .select("*, slots(*), events(*)")
      .eq("id", id)
      .single()

    if (signupError || !signup) {
      return NextResponse.json({ error: "Signup not found" }, { status: 404 })
    }

    // Delete the signup
    const { error: deleteError } = await supabase.from("signups").delete().eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // Increment slot availability
    const { error: updateError } = await supabase
      .from("slots")
      .update({ available: signup.slots.available + 1 })
      .eq("id", signup.slot_id)

    if (updateError) {
      console.error("[v0] Failed to update slot availability:", updateError)
    }

    // Check if there's anyone on the waitlist to promote
    const { data: waitlistEntries, error: waitlistError } = await supabase
      .from("signups")
      .select("*")
      .eq("slot_id", signup.slot_id)
      .eq("status", "waitlisted")
      .order("position", { ascending: true })
      .limit(1)

    if (waitlistError) {
      console.error("[v0] Failed to fetch waitlist:", waitlistError)
    }

    if (waitlistEntries && waitlistEntries.length > 0) {
      const firstInLine = waitlistEntries[0]

      console.log("[v0] DELETE signup: Promoting waitlist entry ID:", firstInLine.id)

      // Update the waitlisted signup to confirmed status
      const { data: promotedSignup, error: promoteError } = await supabase
        .from("signups")
        .update({ status: "confirmed" })
        .eq("id", firstInLine.id)
        .select()
        .single()

      if (promoteError) {
        console.error("[v0] Failed to promote from waitlist:", promoteError)
      } else {
        console.log("[v0] Successfully promoted from waitlist:", promotedSignup.id)

        // Update positions for remaining waitlist entries
        await supabase.rpc("update_waitlist_positions", { slot_id_param: signup.slot_id })

        // Decrement slot availability (since we just filled the spot)
        await supabase.from("slots").update({ available: signup.slots.available }).eq("id", signup.slot_id)

        // Send confirmation email to promoted person
        const emailData = getSignupConfirmationEmail({
          name: firstInLine.name,
          eventTitle: signup.events.title,
          slotName: signup.slots.name,
          eventDate: format(new Date(signup.events.date), "EEEE, MMMM d, yyyy 'at' h:mm a"),
          manageUrl: `https://signuppro.app/signup/manage/${firstInLine.manage_token}`,
        })

        const emailResult = await sendEmail(
          firstInLine.email,
          `Good news! You're now confirmed for ${signup.events.title}`,
          emailData.html,
          emailData.text,
        )

        if (!emailResult.success) {
          console.error("[v0] Failed to send promotion email:", emailResult.error)
        }
      }
    }

    return NextResponse.json({ success: true, promoted: waitlistEntries && waitlistEntries.length > 0 })
  } catch (error) {
    console.error("[v0] Delete signup error:", error)
    return NextResponse.json({ error: "Failed to delete signup" }, { status: 500 })
  }
}
