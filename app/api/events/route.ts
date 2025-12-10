import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Mock: In production, validate and save to database
    const newEvent = {
      id: `evt_${Date.now()}`,
      organizerId: "user_1",
      ...data,
      status: "open" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
