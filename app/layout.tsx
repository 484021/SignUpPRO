import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ClerkProvider } from "@clerk/nextjs"
import { Footer } from "@/components/footer"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SignUpPRO - Simple Event Management",
  description:
    "Create events with slots, manage recurring schedules, and let participants sign up instantly—no accounts required.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const hasClerkKeys =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== ""

  const content = (
    <html lang="en">
      <body className={`font-sans antialiased flex flex-col min-h-screen`}>
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  )

  // If Clerk keys are present, wrap with ClerkProvider
  if (hasClerkKeys) {
    return (
      <ClerkProvider
        appearance={{
          elements: {
            // Remove Clerk branding globally
            footer: "hidden",
          },
        }}
      >
        {content}
      </ClerkProvider>
    )
  }

  // Otherwise render without ClerkProvider
  return content
}
