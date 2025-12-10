"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Crown, Loader2 } from "lucide-react"
import { PRICING } from "@/lib/mock-data"
import type { UserPlan } from "@/lib/types"

interface PricingTableProps {
  currentPlan?: UserPlan
  onUpgrade?: () => void
  isUpgrading?: boolean
}

export function PricingTable({ currentPlan, onUpgrade, isUpgrading }: PricingTableProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
      {/* Free Plan */}
      <Card className={currentPlan === "free" ? "border-primary" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>{PRICING.free.name}</CardTitle>
            {currentPlan === "free" && <Check className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${PRICING.free.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <CardDescription>Perfect for getting started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PRICING.free.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          {currentPlan === "free" ? (
            <Button variant="outline" className="w-full bg-transparent" disabled>
              Current Plan
            </Button>
          ) : (
            <Button variant="outline" className="w-full bg-transparent" disabled>
              Downgrade
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pro Plan */}
      <Card className={currentPlan === "pro" ? "border-primary" : "border-primary/50"}>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CardTitle>{PRICING.pro.name}</CardTitle>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            {currentPlan === "pro" && <Check className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold">${PRICING.pro.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <CardDescription>For professional event organizers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2">
            {PRICING.pro.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          {currentPlan === "pro" ? (
            <Button variant="outline" className="w-full bg-transparent" disabled>
              Current Plan
            </Button>
          ) : (
            <Button className="w-full" onClick={onUpgrade} disabled={isUpgrading}>
              {isUpgrading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
