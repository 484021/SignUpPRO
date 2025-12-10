import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Mock: In production, add to waitlist table
    const newEntry = {
      id: `wait_${Date.now()}`,
      ...data,
      position: 1, // Calculate actual position
      createdAt: new Date(),
    }

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to waitlist" }, { status: 500 })
  }
}
