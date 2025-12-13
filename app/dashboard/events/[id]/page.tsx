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
      <main className="container mx-auto px-4 pt-28 pb-12 max-w-7xl">
        <div className="space-y-8">
          {/* Header Card */}
          <Card className="border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-start gap-3 flex-wrap">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                      {event.title}
                    </h1>
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground font-medium flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {dateRangeText}
                  </div>

                  {event.description && (
                    <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed pt-2">
                      {event.description}
                    </p>
                  )}
                </div>

                <Link
                  href={`/signup/${event.slug}`}
                  target="_blank"
                  className="shrink-0"
                >
                  <Button className="rounded-xl h-11 px-5 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold shadow-lg w-full md:w-auto">
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
