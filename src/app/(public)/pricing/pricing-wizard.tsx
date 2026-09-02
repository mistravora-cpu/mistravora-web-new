"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const projectTypes = [
  {
    id: "website",
    label: "Business website",
    base: 150000,
    hint: "Marketing site, portfolio, landing pages",
    timeline: "2–4 weeks",
    pages: "5–15 pages",
    deliverables: ["Responsive design", "SEO setup", "Contact form", "Analytics"],
  },
  {
    id: "ecommerce",
    label: "E-commerce store",
    base: 350000,
    hint: "Products, cart, secure payments",
    timeline: "4–8 weeks",
    pages: "10–50 products",
    deliverables: ["Product catalog", "Cart & checkout", "Payment gateway", "Order management"],
  },
  {
    id: "webapp",
    label: "Web application",
    base: 500000,
    hint: "Dashboards, portals, SaaS products",
    timeline: "6–12 weeks",
    pages: "Custom screens",
    deliverables: ["User auth", "Dashboard UI", "API integration", "Admin panel"],
  },
  {
    id: "custom",
    label: "Custom build",
    base: 250000,
    hint: "Something unique — let's scope it",
    timeline: "Varies",
    pages: "Custom scope",
    deliverables: ["Discovery call", "Custom architecture", "Dedicated team", "Ongoing support"],
  },
] as const;

const addons = [
  { id: "cms", label: "Admin CMS", price: 50000, hint: "Edit content without code" },
  { id: "blog", label: "Blog system", price: 30000, hint: "Articles, SEO, RSS" },
  { id: "seo", label: "Advanced SEO", price: 25000, hint: "Schema, sitemaps, meta" },
  { id: "analytics", label: "Analytics setup", price: 15000, hint: "GA4, events, goals" },
  { id: "multilingual", label: "Multilingual", price: 60000, hint: "Sinhala, Tamil, English" },
  { id: "chat", label: "AI chat assistant", price: 75000, hint: "24/7 automated support" },
  { id: "booking", label: "Booking system", price: 80000, hint: "Calendar, reminders" },
  { id: "portal", label: "Client portal", price: 120000, hint: "Login, files, messages" },
  { id: "payments", label: "Payment gateway", price: 40000, hint: "Stripe, PayHere, Genie" },
  { id: "pwa", label: "Offline PWA", price: 55000, hint: "Works on slow networks" },
] as const;

const timelines = [
  { id: "flexible", label: "Flexible", multiplier: 0.95, hint: "Best price" },
  { id: "standard", label: "Standard", multiplier: 1, hint: "Balanced" },
  { id: "fast", label: "Fast-track", multiplier: 1.25, hint: "Priority" },
] as const;

const steps = ["Project", "Features", "Timeline", "Estimate"] as const;

const optionClass = (active: boolean) =>
  `flex cursor-pointer flex-col gap-1 rounded-xl border p-4 text-left transition-all ${
    active
      ? "border-primary bg-primary/5 ring-1 ring-primary"
      : "border-border bg-card hover:border-primary/50"
  }`;

