"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

const hasClerkKeys =
  typeof window !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "";

export function Header() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-4 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="bg-linear-to-r from-purple-600/20 via-blue-600/10 to-cyan-500/20 p-px rounded-full shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center justify-between h-14 sm:h-16 rounded-full bg-background/90 backdrop-blur-2xl border border-white/10 px-4 sm:px-6">
            <Link
              href={isDashboard ? "/dashboard" : "/"}
              className="flex items-center gap-2"
            >
              <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="text-sm sm:text-base font-semibold">
                SignUpPRO
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-3 text-xs sm:text-sm">
              {isDashboard ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </Button>
                  </Link>

                  {isSignedIn ? (
                    <UserButton />
                  ) : (
                    <Link href="/sign-in">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full h-9 px-4 border-white/20 text-foreground hover:bg-white/10"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                </>
              ) : isSignedIn ? (
                <UserButton />
              ) : (
                <Link href="/sign-in">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full h-9 px-4 border-white/20 text-foreground hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                </Link>
              )}

              <Link href="/contact">
                <Button
                  size="sm"
                  className="rounded-full h-9 px-4 bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-blue-700"
                >
                  Support
                </Button>
              </Link>
            </nav>

            <button
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
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
        </motion.div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden mt-3 rounded-2xl bg-background/95 backdrop-blur-2xl border border-white/10 shadow-lg shadow-purple-500/10 overflow-hidden"
            >
              <div className="p-4 space-y-2">
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

                    {isSignedIn ? (
                      <div className="w-full py-2">
                        <UserButton />
                      </div>
                    ) : (
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-full"
                        >
                          Sign In
                        </Button>
                      </Link>
                    )}

                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        size="sm"
                        className="w-full rounded-full bg-linear-to-r from-purple-600 to-blue-600 text-white"
                      >
                        Support
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full"
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
