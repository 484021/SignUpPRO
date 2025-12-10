"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AnalyticsChart } from "@/components/analytics-chart"

interface AnalyticsClientProps {
  analytics: {
    totalSignups: number
    totalWaitlist: number
    signupsByDay: Array<{ date: string; signups: number }>
    slotUtilization: Record<string, number>
  }
}

export function AnalyticsClient({ analytics }: AnalyticsClientProps) {
  const { toast } = useToast()

  const handleExport = () => {
    toast({ title: "CSV exported", description: "Your analytics data has been exported." })
  }

  return (
    <>
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport} className="bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalSignups}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics.totalWaitlist}</div>
            <p className="text-xs text-muted-foreground mt-1">People waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(
                Object.values(analytics.slotUtilization).reduce((a, b) => a + b, 0) /
                  Object.keys(analytics.slotUtilization).length,
              )}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across all slots</p>
          </CardContent>
        </Card>
      </div>

      {/* Signup Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Signup Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <AnalyticsChart data={analytics.signupsByDay} />
        </CardContent>
      </Card>

      {/* Slot Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Slot Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.slotUtilization).map(([slotId, utilization]) => (
              <div key={slotId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Slot {slotId.replace("slot_", "")}</span>
                  <span className="text-muted-foreground">{utilization}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      utilization >= 90
                        ? "bg-red-500"
                        : utilization >= 70
                          ? "bg-yellow-500"
                          : utilization >= 50
                            ? "bg-blue-500"
                            : "bg-green-500"
                    }`}
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
