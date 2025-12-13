import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "No session ID provided" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    const subscription = session.subscription as Stripe.Subscription;

    if (!subscription) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // Update user in database
    const supabase = createServiceRoleClient();
    
    console.log("Updating user plan:", {
      clerk_id: user.id,
      plan: "monthly",
      stripe_customer_id: session.customer,
      stripe_subscription_id: subscription.id,
    });

    const { data: updatedUser, error: updateError } = await supabase
      .from("users")
      .update({
        plan: "monthly",
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
      })
      .eq("clerk_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating user plan:", updateError);
      console.error("Update error details:", JSON.stringify(updateError, null, 2));
      return NextResponse.json(
        { error: "Failed to update user plan", details: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedUser) {
      console.error("No user found to update with clerk_id:", user.id);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    console.log("Successfully updated user plan:", updatedUser);
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Error processing payment success:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payment" },
      { status: 500 }
    );
  }
}
