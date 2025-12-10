import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Mock: In production, duplicate event in database
    const newEventId = `evt_${Date.now()}_copy`

    return NextResponse.json({
      id: newEventId,
      message: "Event duplicated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to duplicate event" }, { status: 500 })
  }
}
