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
import { Plus, Calendar, Users, TrendingUp, Zap } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { OnboardingModal } from "@/components/onboarding-modal";
import { NavDashboard } from "@/components/nav-dashboard";
import { motion } from "framer-motion";
import type { Event } from "@/lib/types";

interface DashboardClientProps {
  events: Event[];
}

export function DashboardClient({ events }: DashboardClientProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const isExpired = (event: Event) => {
    const end = event.end_time
      ? new Date(event.end_time)
      : new Date(event.date);
    return end.getTime() < Date.now();
  };

  const upcomingEvents = events.filter((event) => !isExpired(event));

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarding_complete");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const eventCount = upcomingEvents.length;

  // Calculate quick stats
  const activeEvents = upcomingEvents.filter((e) => e.status === "open").length;

  const totalSignups = upcomingEvents.reduce((sum, event) => {
    const eventSignups =
      event.signups?.filter((s) => s.status === "confirmed").length || 0;
    return sum + eventSignups;
  }, 0);

  const todaySignups = upcomingEvents.reduce((sum, event) => {
    const today = new Date().toDateString();
    const todayCount = (event.signups || []).filter((s) => {
      if (s.status !== "confirmed") return false;
      const signupDate = new Date(
        s.created_at || s.createdAt || ""
      ).toDateString();
      return signupDate === today;
    }).length;
    return sum + todayCount;
  }, 0);

  return (
    <div className="min-h-screen app-bg">
      <NavDashboard />
      <main className="container mx-auto px-4 pt-28 pb-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {eventCount === 0
                  ? "Create your first event and stop managing signups in Instagram, WhatsApp, or Messenger"
                  : `${eventCount} ${eventCount === 1 ? "event" : "events"} • ${totalSignups} total signups`}
              </p>
            </div>

            <Link href="/dashboard/events/new" className="shrink-0">
              <Button
                size="lg"
                className="rounded-xl h-12 px-6 bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold shadow-lg w-full md:w-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </Link>
          </motion.div>

          {/* Quick Stats Grid */}
          {eventCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-3 gap-3 sm:gap-4"
            >
              {[
                {
                  label: "Active Events",
                  value: activeEvents,
                  icon: Calendar,
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  label: "Total Signups",
                  value: totalSignups,
                  icon: Users,
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  label: "Today",
                  value: todaySignups,
                  icon: TrendingUp,
                  color: "text-emerald-600 dark:text-emerald-400",
                },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
                  >
                    <Card className="rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-sm">
                      <CardContent className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs sm:text-sm text-muted-foreground font-medium leading-tight">
                            {stat.label}
                          </span>
                          <Icon
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${stat.color}`}
                          />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black tracking-tight">
                          {stat.value}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Events Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold tracking-tight">Events</h2>

            {upcomingEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl overflow-hidden">
                  <CardContent className="flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-500/20">
                      <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-8 max-w-sm text-base">
                      Create your first event and stop managing signup lists in Instagram, WhatsApp, or Messenger. Share one clean link instead of reposting lists over and over.
                    </p>
                    <Link href="/dashboard/events/new">
                      <Button
                        size="lg"
                        className="rounded-xl bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 font-semibold h-11 px-6"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Event
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                {upcomingEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 + idx * 0.03 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.section>

          <OnboardingModal
            open={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
        </div>
      </main>
    </div>
  );
}
