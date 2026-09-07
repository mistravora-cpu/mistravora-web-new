"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "@/components/business-profile-provider";

type Scores = {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
};

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

export function AuditForm() {
  const site = useBusinessProfile();
  const [url, setUrl] = React.useState("");
  const [auditConsent, setAuditConsent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    url: string;
    scores: Scores;
  } | null>(null);

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
      const data = (await response.json()) as {
        url?: string;
        scores?: Scores;
        error?: string;
      };

      if (!response.ok || !data.scores || !data.url) {
        setError(data.error ?? "The audit failed — please try again.");
        return;
      }

      setResult({ url: data.url, scores: data.scores });
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

        <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" required checked={auditConsent} onChange={event => setAuditConsent(event.target.checked)} className="mt-1 h-5 w-5 shrink-0" /><span>Send this public website URL to Google PageSpeed to run the audit. Do not enter a private or token-bearing URL. No email address is required.</span></label>

        {error ? (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Analyzing… (up to 30s)" : "Run free audit"}
        </Button>
      </form>

      {result ? (
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
          <div>
            <h2 className="font-semibold">Results for {result.url}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Mobile Lighthouse scores — 90+ is excellent, 50–89 needs work,
              below 50 is costing you customers.
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
