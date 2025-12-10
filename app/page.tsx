"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowRight, Check, Users, Zap, Shield, Loader2 } from "lucide-react"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/client"
import { ClerkSetupBanner } from "@/components/clerk-setup-banner"

export default function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== ""

  useEffect(() => {
    const handleAuthCode = async () => {
      const code = searchParams.get("code")

      if (code) {
        setIsAuthenticating(true)
        console.log("Auth code detected on homepage, exchanging for session...")
        const supabase = createClient()

        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            console.error("Code exchange error:", error)
            setIsAuthenticating(false)
            router.push("/sign-in")
            return
          }

          if (data?.session) {
            console.log("Session created successfully, redirecting to dashboard...")
            router.push("/dashboard")
          }
        } catch (err) {
          console.error("Auth code handling error:", err)
          setIsAuthenticating(false)
          router.push("/sign-in")
        }
      }
    }

    handleAuthCode()
  }, [searchParams, router])

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
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {!hasClerkKeys && <ClerkSetupBanner />}

      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="text-sm sm:text-base font-semibold">SignUpPRO</span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/sign-in"
                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link href="/sign-in">
                <Button
                  size="sm"
                  className="rounded-full h-8 px-3 sm:h-9 sm:px-5 text-xs sm:text-sm bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

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

      <section className="pb-16 sm:pb-20 md:pb-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 animate-gradient" />
        <div className="container mx-auto max-w-6xl">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl" />

            <Card className="relative overflow-hidden border-2 border-purple-500/20 shadow-2xl shadow-purple-500/10">
              <div className="aspect-[16/10] sm:aspect-[16/9] bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-purple-950/30 dark:via-blue-950/30 dark:to-cyan-950/30 p-4 sm:p-8 md:p-12">
                <div className="h-full bg-background rounded-xl sm:rounded-2xl border-2 border-purple-500/20 shadow-2xl overflow-hidden">
                  <div className="h-full flex flex-col">
                    <div className="border-b-2 border-purple-500/20 px-4 py-3 flex items-center gap-2 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600" />
                      </div>
                      <div className="flex-1 flex justify-center">
                        <div className="text-xs sm:text-sm text-muted-foreground font-mono bg-muted/50 px-4 py-1.5 rounded-lg border border-purple-500/20">
                          signuppro.com/s/badminton
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-hidden">
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                            Wednesday Badminton
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">Vision Center · 7:00 PM</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Signups</div>
                            <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                              18/24
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 rounded-xl p-4">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Available</div>
                            <div className="text-2xl sm:text-3xl font-bold text-cyan-600">6</div>
                          </div>
                          <div className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-4">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">Waitlist</div>
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600">2</div>
                          </div>
                        </div>

                        <div className="space-y-2 sm:space-y-3">
                          {["Alex Chen", "Sarah Park", "Michael Liu"].map((name, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gradient-to-r from-purple-500/5 to-blue-500/5 border border-purple-500/10 rounded-lg sm:rounded-xl hover:border-purple-500/30 transition-colors"
                            >
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex-shrink-0" />
                              <div className="flex-1 text-sm sm:text-base font-semibold truncate">{name}</div>
                              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-8 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Instant setup</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create events in seconds. No configuration needed.
              </p>
            </Card>

            <Card className="p-8 border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Live updates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Everyone sees real-time availability. Zero confusion.
              </p>
            </Card>

            <Card className="p-8 border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Always free</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unlimited everything. Built for community, not profit.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">FAQ</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">Everything you need to know</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem
              value="item-1"
              className="border-2 border-purple-500/20 rounded-2xl px-6 bg-gradient-to-br from-purple-500/5 to-transparent"
            >
              <AccordionTrigger className="text-lg sm:text-xl font-semibold hover:no-underline py-6">
                Is SignUpPRO really free?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Yes, completely free. No hidden fees, no credit card required. Unlimited events, unlimited signups.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="border-2 border-blue-500/20 rounded-2xl px-6 bg-gradient-to-br from-blue-500/5 to-transparent"
            >
              <AccordionTrigger className="text-lg sm:text-xl font-semibold hover:no-underline py-6">
                Do attendees need to create an account?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                No. They just click your link, enter their name and email, and they're signed up. It takes 10 seconds.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="border-2 border-cyan-500/20 rounded-2xl px-6 bg-gradient-to-br from-cyan-500/5 to-transparent"
            >
              <AccordionTrigger className="text-lg sm:text-xl font-semibold hover:no-underline py-6">
                Can I manage multiple events?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Yes. Create as many events as you need. Each gets its own shareable link and dashboard.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="border-2 border-purple-500/20 rounded-2xl px-6 bg-gradient-to-br from-purple-500/5 to-transparent"
            >
              <AccordionTrigger className="text-lg sm:text-xl font-semibold hover:no-underline py-6">
                What happens when an event fills up?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                New signups automatically go to a waitlist. If someone cancels, the first waitlist person gets notified.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="border-2 border-blue-500/20 rounded-2xl px-6 bg-gradient-to-br from-blue-500/5 to-transparent"
            >
              <AccordionTrigger className="text-lg sm:text-xl font-semibold hover:no-underline py-6">
                Can I export my signup list?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Yes. Download your attendee list as a CSV file anytime from your event dashboard.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-6"
              className="border-2 border-cyan-500/20 rounded-2xl px-6 bg-gradient-to-br from-cyan-500/5 to-transparent"
            >
              <AccordionTrigger className="text-lg sm:text-xl font-semibold hover:no-underline py-6">
                Do you send email notifications?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6">
                Yes. Attendees get confirmation emails when they sign up, and organizers get notified of new signups.
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
              <span className="text-xs sm:text-sm font-semibold">SignUpPRO</span>
            </div>
            <div className="flex gap-6 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <Link href="/sign-in" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/sign-in" className="hover:text-foreground transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
