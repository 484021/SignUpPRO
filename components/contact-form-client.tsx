"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactFormClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="rounded-xl h-11 border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="rounded-xl h-11 border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-semibold">
          Subject
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="What's this about?"
          required
          className="rounded-xl h-11 border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-semibold">
          Message
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us more about your question or feedback..."
          required
          rows={6}
          className="rounded-xl border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 resize-none"
        />
      </div>

      {status === "success" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Message sent successfully! We'll get back to you soon.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-900 dark:text-red-100">
            Failed to send message. Please try again or email us directly.
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "sending" || !name || !email || !subject || !message}
        className="w-full h-12 text-base font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      >
        {status === "sending" ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Message
          </span>
        )}
      </Button>
    </form>
  );
}
