import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getEvent, getEventAnalytics } from "@/lib/actions/events"
import { AnalyticsClient } from "@/components/analytics-client"

export default async function EventAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const eventData = await getEvent(id)
  const analytics = await getEventAnalytics(id)

  if (!eventData?.event || !analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics not available</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { event } = eventData

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="space-y-1">
          <Link href={`/dashboard/events/${id}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{event.title} Analytics</h1>
        </div>

        <AnalyticsClient analytics={analytics} />
      </main>
    </div>
  )
}
