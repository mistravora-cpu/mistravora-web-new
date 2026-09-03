"use client";

import * as React from "react";
import { Mail, CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "mistravora-newsletter";

export function NewsletterSignup({
  title = "Get digital growth tips",
  description = "Monthly insights on web performance, SEO, and building software that lasts. No spam — unsubscribe anytime.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [alreadySubscribed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) !== null;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) throw new Error("Failed");

      localStorage.setItem(STORAGE_KEY, "1");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (alreadySubscribed || status === "success") {
    return (
      <div className={`flex items-center gap-4 ${compact ? "" : "gradient-border-card rounded-2xl p-6 sm:p-8"}`}>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/10">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-semibold">You&apos;re subscribed!</p>
          <p className="text-sm text-muted-foreground">Watch your inbox for the next issue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gradient-border-card relative overflow-hidden rounded-2xl ${compact ? "p-4" : "p-6 sm:p-8"}`}>
      <div aria-hidden className="aurora-bg absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="absolute -top-12 -right-8 h-32 w-32 animate-aurora rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative flex w-full flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left — info */}
        <div className="flex w-full items-start gap-4 lg:max-w-md">
          <span className="glow-icon inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </span>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Newsletter</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex w-full flex-col gap-3 lg:max-w-md">
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2.5 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              autoComplete="email"
              className="flex-1 rounded-xl border border-border bg-background/80 px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button type="submit" disabled={status === "loading"} className="shrink-0 ripple-click">
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {status === "error" && (
            <p className="text-xs text-red-500">
              Something went wrong. Please try again or email us directly.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary/60" />
              No spam
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary/60" />
              Unsubscribe anytime
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary/60" />
              Monthly only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
