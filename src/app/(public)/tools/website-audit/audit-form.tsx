"use client";

import * as React from "react";
import { CheckCircle2, MessageCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "@/components/business-profile-provider";
import type { AuditCheck, AuditResult } from "@/lib/site-audit";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40";

function scoreColor(score: number) {
  if (score >= 90) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function ScoreDonut({ label, score }: { label: string; score: number }) {
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        aria-label={`${label} score ${score} out of 100`}
        className="relative flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(${color} ${score * 3.6}deg, var(--muted) 0deg)`,
        }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-lg font-bold">
          {score}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AuditChecks({ checks }: { checks: AuditCheck[] }) {
  const failed = checks.filter(c => !c.passed);
  const passed = checks.filter(c => c.passed);
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="text-sm font-semibold">Needs attention ({failed.length})</h3>
        {failed.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">No issues found in this check.</p> : (
          <ul className="mt-3 space-y-3">
            {failed.map(check => (
              <li key={check.label} className="flex gap-2 text-sm">
                <XCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <span><span className="font-medium">{check.label}</span><span className="block text-muted-foreground">{check.advice}</span></span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold">Passed ({passed.length})</h3>
        <ul className="mt-3 space-y-2">
          {passed.map(check => (
            <li key={check.label} className="flex gap-2 text-sm text-muted-foreground">
              <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              {check.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AuditForm() {
  const site = useBusinessProfile();
  const [url, setUrl] = React.useState("");
  const [auditConsent, setAuditConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<AuditResult | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, auditConsent }),
      });
      const data = (await response.json().catch(() => ({}))) as Partial<AuditResult> & { error?: string };

      if (!response.ok || !data.scores || !data.url) {
        setError(response.status === 429 ? "Too many audits in a short time — please wait a minute and try again." : data.error ?? "The audit failed — please try again.");
        return;
      }

      setResult({ url: data.url, scores: data.scores, source: data.source ?? "quick-check", checks: data.checks ?? [] });
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const whatsappMessage = result
    ? encodeURIComponent(
        `Hi Mistravora! I ran your website audit on ${result.url}:\n\nPerformance: ${result.scores.performance}\nAccessibility: ${result.scores.accessibility}\nBest practices: ${result.scores.bestPractices}\nSEO: ${result.scores.seo}\n\nI'd like a full fix plan.`
      )
    : "";

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="audit-url" className="text-sm font-medium">
            Website URL
          </label>
          <input
            id="audit-url"
            type="text"
            required
            placeholder="example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className={inputClass}
          />
        </div>

        <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" required checked={auditConsent} onChange={event => setAuditConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]" /><span>I agree that this public website address is analysed by Mistravora and, where available, Google PageSpeed. Do not enter a private or token-bearing URL. No email address is required.</span></label>

        {error ? (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} aria-busy={loading}>
          {loading ? "Analysing… (this can take up to a minute)" : "Run free audit"}
        </Button>
      </form>

      {result ? (
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
          <div>
            <h2 className="font-semibold break-all">Results for {result.url}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {result.source === "lighthouse"
                ? "Mobile Google Lighthouse scores — 90+ is excellent, 50–89 needs work, below 50 is costing you customers."
                : "Quick on-page check of SEO, accessibility, best-practice and performance signals. 90+ is excellent, 50–89 needs work."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <ScoreDonut label="Performance" score={result.scores.performance} />
            <ScoreDonut
              label="Accessibility"
              score={result.scores.accessibility}
            />
            <ScoreDonut
              label="Best Practices"
              score={result.scores.bestPractices}
            />
            <ScoreDonut label="SEO" score={result.scores.seo} />
          </div>

          {result.checks.length > 0 && <AuditChecks checks={result.checks} />}

          <Button asChild>
            <a
              href={`https://wa.me/${site.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden className="h-4 w-4" />
              Get a full fix plan on WhatsApp
            </a>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
