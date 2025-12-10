import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Mock: In production, save to database
    const newSlot = {
      id: `slot_${Date.now()}`,
      ...data,
      available: data.capacity,
      order: 0,
    }

    return NextResponse.json(newSlot, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 })
  }
}
