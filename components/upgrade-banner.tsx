import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Crown } from "lucide-react"
import Link from "next/link"

interface UpgradeBannerProps {
  message: string
}

export function UpgradeBanner({ message }: UpgradeBannerProps) {
  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
        <Link href="/dashboard/billing">
          <Button size="sm" variant="default">
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    </Card>
  )
}
