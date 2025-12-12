import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { ManageSignupClient } from "@/components/manage-signup-client";
import { createClient } from "@/lib/supabase/server";

export default async function ManageSignupPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // Try to find signup first
  const { data: signup } = await supabase
    .from("signups")
    .select("*, events(*), slots(*)")
    .eq("manage_token", token)
    .single();

  // If not found in signups, check waitlist
  if (!signup) {
    const { data: waitlistEntry } = await supabase
      .from("waitlist")
      .select("*, events(*), slots(*)")
      .eq("manage_token", token)
      .single();

    if (!waitlistEntry) {
      return (
        <div className="min-h-screen app-bg flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-6 space-y-4">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
                <p className="text-muted-foreground">
                  This signup link is invalid or has expired.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Return waitlist management view
    return (
      <ManageSignupClient
        signup={waitlistEntry}
        event={waitlistEntry.events}
        slot={waitlistEntry.slots}
        isWaitlist={true}
      />
    );
  }

  return (
    <ManageSignupClient
      signup={signup}
      event={signup.events}
      slot={signup.slots}
      isWaitlist={false}
    />
  );
}
