"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const USD_RATE = 300;

const projectTypes = [
  { id: "website", label: "Marketing website", base: 150_000 },
  { id: "ecommerce", label: "E-commerce store", base: 350_000 },
  { id: "webapp", label: "Web app / portal", base: 600_000 },
  { id: "custom", label: "Custom software", base: 800_000 },
] as const;

const features = [
  { id: "cms", label: "CMS-managed content", price: 50_000 },
  { id: "blog", label: "Blog + SEO content system", price: 30_000 },
  { id: "portal", label: "Client portal / dashboard", price: 150_000 },
  { id: "ai", label: "AI assistant / AI features", price: 200_000 },
  { id: "i18n", label: "Multilingual (Sinhala/Tamil)", price: 80_000 },
  { id: "pwa", label: "Offline-ready PWA", price: 60_000 },
  { id: "integrations", label: "Integrations (CRM, payments, email)", price: 100_000 },
] as const;

const timelines = [
  { id: "standard", label: "Standard", multiplier: 1 },
  { id: "fast", label: "Fast-track (+25%)", multiplier: 1.25 },
  { id: "flexible", label: "Flexible (−10%)", multiplier: 0.9 },
] as const;

const selectClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CostCalculator() {
  const [typeId, setTypeId] = React.useState<string>("website");
  const [selected, setSelected] = React.useState<string[]>(["cms"]);
  const [timelineId, setTimelineId] = React.useState<string>("standard");
  const [currency, setCurrency] = React.useState<"LKR" | "USD">("LKR");

  const type = projectTypes.find((t) => t.id === typeId) ?? projectTypes[0];
  const timeline =
    timelines.find((t) => t.id === timelineId) ?? timelines[0];

  const featureTotal = features
    .filter((feature) => selected.includes(feature.id))
    .reduce((sum, feature) => sum + feature.price, 0);

  const estimate = Math.round((type.base + featureTotal) * timeline.multiplier);
  const low = Math.round(estimate * 0.85);
  const high = Math.round(estimate * 1.15);

  const format = (amount: number) =>
    currency === "LKR"
      ? `LKR ${amount.toLocaleString()}`
      : `$${Math.round(amount / USD_RATE).toLocaleString()}`;

  const toggleFeature = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const selectedLabels = [
    type.label,
    ...features
      .filter((feature) => selected.includes(feature.id))
      .map((feature) => feature.label),
  ];

  const message = encodeURIComponent(
    `Hi Mistravora! I used your cost calculator:\n\nProject: ${selectedLabels.join(
      ", "
    )}\nTimeline: ${timeline.label}\nEstimate: ${format(low)} – ${format(
      high
    )}\n\nI'd like an exact quote.`
  );

  return (
    <div className="scroll-reveal grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="project-type" className="text-sm font-medium">
            Project type
          </label>
          <select
            id="project-type"
            value={typeId}
            onChange={(event) => setTypeId(event.target.value)}
            className={selectClass}
          >
            {projectTypes.map((projectType) => (
              <option key={projectType.id} value={projectType.id}>
                {projectType.label}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium">Features</legend>
          {features.map((feature) => (
            <label
              key={feature.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(feature.id)}
                  onChange={() => toggleFeature(feature.id)}
                  className="h-4 w-4 accent-[var(--primary)]"
                />
                {feature.label}
              </span>
              <span className="text-xs text-muted-foreground">
                +{format(feature.price)}
              </span>
            </label>
          ))}
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="timeline" className="text-sm font-medium">
            Timeline
          </label>
          <select
            id="timeline"
            value={timelineId}
            onChange={(event) => setTimelineId(event.target.value)}
            className={selectClass}
          >
            {timelines.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex h-fit flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-6 lg:sticky lg:top-24">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Your estimate</h2>
          <div className="flex rounded-lg border border-border p-0.5 text-xs">
            {(["LKR", "USD"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCurrency(option)}
                className={
                  currency === option
                    ? "rounded-md bg-primary px-2.5 py-1 font-medium text-primary-foreground"
                    : "rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground"
                }
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <p className="text-3xl font-bold text-primary">
          {format(low)} – {format(high)}
        </p>

        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          {selectedLabels.map((label) => (
            <li key={label}>• {label}</li>
          ))}
          <li>• {timeline.label} timeline</li>
        </ul>

        <Button asChild className="mt-2">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            Get exact quote on WhatsApp
          </a>
        </Button>

        <p className="text-xs leading-5 text-muted-foreground">
          Estimates are indicative only (±15%) and exclude hosting and domain
          costs. USD shown at an approximate rate of {USD_RATE} LKR/USD.
        </p>
      </div>
    </div>
  );
}
