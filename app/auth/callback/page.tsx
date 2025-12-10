"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Auth callback started");
        const supabase = createClient();

        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const searchParams = new URLSearchParams(window.location.search);

        // Check for error in either hash or search params
        const errorParam = hashParams.get("error") || searchParams.get("error");
        const errorDescription =
          hashParams.get("error_description") ||
          searchParams.get("error_description");

        if (errorParam && errorParam !== "invalid_request") {
          console.error("Auth callback error:", errorParam, errorDescription);
          setError(errorDescription || errorParam);
          setTimeout(() => router.push("/sign-in"), 3000);
          return;
        }

        // Try to get the auth code from search params
        const code = searchParams.get("code");
        if (code) {
          console.log("Exchanging code for session...");
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (
            exchangeError &&
            !exchangeError.message.includes("code verifier")
          ) {
            console.error("Code exchange error:", exchangeError);
            setError(exchangeError.message);
            setTimeout(() => router.push("/sign-in"), 3000);
            return;
          }

          if (data?.session) {
            console.log(
              "[v0] Session established for user:",
              data.session.user.email
            );
            console.log("[v0] Redirecting to dashboard...");
            router.replace("/dashboard");
            return;
          }
        }

        console.log("[v0] Checking for existing session...");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[v0] Session error:", sessionError);
          setError(sessionError.message);
          setTimeout(() => router.push("/sign-in"), 3000);
          return;
        }

        if (session) {
          console.log(
            "[v0] Existing session found for user:",
            session.user.email
          );
          console.log("[v0] Redirecting to dashboard...");
          router.replace("/dashboard");
        } else {
          console.error("[v0] No session or code found");
          setError("Authentication failed. Please try again.");
          setTimeout(() => router.push("/sign-in"), 3000);
        }
      } catch (err) {
        console.error("[v0] Callback error:", err);
        setError("An unexpected error occurred");
        setTimeout(() => router.push("/sign-in"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-destructive mb-2">Authentication Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-4">
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign in...</p>
        <p className="text-xs text-muted-foreground mt-2">
          You will be redirected to the dashboard
        </p>
      </div>
    </div>
  );
}
