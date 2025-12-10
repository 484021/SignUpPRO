import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const hasClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "" &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== ""

export default async function middleware(request: NextRequest) {
  if (hasClerkKeys) {
    try {
      // Dynamically import Clerk only when it's configured
      const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server")

      const isProtectedRoute = createRouteMatcher([
        "/dashboard(.*)",
        "/dashboard/settings(.*)",
        "/dashboard/events(.*)",
        "/dashboard/analytics(.*)",
      ])

      return clerkMiddleware(async (auth, req) => {
        if (isProtectedRoute(req)) {
          await auth.protect()
        }
      })(request)
    } catch (error) {
      // Clerk middleware failed to initialize — allow request through in dev/demo environment
      // (Logged intentionally removed in cleanup)
      return NextResponse.next()
    }
  }

  // When Clerk is not configured, allow all requests
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