export function PricingWizard() {
  const [step, setStep] = React.useState(0);
  const [typeId, setTypeId] = React.useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = React.useState<string[]>([]);
  const [timelineId, setTimelineId] = React.useState("standard");

  const type = projectTypes.find((item) => item.id === typeId) ?? null;
  const timeline = timelines.find((item) => item.id === timelineId)!;
  const addonsTotal = addons
    .filter((addon) => selectedAddons.includes(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);

  const estimate = type
    ? Math.round(((type.base + addonsTotal) * timeline.multiplier) / 1000) *
      1000
    : 0;

  function toggleAddon(id: string) {
    setSelectedAddons((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function restart() {
    setStep(0);
    setTypeId(null);
    setSelectedAddons([]);
    setTimelineId("standard");
  }

  const canContinue = step === 0 ? typeId !== null : true;

  const whatsappMessage = encodeURIComponent(
    `Hi Mistravora! I used the pricing wizard:\n\nProject: ${type?.label ?? "-"}\nFeatures: ${
      selectedAddons.length > 0
        ? addons
            .filter((addon) => selectedAddons.includes(addon.id))
            .map((addon) => addon.label)
            .join(", ")
        : "None"
    }\nTimeline: ${timeline.label}\nEstimate: LKR ${estimate.toLocaleString()}\n\nI'd like to discuss this project.`
  );

  return (
    <div className="w-full">
      {/* Progress */}
      <div className="border-b border-border px-4 pt-5 sm:px-6">
        <ol className="flex items-center justify-between">
          {steps.map((label, index) => (
            <li key={label} className="flex flex-col items-center gap-1.5">
              <span
                className={
                  index <= step
                    ? "flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-colors"
                    : "flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground transition-colors"
                }
              >
                {index < step ? (
                  <Check aria-hidden className="h-3.5 w-3.5" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={
                  index <= step
                    ? "text-xs font-medium"
                    : "text-xs text-muted-foreground"
                }
              >
                {label}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Step 1 — project type */}
        {step === 0 ? (
          <div key="step-0" className="animate-fade-in-up">
            <h3 className="font-semibold">What are you building?</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose a category — you can refine features in the next step.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {projectTypes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTypeId(item.id)}
                  className={optionClass(typeId === item.id) + " p-3 sm:p-4"}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span>⏱ {item.timeline}</span>
                    <span>📄 {item.pages}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.deliverables.map((d) => (
                      <span key={d} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {d}
                      </span>
                    ))}
                  </div>
                  <span className="mt-1.5 text-xs font-medium text-primary">
                    from LKR {item.base.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Step 2 — features */}
        {step === 1 ? (
          <div key="step-1" className="animate-fade-in-up">
            <h3 className="font-semibold">Add the features you need</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Optional — skip if you&apos;re not sure yet.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {addons.map((addon) => {
                const active = selectedAddons.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={
                      active
                        ? "flex items-center justify-between gap-2 rounded-lg border border-primary bg-primary/5 px-4 py-2.5 text-left transition-colors"
                        : "flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-left transition-colors hover:border-primary/50"
                    }
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className={active ? "text-xs font-medium text-primary" : "text-xs font-medium text-foreground"}>
                        {active ? "✓ " : ""}{addon.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{addon.hint}</span>
                    </span>
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">
                      +LKR {addon.price.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Step 3 — timeline */}
        {step === 2 ? (
          <div key="step-2" className="animate-fade-in-up">
            <h3 className="font-semibold">How soon do you need it?</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {timelines.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTimelineId(item.id)}
                  className={optionClass(timelineId === item.id)}
                >
                  <span className="text-sm font-semibold">{item.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.hint}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    ×{item.multiplier}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Step 4 — estimate */}
        {step === 3 && type ? (
          <div key="step-3" className="animate-fade-in-up">
            <h3 className="font-semibold">Your estimate</h3>
            <div className="mt-4 rounded-xl bg-primary/10 p-4 text-center sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Estimated investment
              </p>
              <p className="mt-2 text-3xl font-bold sm:text-4xl">
                LKR {estimate.toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ±15% after scoping — no obligation
              </p>
            </div>
            <dl className="mt-4 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{type.label}</dt>
                <dd>LKR {type.base.toLocaleString()}</dd>
              </div>
              {addons
                .filter((addon) => selectedAddons.includes(addon.id))
                .map((addon) => (
                  <div key={addon.id} className="flex justify-between">
                    <dt className="text-muted-foreground">{addon.label}</dt>
                    <dd>LKR {addon.price.toLocaleString()}</dd>
                  </div>
                ))}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {timeline.label} timeline
                </dt>
                <dd>×{timeline.multiplier}</dd>
              </div>
            </dl>
            <Button asChild className="mt-6 w-full">
              <a
                href={`https://wa.me/${site.whatsapp}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle aria-hidden className="h-4 w-4" />
                Discuss this on WhatsApp
              </a>
            </Button>
          </div>
        ) : null}

        {/* Footer nav */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          {step > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((value) => value - 1)}
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}

          {step < steps.length - 1 ? (
            <Button
              size="sm"
              disabled={!canContinue}
              onClick={() => setStep((value) => value + 1)}
            >
              Next
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={restart}>
              <RotateCcw aria-hidden className="h-4 w-4" />
              Start over
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
