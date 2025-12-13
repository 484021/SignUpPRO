import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-background to-blue-50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="text-sm sm:text-base font-semibold">
                SignUpPRO
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:py-20 md:py-24">
        <Card className="w-full max-w-2xl rounded-2xl shadow-lg border-purple-200/50 dark:border-purple-900/50">
          <CardContent className="py-12 sm:py-16 md:py-20 px-6 sm:px-8 text-center">
            {/* 404 Number */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-7xl sm:text-8xl md:text-9xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                404
              </h1>
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 text-foreground">
              Page Not Found
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have
              been moved or deleted. Let's get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button
                  size="lg"
                  className="rounded-xl h-11 px-6 text-base font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl h-11 px-6 text-base font-semibold border-2 border-purple-200 hover:border-purple-400 dark:border-purple-900 dark:hover:border-purple-700 w-full sm:w-auto"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-12 pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                Need help? Contact us at{" "}
                <Link
                  href="/contact"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium underline"
                >
                  support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
