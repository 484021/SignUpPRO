import Link from "next/link";
import { NavDashboard } from "@/components/nav-dashboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="min-h-screen app-bg">
        <NavDashboard />
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
    <div className="min-h-screen app-bg">
      <NavDashboard />
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="rounded-2xl shadow-md">
            <CardContent className="py-8 px-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                      {event.title}
                    </h1>
                    <Badge className="py-1 px-3 rounded-md text-xs uppercase tracking-wide">
                      {event.status}
                    </Badge>
                  </div>
                  <div className="text-base text-muted-foreground font-medium">
                    {dateRangeText}
                  </div>

                  {event.description && (
                    <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>

                <Link href={`/signup/${event.slug}`} target="_blank">
                  <Button variant="outline" className="rounded-xl h-10">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Public Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <RecurringEventManager
            event={event}
            slots={slots}
            signups={signups}
            waitlist={waitlist}
          />
        </div>
      </main>
    </div>
  );
}
