import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { EditEventClient } from "@/components/edit-event-client"
import { currentUser } from "@clerk/nextjs/server"

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const supabase = await createClient()

  const { data: userData } = await supabase.from("users").select("plan").eq("clerk_id", user.id).single()

  const { data: recurringEvents } = await supabase
    .from("events")
    .select("id")
    .eq("clerk_id", user.id)
    .not("recurrence_rule", "is", null)

  const recurringSeriesCount = recurringEvents?.length || 0

  const userForClient = {
    plan: userData?.plan || "free",
    recurringSeriesCount,
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("clerk_id", user.id)
    .single()

  console.log("[v0] EditEventPage: Event data:", event, "Error:", eventError)

  if (eventError || !event) {
    console.log("[v0] EditEventPage: Redirecting to dashboard - no event found or unauthorized")
    redirect("/dashboard")
  }

  const { data: slots } = await supabase
    .from("slots")
    .select(`
      *,
      signups(id)
    `)
    .eq("event_id", id)
    .order("created_at")

  console.log("[v0] EditEventPage: Found", slots?.length || 0, "slots")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EditEventClient event={event} existingSlots={slots || []} user={userForClient} />
    </div>
  )
}
