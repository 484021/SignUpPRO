"use client";

import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Plus, Calendar, Sparkles } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { OnboardingModal } from "@/components/onboarding-modal";
import { NavDashboard } from "@/components/nav-dashboard";

interface DashboardClientProps {
  events: any[];
}

export function DashboardClient({ events }: DashboardClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarding_complete");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const eventCount = events.length;

  return (
    <div className="min-h-screen bg-background">
      <NavDashboard />
      <main className="container mx-auto px-4 pt-24 pb-10">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="py-8 px-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground mt-2 text-lg">
                    {eventCount === 0
                      ? "Ready to create your first event?"
                      : `Managing ${eventCount} ${eventCount === 1 ? "event" : "events"}`}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {eventCount === 0 && (
                    <Badge className="bg-linear-to-r from-purple-500 to-blue-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      New
                    </Badge>
                  )}

                  <Link href="/dashboard/events/new">
                    <Button className="rounded-xl bg-linear-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Your Events</h2>

            {events.length === 0 ? (
              <Card className="border-2 border-dashed border-muted-foreground/20 rounded-xl">
                <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-500/15 to-blue-500/15 flex items-center justify-center mb-6">
                    <Calendar className="w-12 h-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">No events yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg">
                    Create your first event and start collecting signups in
                    seconds. No credit card required.
                  </p>
                  <Link href="/dashboard/events/new">
                    <Button
                      size="lg"
                      className="rounded-xl bg-linear-to-r from-purple-600 to-blue-600"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          <OnboardingModal
            open={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
        </div>
      </main>
    </div>
  );
}
