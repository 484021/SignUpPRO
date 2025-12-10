import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock: In production, create Stripe billing portal session
    const mockPortalUrl = "https://billing.stripe.com/demo"

    return NextResponse.json({
      success: true,
      portalUrl: mockPortalUrl,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
