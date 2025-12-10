import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "@/components/settings-client"

export default async function SettingsPage() {
  const user = await currentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const supabase = await createClient()

  const { data: userData } = await supabase.from("users").select("*").eq("clerk_id", user.id).single()

  return (
    <SettingsClient
      user={{
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        plan: userData?.plan || "free",
      }}
    />
  )
}
