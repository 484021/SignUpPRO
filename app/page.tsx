"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { NavPublic } from "@/components/nav-public";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBolt,
  faCircleCheck,
  faCirclePlay,
  faFeatherPointed,
  faLink,
  faShieldHalved,
  faSpinner,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { theme } = useThemeToggle();
  const { isSignedIn, isLoaded } = useUser();
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "";

  useEffect(() => {
    // Redirect logged-in users to dashboard
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const handleAuthCode = async () => {
      const code = searchParams.get("code");

      if (code) {
        setIsAuthenticating(true);
        console.log(
          "Auth code detected on homepage, exchanging for session..."
        );
        const supabase = createClient();

        try {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error("Code exchange error:", error);
            setIsAuthenticating(false);
            router.push("/sign-in");
            return;
          }

          if (data?.session) {
            console.log(
              "Session created successfully, redirecting to dashboard..."
            );
            router.push("/dashboard");
          }
        } catch (err) {
          console.error("Auth code handling error:", err);
          setIsAuthenticating(false);
          router.push("/sign-in");
        }
      }
    };

    handleAuthCode();
  }, [searchParams, router]);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-slate-100 to-white text-slate-900 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20 dark:text-white">
        <div className="text-center space-y-6">
          <div className="text-5xl font-bold mx-auto animate-pulse bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
            SignUpPRO
          </div>
          <div className="space-y-2">
            <FontAwesomeIcon
              icon={faSpinner}
              className="w-8 h-8 animate-spin text-blue-600 dark:text-purple-600 mx-auto"
            />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent dark:from-purple-600 dark:to-cyan-600">
              Signing you in...
            </h2>
            <p className="text-muted-foreground">Just a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-[#f5f7fb] to-white text-slate-900 dark:from-black dark:via-[#0b0f14] dark:to-black dark:text-white">
        <NavPublic />

        {/* Hero */}
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.15),transparent_40%)]" />
          <motion.div
            className="container relative mx-auto max-w-6xl grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.2,
                },
              },
            }}
          >
            <motion.div
              className="space-y-8"
              variants={{
                hidden: { opacity: 0, x: -60, scale: 0.8 },
                visible: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    duration: 0.8,
                  },
                },
              }}
            >
              <motion.div
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm text-slate-700 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                variants={{
                  hidden: { opacity: 0, y: -20, scale: 0.9 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 120,
                      damping: 15,
                    },
                  },
                }}
              >
                Minimalist • Fast • Reliable
              </motion.div>
              <motion.div
                className="space-y-4"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
              >
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-snug sm:leading-tight tracking-tight text-slate-900 dark:text-white"
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.85 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 90,
                        damping: 18,
                        duration: 0.9,
                      },
                    },
                  }}
                >
                  Stop wasting time managing signups in{" "}
                  <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                    Instagram
                  </span>
                  ,{" "}
                  <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                    WhatsApp
                  </span>
                  , or{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    Messenger
                  </span>
                  .
                </motion.h1>
                <motion.p
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-700 dark:text-white/80 max-w-2xl leading-relaxed font-medium"
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                      },
                    },
                  }}
                >
                  You're tired of reposting lists, fixing edits, and answering the same questions over and over. Create one clean signup link and share it once.
                </motion.p>
              </motion.div>
              <motion.div
                className="flex flex-wrap items-center gap-3 sm:gap-4"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                    },
                  },
                }}
              >
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    className="h-11 sm:h-12 md:h-14 px-5 sm:px-7 md:px-8 rounded-full text-sm sm:text-base font-semibold bg-black text-white hover:bg-black/90 shadow-[0_10px_50px_-20px_rgba(0,0,0,0.4)] dark:bg-white dark:text-black dark:hover:bg-white/90 dark:shadow-[0_10px_50px_-20px_rgba(255,255,255,0.6)]"
                  >
                    Create Signup
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="w-3.5 h-3.5 ml-2"
                    />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 sm:h-12 md:h-14 px-5 sm:px-7 md:px-8 rounded-full text-sm sm:text-base border-slate-300 text-slate-800 hover:bg-white/80 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                  >
                    See how it works
                    <FontAwesomeIcon
                      icon={faCirclePlay}
                      className="w-3.5 h-3.5 ml-2"
                    />
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-600 dark:text-white/70"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 110,
                      damping: 22,
                    },
                  },
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-300"
                  />
                  <span className="hidden sm:inline">
                    Trusted by sports clubs, classes, and community organizers
                  </span>
                  <span className="sm:hidden">
                    Trusted by sports clubs & community
                  </span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-300"
                  />
                  3,000+ signups
                </span>
                <span className="inline-flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    className="w-4 h-4 flex-shrink-0 text-blue-500 dark:text-blue-300"
                  />
                  99.9% uptime
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              variants={{
                hidden: { opacity: 0, x: 60, scale: 0.8 },
                visible: {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 95,
                    damping: 22,
                    duration: 0.85,
                  },
                },
              }}
            >
              <div className="absolute -inset-6 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.14),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.12),transparent_45%)] blur-3xl" />
              <Card className="relative bg-white border border-slate-200 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden dark:bg-white/5 dark:border-white/10">
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between text-sm text-slate-600 dark:text-white/70">
                    <span>Live Preview</span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700 dark:bg-white/10 dark:border-white/10 dark:text-white/80">
                      <FontAwesomeIcon
                        icon={faBolt}
                        className="w-3 h-3 text-blue-500 dark:text-blue-300"
                      />
                      Under 10s setup
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-inner dark:border-white/10 dark:bg-black/40">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-white/50">
                        Event name
                      </label>
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 flex items-center gap-3 dark:border-white/15 dark:bg-white/5 dark:text-white/90">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)]" />
                        <span className="font-semibold">
                          Saturday Badminton Ladder
                        </span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { name: "Slots", value: "Doubles / Singles" },
                        { name: "Capacity", value: "24 players" },
                        { name: "Visibility", value: "Link only" },
                        { name: "Status", value: "Accepting" },
                      ].map((item) => {
                        const isStatus = item.name === "Status";
                        return (
                          <div
                            key={item.name}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 flex items-center justify-between gap-3 min-h-[64px] dark:border-white/10 dark:bg-white/5 dark:text-white/80"
                          >
                            <span className="text-slate-700 dark:text-white/70">
                              {item.name}
                            </span>
                            <span
                              className={`text-slate-900 font-semibold dark:text-white leading-tight whitespace-nowrap ${
                                isStatus
                                  ? "px-3 py-1 rounded-full bg-slate-100 border border-slate-200 dark:bg-white/10 dark:border-white/10"
                                  : ""
                              }`}
                            >
                              {item.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 dark:border-white/10 dark:bg-white/5">
                      <div className="flex items-center justify-between text-slate-800 dark:text-white/80 text-sm">
                        <span>Attendees</span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs">
                          12 / 24 confirmed
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {["AO", "BK", "CM", "DS", "+8"].map((person) => (
                          <div
                            key={person}
                            className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-900 dark:bg-white/10 dark:border-white/10 dark:text-white"
                          >
                            {person}
                          </div>
                        ))}
                      </div>
                      <Button className="w-full rounded-xl bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                        Share signup link
                        <FontAwesomeIcon
                          icon={faLink}
                          className="w-4 h-4 ml-2"
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f4f6fb] via-white to-white dark:from-[#0b0f14] dark:via-black dark:to-black"
        >
          <div className="container mx-auto max-w-5xl space-y-12">
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                Create a signup in under 10 seconds
              </h2>
              <p className="text-slate-600 dark:text-white/60 text-lg max-w-2xl mx-auto">
                Speed, simplicity, reliability — nothing else. Organizers stay
                focused, attendees sign up instantly.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Name it",
                  body: "Type your event title. We set the structure for you — slots, capacity, and time.",
                  icon: faFeatherPointed,
                },
                {
                  title: "Share it",
                  body: "Send one clean link. Attendees join without accounts, on any device.",
                  icon: faLink,
                },
                {
                  title: "Track it",
                  body: "Live updates, auto waitlists, and protected edits keep everything orderly.",
                  icon: faShieldHalved,
                },
              ].map((item, idx) => (
                <Card
                  key={item.title}
                  className="group relative h-full overflow-hidden rounded-2xl border-slate-200 bg-white backdrop-blur-sm p-6 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
                  <div className="relative space-y-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 dark:bg-white/10 dark:border-white/10 dark:text-white">
                      <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-white/50">
                      Step {idx + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-white/70 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Organizers & attendees */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#05070b]">
          <div className="container mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                For organizers
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Precision over clutter.
              </h3>
              <p className="text-slate-600 dark:text-white/65 text-lg">
                Build the exact list you need. Lock duplicates, control time
                zones, and keep every slot intentional.
              </p>
              <div className="space-y-4">
                {[
                  "Create and publish in under 10 seconds.",
                  "Auto-enforced rules prevent double booking and confusion.",
                  "Instant edits sync to everyone — no refresh needed.",
                ].map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 text-slate-700 dark:text-white/75"
                  >
                    <FontAwesomeIcon
                      icon={faCircleCheck}
                      className="mt-1 w-4 h-4 text-blue-500 dark:text-blue-300"
                    />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-white/60">
                <span className="rounded-full border border-slate-200 px-4 py-2 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  Magic link + Google
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  CSV export
                </span>
                <span className="rounded-full border border-slate-200 px-4 py-2 bg-slate-50 dark:border-white/10 dark:bg-white/5">
                  Auto waitlist
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                For attendees
              </p>
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Zero friction signups.
              </h3>
              <p className="text-slate-600 dark:text-white/65 text-lg">
                No accounts, no clutter. A single, beautiful page that makes
                committing effortless.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    label: "One link",
                    desc: "Sign up from chat, email, or QR.",
                  },
                  {
                    label: "Instant status",
                    desc: "See availability in real time.",
                  },
                  {
                    label: "Smart updates",
                    desc: "Auto confirms and reminders.",
                  },
                  {
                    label: "Works everywhere",
                    desc: "Mobile-first, desktop-perfect.",
                  },
                ].map((item) => (
                  <Card
                    key={item.label}
                    className="rounded-xl border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="text-sm text-slate-600 dark:text-white/60">
                      {item.label}
                    </div>
                    <div className="text-slate-900 dark:text-white font-semibold mt-1">
                      {item.desc}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature pillars */}
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-[#f4f6fb] to-white dark:from-black dark:via-[#0b0f14] dark:to-black">
          <div className="container mx-auto max-w-6xl space-y-12">
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-white/50">
                What matters
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Speed. Simplicity. Reliability.
              </h2>
              <p className="text-slate-600 dark:text-white/60 text-lg max-w-3xl mx-auto">
                No feature bloat. Just the three pillars that keep your events
                running without chaos.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Speed",
                  desc: "Launch in under 10 seconds. Instant updates as people join.",
                  accent: "from-[#4facfe] to-[#00f2fe]",
                },
                {
                  title: "Simplicity",
                  desc: "Minimal surfaces, no distractions. Every element is deliberate.",
                  accent: "from-[#ffffff] to-[#d9e6ff]",
                },
                {
                  title: "Reliability",
                  desc: "Protected edits, auto waitlists, real-time locks — no duplicates or confusion.",
                  accent: "from-[#4f7cff] to-[#2fb8ff]",
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="rounded-2xl border-slate-200 bg-white p-[1px] dark:border-white/10 dark:bg-white/5"
                >
                  <div className="rounded-2xl h-full w-full bg-white px-6 py-6 flex flex-col gap-4 dark:bg-black/80">
                    <div
                      className={`h-1 w-16 rounded-full bg-gradient-to-r ${item.accent}`}
                    />
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-white/65 leading-relaxed flex-1">
                      {item.desc}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(79,124,255,0.12),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(111,201,255,0.14),transparent_45%)]" />
          <div className="container mx-auto max-w-5xl relative">
            <Card className="rounded-3xl border-slate-200 bg-white backdrop-blur-xl p-10 sm:p-12 text-center space-y-6 shadow-xl dark:border-white/10 dark:bg-white/5">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Free forever for simple events.
              </h2>
              <p className="text-slate-600 dark:text-white/65 text-lg max-w-2xl mx-auto">
                Upgrade only if you need more. Start now, share a link in
                seconds, and keep your players, students, and members in sync.
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link href="/sign-in">
                  <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-black text-white font-semibold hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90">
                    Create Signup
                    <FontAwesomeIcon
                      icon={faArrowRight}
                      className="w-4 h-4 ml-2"
                    />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    variant="outline"
                    className="h-12 sm:h-14 px-6 sm:px-8 rounded-full border-slate-300 text-slate-800 hover:bg-white/80 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
                  >
                    See how it works
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
