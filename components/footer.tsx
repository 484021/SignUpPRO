"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-xl dark:border-white/10 dark:bg-black/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Logo className="w-5 h-5" />
            <span className="font-semibold text-slate-900 dark:text-white">
              SignUpPRO
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="text-xs sm:text-sm">© {currentYear}</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-slate-600 dark:text-slate-400">
            <Link
              href="/privacy"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/contact"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
