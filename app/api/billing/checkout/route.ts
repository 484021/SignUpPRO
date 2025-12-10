import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { plan } = await request.json()

    // Mock: In production, create Stripe checkout session
    const mockCheckoutUrl = "https://checkout.stripe.com/demo"

    return NextResponse.json({
      success: true,
      checkoutUrl: mockCheckoutUrl,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
