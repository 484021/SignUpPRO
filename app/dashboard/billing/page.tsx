"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, ExternalLink } from "lucide-react"
import { MOCK_USER } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { PricingTable } from "@/components/pricing-table"

export default function BillingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const user = MOCK_USER

  const [isUpgrading, setIsUpgrading] = useState(false)

  const handleUpgrade = async () => {
    setIsUpgrading(true)

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      })

      const data = await response.json()

      if (response.ok) {
        // Mock: In production, redirect to Stripe checkout
        toast({
          title: "Redirecting to checkout...",
          description: "You'll be redirected to complete your purchase.",
        })

        // Simulate redirect delay
        setTimeout(() => {
          toast({
            title: "Demo Mode",
            description: "In production, you'd be redirected to Stripe checkout.",
          })
          setIsUpgrading(false)
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout",
        variant: "destructive",
      })
      setIsUpgrading(false)
    }
  }

  const handleManageBilling = () => {
    // Mock: In production, redirect to Stripe billing portal
    toast({
      title: "Demo Mode",
      description: "In production, you'd be redirected to the Stripe billing portal.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Current Plan */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your plan and billing information</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Current Plan:{" "}
                  <Badge variant={user.plan === "pro" ? "default" : "secondary"}>{user.plan.toUpperCase()}</Badge>
                  {user.plan === "pro" && <Crown className="w-5 h-5 text-yellow-500" />}
                </CardTitle>
                <CardDescription className="mt-2">
                  {user.plan === "free"
                    ? "Upgrade to Pro for unlimited events and advanced features"
                    : "You have access to all Pro features"}
                </CardDescription>
              </div>
              {user.plan === "pro" && (
                <Button variant="outline" onClick={handleManageBilling} className="bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
              )}
            </div>
          </CardHeader>
          {user.plan === "free" && (
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{user.activeEventsCount} / 5 events used</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{user.signupsThisMonth} / 50 signups this month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>{user.recurringSeriesCount} / 1 recurring series</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Pricing Plans */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Available Plans</h2>
          <PricingTable currentPlan={user.plan} onUpgrade={handleUpgrade} isUpgrading={isUpgrading} />
        </div>
      </main>
    </div>
  )
}
