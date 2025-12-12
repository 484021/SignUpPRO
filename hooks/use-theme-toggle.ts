import { useEffect, useState } from "react";

export function useThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Initialize from storage or system preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.classList.toggle("dark", prefersDark);
      localStorage.setItem("theme", initial);
    }

    const handleExternalToggle = () => {
      const latest = localStorage.getItem("theme");
      if (latest === "light" || latest === "dark") {
        setTheme(latest);
        document.documentElement.classList.toggle("dark", latest === "dark");
      }
    };

    window.addEventListener("theme-toggle", handleExternalToggle);
    window.addEventListener("storage", handleExternalToggle);

    return () => {
      window.removeEventListener("theme-toggle", handleExternalToggle);
      window.removeEventListener("storage", handleExternalToggle);
    };
  }, []);

  // Persist and apply to document
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next === "dark");
    }
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("theme", next);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("theme-toggle"));
    }
  };

  return { theme, isDark: theme === "dark", toggleTheme };
}
