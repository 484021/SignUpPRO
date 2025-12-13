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

    const clerkId = user.id;

    // Get user from database
    const supabase = createServiceRoleClient();
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, email, stripe_customer_id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !dbUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customerId = dbUser.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: dbUser.email || user.emailAddresses[0]?.emailAddress,
        metadata: {
          clerk_id: clerkId,
          user_id: dbUser.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("clerk_id", clerkId);
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_MONTHLY!,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
      metadata: {
        clerk_id: clerkId,
        user_id: dbUser.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
