"use client"

import { X } from "lucide-react"
import { useState } from "react"

export function ClerkSetupBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium">
            <strong>Clerk Authentication Setup Required:</strong> Add your Clerk API keys to enable authentication.
          </p>
          <p className="text-xs mt-1 opacity-90">
            Get your keys at{" "}
            <a
              href="https://dashboard.clerk.com/last-active?path=api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:opacity-80"
            >
              dashboard.clerk.com
            </a>{" "}
            and add them to your environment variables (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY)
          </p>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
