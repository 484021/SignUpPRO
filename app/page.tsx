"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Check,
  Users,
  Zap,
  Shield,
  Loader2,
  Link2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { NavPublic } from "@/components/nav-public";
import { createClient } from "@/lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "";

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-cyan-950/20">
        <div className="text-center space-y-6">
          <Logo className="w-16 h-16 mx-auto animate-pulse" />
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Signing you in...
            </h2>
            <p className="text-muted-foreground">Just a moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <NavPublic />

      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-cyan-950/30 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.15),transparent_50%)]" />

        <div className="container mx-auto max-w-5xl relative">
          <div className="text-center space-y-6 sm:space-y-8">
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-[1.1] sm:leading-[1.05]">
              Event signups,
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                simplified
              </span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4">
              Share a link. Track signups in real-time. No spreadsheets.
            </p>
            <div className="pt-4 sm:pt-6">
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="rounded-full h-12 px-8 sm:h-14 sm:px-10 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl shadow-purple-500/25 group"
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Why organizers love SignUpPRO
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple, fast, and free. That's it.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                Instant setup
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Create events in seconds. No configuration needed.
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                Live updates
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Real-time availability. Everyone's always on the same page.
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                Always free
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                No credit card required. Unlimited everything.
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                Shareable link
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Send one link. Attendees need no account to sign up.
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Check className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                Auto waitlist
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Event full? Overflow goes to a waitlist automatically.
              </p>
            </Card>

            <Card className="p-8 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                Export data
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Download attendee lists as CSV anytime.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Got questions?
            </h2>
            <p className="text-lg text-muted-foreground">We've got answers</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem
              value="item-1"
              className="rounded-xl border px-6 bg-background"
            >
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                Is SignUpPRO really free?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Yes, completely free. No hidden fees, no credit card required.
                Unlimited events, unlimited signups.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="rounded-xl border px-6 bg-background"
            >
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                Do attendees need an account?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                No. They click your link, enter name and email, and done. No
                signup required.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="rounded-xl border px-6 bg-background"
            >
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                Can I manage multiple events?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Yes. Create as many events as you want. Each gets its own link
                and dashboard.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="rounded-xl border px-6 bg-background"
            >
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                What happens when an event fills up?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Signups go to a waitlist automatically. If someone cancels, the
                first waitlist person gets notified.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="rounded-xl border px-6 bg-background"
            >
              <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                Can I export my attendee list?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Yes. Download as CSV anytime from your event dashboard.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 md:py-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 animate-gradient" />
        <div className="container mx-auto max-w-4xl text-center space-y-8 sm:space-y-10 relative">
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-balance px-4">
            Start organizing{" "}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              today
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
            Join organizers who've ditched spreadsheets and group chat chaos.
          </p>
          <div className="pt-4 sm:pt-6">
            <Link href="/sign-in">
              <Button
                size="lg"
                className="rounded-full h-14 px-10 sm:h-16 sm:px-12 text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-2xl shadow-purple-500/30 group"
              >
                Create your first event
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-purple-500/5">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold">
                SignUpPRO
              </span>
            </div>
            <div className="flex gap-6 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <Link
                href="/sign-in"
                className="hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-in"
                className="hover:text-foreground transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
