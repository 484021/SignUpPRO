import { Card, CardContent } from "@/components/ui/card";
import { SignupPageClient } from "@/components/signup-page-client";
import { createClient } from "@/lib/supabase/server";

function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SignupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const occurrenceDate = resolvedSearchParams.occurrence_date as
    | string
    | undefined;

  const supabase = await createClient();

  const { data: event, error: eventError } = isUUID(id)
    ? await supabase.from("events").select("*").eq("id", id).single()
    : await supabase.from("events").select("*").eq("slug", id).single();

  if (eventError || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-2">Event not found</h1>
            <p className="text-muted-foreground">
              This event may have been deleted or the link is incorrect.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: organizer } = await supabase
    .from("users")
    .select("plan")
    .eq("id", event.user_id)
    .single();

  let slotsQuery = supabase
    .from("slots")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: true });

  if (occurrenceDate) {
    slotsQuery = slotsQuery.eq("occurrence_date", occurrenceDate);
  }

  const { data: slots, error: slotsError } = await slotsQuery;

  if (slotsError || !slots || slots.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold mb-2">No slots available</h1>
            <p className="text-muted-foreground">
              This event doesn't have any slots configured.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const slotsWithAvailability = await Promise.all(
    slots.map(async (slot) => {
      const { count } = await supabase
        .from("signups")
        .select("*", { count: "exact", head: true })
        .eq("slot_id", slot.id)
        .eq("status", "confirmed");

      const signupCount = count || 0;
      const available = Math.max(0, slot.capacity - signupCount);

      return {
        ...slot,
        available,
      };
    })
  );

  let publicSignups = null;
  let publicWaitlist = null;
  if (event.show_signups) {
    const { data: confirmedSignups } = await supabase
      .from("signups")
      .select("id, name, slot_id, status, created_at")
      .eq("event_id", event.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });

    const { data: waitlistData } = await supabase
      .from("signups")
      .select("id, name, slot_id, status, created_at")
      .eq("event_id", event.id)
      .eq("status", "waitlisted")
      .order("created_at", { ascending: true });

    publicWaitlist = waitlistData || [];
    publicSignups = [...(confirmedSignups || []), ...(publicWaitlist || [])];
  }

  return (
    <SignupPageClient
      event={event}
      slots={slotsWithAvailability}
      publicSignups={publicSignups}
      publicWaitlist={publicWaitlist}
      organizerPlan={organizer?.plan || "free"}
    />
  );
}
