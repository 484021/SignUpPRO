"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, Instagram } from "lucide-react";
import { Logo } from "@/components/logo";
import { useState } from "react";

const hasClerkKeys =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "";

export function Header() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <Link
            href={isDashboard ? "/dashboard" : "/"}
            className="flex items-center gap-2"
          >
            <Logo className="w-7 h-7 md:w-8 md:h-8" />
            <span className="text-lg md:text-xl font-semibold">
              SignUpPRO - BETA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            {isDashboard ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" size="sm">
                    Settings
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
            <a
              href="https://instagram.com/san.growth"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <Button variant="outline" size="icon">
                <Instagram className="w-4 h-4" />
              </Button>
            </a>
            <Button asChild variant="default">
              <a href="mailto:support@example.com?subject=Support%20Request">
                Contact Support
              </a>
            </Button>
          </nav>

          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-2 border-t pt-4">
            {isDashboard ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Settings
                  </Button>
                </Link>
                <Button asChild variant="default">
                  <a href="mailto:santhosh@hnbk.solutions?subject=Support%20Request">
                    Contact Support
                  </a>
                </Button>
              </>
            ) : (
              <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
