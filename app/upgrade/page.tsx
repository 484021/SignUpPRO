"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useState } from "react";

export default function UpgradePage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start checkout. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-xl">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-3xl font-black mb-2">Run unlimited events</h1>
            <p className="text-muted-foreground">
              Free organizers can run 1 active event.
              <br />
              Upgrade to stop managing signup lists in chats and run recurring events without the mess.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-4xl font-black">$19</span>
              <span className="text-muted-foreground">/month</span>
            </div>

            <ul className="space-y-3 text-left">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Unlimited active events</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Recurring event management</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              <>Upgrade — $19/month</>
            )}
          </Button>

          <p className="text-xs text-muted-foreground">
            Cancel anytime. No long-term commitment.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
