import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const supabase = await createServiceRoleClient();

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", user.id)
    .maybeSingle();

  // If user doesn't exist in database yet, create them
  if (!userData) {
    // User record not found — create a new DB entry for this Clerk user
    await supabase.from("users").insert({
      clerk_id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      plan: "free",
    });
  }

  const { data: events } = await supabase
    .from("events")
    .select("*, slots(*), signups(*)")
    .eq("clerk_id", user.id)
    .order("created_at", { ascending: false });

  const eventMap = new Map();
  const displayEvents: any[] = [];

  events?.forEach((event) => {
    if (event.recurrence_rule) {
      // For recurring events, only show the first occurrence (the parent)
      if (!event.parent_event_id) {
        // This is the parent recurring event
        if (!eventMap.has(event.id)) {
          eventMap.set(event.id, event);
          displayEvents.push(event);
        }
      }
      // Skip child occurrences - they'll be managed within the parent event
    } else {
      // Non-recurring events, show normally
      displayEvents.push(event);
    }
  });

  return <DashboardClient events={displayEvents} />;
}
