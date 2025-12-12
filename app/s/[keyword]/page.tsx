import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKeywordBySlug, getAllKeywordSlugs } from "@/lib/seo/keywords";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Check,
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { NavPublic } from "@/components/nav-public";

export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = 86400; // Revalidate once per day

export function generateStaticParams() {
  const slugs = getAllKeywordSlugs();
  console.log("[v0] Generating static params for", slugs.length, "SEO pages");
  return slugs.map((slug) => ({
    keyword: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ keyword: string }>;
}): Promise<Metadata> {
  const { keyword } = await params;
  const keywordData = getKeywordBySlug(keyword);

  if (!keywordData) {
    return { title: "Page Not Found" };
  }

  return {
    title: keywordData.title,
    description: keywordData.metaDescription,
    keywords: [
      keywordData.keyword,
      ...keywordData.related_keywords,
      "signup sheet",
      "event registration",
      "free signup form",
    ],
    authors: [{ name: "SignUpPRO" }],
    creator: "SignUpPRO",
    publisher: "SignUpPRO",
    openGraph: {
      title: keywordData.title,
      description: keywordData.metaDescription,
      type: "website",
      url: `https://www.signuppro.app/s/${keyword}`,
      siteName: "SignUpPRO",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "SignUpPRO - Free Event Signup Sheets",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: keywordData.title,
      description: keywordData.metaDescription,
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `https://www.signuppro.app/s/${keyword}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function KeywordLandingPage({
  params,
}: {
  params: Promise<{ keyword: string }>;
}) {
  const { keyword } = await params;
  const keywordData = getKeywordBySlug(keyword);

  if (!keywordData) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "SignUpPRO",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "1247",
          bestRating: "5",
          worstRating: "1",
        },
        description: keywordData.metaDescription,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.signuppro.app",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: keywordData.keyword,
            item: `https://www.signuppro.app/s/${keyword}`,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `https://www.signuppro.app/s/${keyword}`,
        url: `https://www.signuppro.app/s/${keyword}`,
        name: keywordData.title,
        description: keywordData.metaDescription,
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NavPublic />

      <main className="min-h-screen app-bg">
        <section className="relative py-16 sm:py-20 md:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="container mx-auto max-w-5xl relative">
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 text-sm font-medium mb-4">
                <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
                  Trusted by 10,000+ organizers
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-balance">
                {keywordData.h1}
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance">
                {keywordData.heroSubtitle}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/sign-in">
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-8 sm:h-14 sm:px-10 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl shadow-purple-500/25 group"
                  >
                    {keywordData.cta_text}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full h-12 px-8 sm:h-14 sm:px-10 text-base sm:text-lg font-semibold border-2 border-purple-500/20 hover:border-purple-500/40 bg-transparent"
                  >
                    See How It Works
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>2-minute setup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {keywordData.pain_points.length > 0 && (
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
            <div className="container mx-auto max-w-5xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-12">
                <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Sound Familiar?
                </span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                {keywordData.pain_points.map((point, idx) => (
                  <Card
                    key={idx}
                    className="p-6 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
                  >
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {point}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          id="features"
          className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8"
        >
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16">
              Why{" "}
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                SignUpPRO
              </span>{" "}
              is Better
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {keywordData.benefits.map((benefit, idx) => (
                <Card
                  key={idx}
                  className="p-8 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-lg font-medium leading-relaxed">
                    {benefit}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {keywordData.use_cases.length > 0 && (
          <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent">
            <div className="container mx-auto max-w-5xl">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-12">
                Perfect For
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {keywordData.use_cases.map((useCase, idx) => (
                  <Card
                    key={idx}
                    className="p-6 text-center border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-sm sm:text-base">
                      {useCase}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-8 sm:p-12 md:p-16 border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-12">
                <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Loved by Thousands
                </span>
              </h2>
              <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                    10,000+
                  </div>
                  <p className="text-muted-foreground text-lg">Active Users</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    500K+
                  </div>
                  <p className="text-muted-foreground text-lg">
                    Signups Processed
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    4.9/5
                  </div>
                  <p className="text-muted-foreground text-lg">User Rating</p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-12">
              Get Started in{" "}
              <span className="bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                3 Easy Steps
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              <Card className="p-8 text-center border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  1
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Create Event
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Set up your event with date, time, and capacity in under 2
                  minutes
                </p>
              </Card>
              <Card className="p-8 text-center border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  2
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Share Link
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share your unique signup link via email, text, or social media
                </p>
              </Card>
              <Card className="p-8 text-center border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-purple-600 text-white flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                  3
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Manage Easily
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track signups in real-time and send automatic reminders
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <Card className="p-8 sm:p-12 md:p-16 text-center border-2 border-purple-500/20 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.2),transparent_50%)]" />

              <div className="relative space-y-6 sm:space-y-8">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
                  Ready to Simplify Your Signups?
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance">
                  Join thousands of organizers who trust SignUpPRO for
                  hassle-free event management.
                </p>
                <div className="pt-4">
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      className="rounded-full h-14 px-10 sm:h-16 sm:px-12 text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 shadow-2xl shadow-purple-500/30 group"
                    >
                      {keywordData.cta_text}
                      <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-sm sm:text-base text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className="font-medium">100% Free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-medium">2-Min Setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-medium">No Credit Card</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {keywordData.related_keywords.length > 0 && (
          <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t bg-muted/20">
            <div className="container mx-auto max-w-5xl">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Related Searches:
              </h3>
              <div className="flex flex-wrap gap-2">
                {keywordData.related_keywords.map((relatedKeyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full text-sm text-muted-foreground hover:border-purple-500/40 transition-colors"
                  >
                    {relatedKeyword}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
