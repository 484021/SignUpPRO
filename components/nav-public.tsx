"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { useThemeToggle } from "@/hooks/use-theme-toggle";

export function NavPublic() {
  const { isDark, toggleTheme } = useThemeToggle();
  const { isSignedIn } = useUser();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-4 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="bg-linear-to-r from-purple-600/20 via-blue-600/10 to-cyan-500/20 p-px rounded-full shadow-lg shadow-purple-500/10"
        >
          <div className="flex items-center justify-between h-14 sm:h-16 rounded-full bg-background/90 backdrop-blur-2xl border border-white/10 px-4 sm:px-6">
            <Link href="/" className="flex items-center">
              <span className="text-lg sm:text-xl font-bold bg-linear-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
                SignUpPRO
              </span>
            </Link>

            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button
                    size="sm"
                    className="rounded-full h-9 px-3 sm:px-4 bg-linear-to-r from-purple-600/80 to-blue-600/80 text-white shadow-md shadow-purple-500/20 hover:from-purple-600 hover:to-blue-600"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button
                    size="sm"
                    className="rounded-full h-9 px-3 sm:px-4 bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-500/20 hover:from-purple-700 hover:to-blue-700"
                  >
                    Get started
                  </Button>
                </Link>
              )}
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
            </div>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
