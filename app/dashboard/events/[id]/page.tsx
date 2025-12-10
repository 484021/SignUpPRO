import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { getEvent } from "@/lib/actions/events";
import { format, parseISO } from "date-fns";
import { RecurringEventManager } from "@/components/recurring-event-manager";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const eventData = await getEvent(id);

  if (!eventData || !eventData.event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event not found</h1>
          <p className="text-muted-foreground mb-6">
            This event may have been deleted or the link is incorrect.
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { event, slots, signups, waitlist } = eventData;

  const isRecurring = !!(event.recurrence_rule || event.recurrenceRule);

  const dateRangeText =
    isRecurring && (event.recurrence_rule || event.recurrenceRule)
      ? (() => {
          const rule = event.recurrence_rule || event.recurrenceRule;
          const startDate = format(parseISO(event.date), "EEE MMM d, yyyy");
          const endDate = rule.until
            ? format(parseISO(rule.until), "EEE MMM d, yyyy")
            : "Ongoing";
          return `${startDate} - ${endDate}`;
        })()
      : format(parseISO(event.date), "PPP p");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <Badge>{event.status}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">{dateRangeText}</div>

            {event.description && (
              <p className="text-sm text-muted-foreground max-w-3xl">
                {event.description}
              </p>
            )}
          </div>

          <Link href={`/signup/${event.slug}`} target="_blank">
            <Button variant="outline" className="bg-transparent">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Page
            </Button>
          </Link>
        </div>

        <RecurringEventManager
          event={event}
          slots={slots}
          signups={signups}
          waitlist={waitlist}
        />
      </main>
    </div>
  );
}
