"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setStatus("error");
      setError("No session ID found");
      return;
    }

    // Process the payment
    fetch("/api/billing/process-success", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          setStatus("error");
          setError(data.error || "Payment verification failed");
        }
      })
      .catch((err) => {
        console.error("Error processing payment:", err);
        setStatus("error");
        setError("Failed to verify payment");
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto" />
              <div>
                <h1 className="text-2xl font-black mb-2">
                  Processing payment...
                </h1>
                <p className="text-muted-foreground">
                  Please wait while we verify your subscription.
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-3xl font-black mb-2">
                  Welcome to Monthly Plan!
                </h1>
                <p className="text-muted-foreground">
                  Your subscription is now active.
                  <br />
                  You can now create unlimited events.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Redirecting to dashboard...
                </div>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                Go to Dashboard
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
                <svg
                  className="w-8 h-8 text-red-600"
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
              <div>
                <h1 className="text-2xl font-black mb-2">Payment Error</h1>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <Button
                onClick={() => router.push("/upgrade")}
                variant="outline"
                className="w-full h-11 rounded-xl"
              >
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
