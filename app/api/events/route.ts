import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

async function getCurrentUserId(): Promise<string | null> {
  if (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  ) {
    try {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      return user?.id || null;
    } catch (error) {
      return null;
    }
  }
  return "demo-user";
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const supabase = createServiceRoleClient();
    const { data: dbUser } = await supabase
      .from("users")
      .select("plan")
      .eq("clerk_id", userId)
      .maybeSingle();

    // MONETIZATION GUARD: Check event limit for free plan
    if (dbUser?.plan === "free") {
      const { data: existingEvents } = await supabase
        .from("events")
        .select("id")
        .eq("clerk_id", userId)
        .in("status", ["open", "draft"]);

      if (existingEvents && existingEvents.length >= 1) {
        return NextResponse.json(
          {
            error: "UPGRADE_REQUIRED",
            message:
              "Free plan limited to 1 active event. Upgrade to create more.",
          },
          { status: 403 }
        );
      }
    }

    const data = await request.json();

    // Mock: In production, validate and save to database
    const newEvent = {
      id: `evt_${Date.now()}`,
      organizerId: userId,
      ...data,
      status: "open" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
