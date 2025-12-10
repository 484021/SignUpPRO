import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_description?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {params?.error_description ? (
            <p className="text-sm text-muted-foreground">{params.error_description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">An error occurred during authentication.</p>
          )}
          {params?.error && <p className="text-xs text-muted-foreground">Error code: {params.error}</p>}
          <Link href="/auth/login">
            <Button className="w-full">Try Again</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
