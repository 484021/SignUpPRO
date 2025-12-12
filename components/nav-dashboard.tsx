"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export function NavDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { isDark, toggleTheme } = useThemeToggle();

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
            <Link href="/dashboard" className="flex items-center">
              <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                SignUpPRO
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-3 text-xs sm:text-sm">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full h-9 px-3 border-white/20 text-foreground hover:bg-white/10"
                aria-label="Toggle theme"
              >
                <FontAwesomeIcon
                  icon={isDark ? faSun : faMoon}
                  className="w-4 h-4"
                />
              </Button>

              <div className="flex items-center gap-3">
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
              </div>
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
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="md:hidden mt-3 rounded-2xl bg-background/95 backdrop-blur-2xl border border-white/10 shadow-lg shadow-purple-500/10 overflow-hidden"
            >
              <div className="p-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-white/5">
                  <div className="p-2 space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between rounded-xl px-4 py-3 bg-white/0 hover:bg-white/10 text-foreground text-sm font-medium"
                      >
                        Dashboard
                      </Button>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between rounded-xl px-4 py-3 bg-white/0 hover:bg-white/10 text-foreground text-sm font-medium"
                      >
                        Support
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between rounded-xl px-4 py-3 text-sm border-white/30 bg-white/5 hover:bg-white/15 hover:border-white/50 hover:text-foreground"
                      onClick={toggleTheme}
                    >
                      <span>{isDark ? "Light mode" : "Dark mode"}</span>
                      <FontAwesomeIcon
                        icon={isDark ? faSun : faMoon}
                        className="w-4 h-4"
                      />
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  {isSignedIn ? (
                    <div className="w-full flex justify-center">
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
                        className="w-full rounded-xl"
                      >
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
