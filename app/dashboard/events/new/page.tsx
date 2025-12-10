import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { NewEventClient } from "@/components/new-event-client"

export default async function NewEventPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const supabase = await createClient()

  let { data: userData } = await supabase.from("users").select("*").eq("clerk_id", user.id).single()

  if (!userData) {
    console.log("[v0] User record not found, creating one for Clerk ID:", user.id)
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        plan: "free",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Error creating user record:", insertError)
      userData = {
        id: "",
        clerk_id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        plan: "free",
        created_at: new Date().toISOString(),
      }
    } else {
      userData = newUser
    }
  }

  const { data: events } = await supabase.from("events").select("*").eq("clerk_id", user.id).eq("status", "open")

  const { data: recurringEvents } = await supabase
    .from("events")
    .select("*")
    .eq("clerk_id", user.id)
    .not("recurrence_rule", "is", null)

  const userWithStats = {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    plan: userData?.plan || "free",
    activeEventsCount: events?.length || 0,
    recurringSeriesCount: recurringEvents?.length || 0,
    signupsThisMonth: 0,
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NewEventClient user={userWithStats} />
    </div>
  )
}
