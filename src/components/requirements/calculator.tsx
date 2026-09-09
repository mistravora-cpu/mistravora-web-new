"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Globe,
  ShoppingCart,
  PanelsTopLeft,
  Store,
  Smartphone,
  Blocks,
  Sparkles,
  RotateCcw,
  Download,
  ShieldCheck,
} from "lucide-react";
import { requirementSteps } from "@/lib/requirements/steps";
import { recommendationInsights } from "@/lib/requirements/flow";
import type {
  Answer,
  RequirementConfig,
  RequirementRequest,
} from "@/lib/requirements/schema";
import { requestSchema } from "@/lib/requirements/schema";
import {
  buildRequirementSummary,
  calculateEstimate,
  resolveFeatures,
  validateRequirements,
} from "@/lib/requirements/engine";
import { QuestionField } from "./question";
import { EstimateSummary, lkr } from "./estimate";
import { Button } from "@/components/ui/button";
const draftKey = "mistravora-requirements-v1";
type Receipt = {
  reference: string;
  emailStatus: string;
  pdf: string;
  message: string;
};
export function RequirementCalculator({
  config,
  preview = false,
}: {
  config: RequirementConfig;
  preview?: boolean;
}) {
  const fresh = (): RequirementRequest => ({
    projectType: config.projectTypes[0].id,
    answers: {},
    features: [],
    design: config.design[0].id,
    timeline:
      config.timelines.find((t) => t.id === "standard")?.id ??
      config.timelines[0].id,
    maintenance: config.maintenance[0].id,
  });
  const [input, setInput] = useState<RequirementRequest>(fresh),
    [stepId, setStepId] = useState("project"),
    [ready, setReady] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [status, setStatus] = useState(""),
    [featureSearch, setFeatureSearch] = useState("");
  const [contact, setContact] = useState({
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      company: "",
      preferred: "Email",
      website: "",
    }),
    [consent, setConsent] = useState(false);
  const requestId = useRef(""),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = preview
          ? null
          : JSON.parse(localStorage.getItem(draftKey) || "null");
        if (
          saved &&
          saved.version === config.version &&
          saved.expires > Date.now()
        ) {
          const parsed = requestSchema.safeParse(saved.input);
          if (
            parsed.success &&
            config.projectTypes.some((p) => p.id === parsed.data.projectType) &&
            !Object.keys(validateRequirements(config, parsed.data)).length
          ) {
            setInput(parsed.data);
            if (typeof saved.stepId === "string") setStepId(saved.stepId);
          }
        }
      } catch {}
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [config, preview]);
  useEffect(() => {
    if (!ready || preview) return;
    try {
      const answers = Object.fromEntries(
        Object.entries(input.answers).filter(([key]) => {
          const q = config.questions.find((q) => q.id === key);
          return q && ["boolean", "single", "multi", "number"].includes(q.type);
        }),
      );
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          version: config.version,
          expires: Date.now() + 7 * 86400000,
          stepId,
          input: { ...input, answers },
        }),
      );
    } catch {}
  }, [input, config, ready, stepId, preview]);
  const deferred = useDeferredValue(input),
    estimate = useMemo(
      () => calculateEstimate(config, deferred),
      [config, deferred],
    );
  const { features, project } = useMemo(
    () => resolveFeatures(config, input),
    [config, input],
  );
  const derived = useMemo(
    () => resolveFeatures(config, { ...input, features: [] }).features,
    [config, input],
  );
  const steps = useMemo(() => requirementSteps(config, input), [config, input]);
  const insights = useMemo(
    () => recommendationInsights(config, input),
    [config, input],
  );
  const effectiveStep = Math.max(
    0,
    steps.findIndex((s) => s.id === stepId),
  );
  const current = steps[effectiveStep];
  const icons = [Globe, ShoppingCart, PanelsTopLeft, Store, Smartphone, Blocks];
  const normalize = (next: RequirementRequest) => ({
    ...next,
    answers: resolveFeatures(config, next).answers,
  });
  const change = (key: string, value: Answer) => {
    setInput((s) =>
      normalize({ ...s, answers: { ...s.answers, [key]: value } }),
    );
    setErrors({});
    requestId.current = "";
  };
  function move(next: number) {
    setStepId(steps[next]?.id ?? "project");
    setErrors({});
    setTimeout(() => heading.current?.focus(), 0);
  }
  function addCapability(id: string) {
    const next = normalize({ ...input, features: [...new Set([...input.features, id])] });
    setInput(next);
    requestId.current = "";
    if (current.id === "review" || current.id === "contact") {
      const previousQuestions = new Set(steps.flatMap(s => s.questions.map(q => q.id)));
      const followup = requirementSteps(config, next).find(s => s.questions.some(q => !previousQuestions.has(q.id)));
      if (followup) {
        setStepId(followup.id);
        setErrors({});
        setTimeout(() => heading.current?.focus(), 0);
      }
    }
  }
  function next() {
    const all = validateRequirements(config, input, true);
    const local = Object.fromEntries(
      Object.entries(all).filter(([id]) =>
        current.questions.some((q) => q.id === id),
      ),
    );
    if (Object.keys(local).length) {
      setErrors(local);
      setTimeout(() => {
        const first = document.getElementById(`req-${Object.keys(local)[0]}`);
        (first ?? heading.current)?.focus();
      }, 0);
      return;
    }
    move(Math.min(effectiveStep + 1, steps.length - 1));
  }
  async function submit() {
    if (preview) {
      setStatus("Preview only. No enquiry or email was sent.");
      return;
    }
    const all = validateRequirements(config, input, true);
    if (Object.keys(all).length) {
      setErrors(all);
      const index = steps.findIndex((s) => s.questions.some((q) => all[q.id]));
      if (index >= 0) move(index);
      return;
    }
    if (
      !contact.name.trim() ||
      !/^\S+@\S+\.\S+$/.test(contact.email) ||
      !consent
    ) {
      setStatus("Enter your name and email, and confirm consent.");
      return;
    }
    setBusy(true);
    setStatus("");
    requestId.current ||= crypto.randomUUID();
    try {
      const response = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: requestId.current,
          configVersion: config.version,
          requirements: input,
          contact,
          consent,
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw Error(body.error || "Could not submit. Please retry.");
      setReceipt(body);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not submit. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  function download() {
    if (!receipt) return;
    const bytes = Uint8Array.from(atob(receipt.pdf), (c) => c.charCodeAt(0));
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${receipt.reference}.pdf`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (receipt)
    return (
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-10">
        <ShieldCheck aria-hidden className="h-12 w-12 text-primary" />
        <h2 className="text-2xl font-semibold">
          Your requirements have been received
        </h2>
        <p className="break-all text-sm text-muted-foreground">
          Reference: {receipt.reference}
        </p>
        <p>{receipt.message}</p>
        <p>
          Our team will review your requirements and respond within 24 hours.
        </p>
        <Button
          className="h-auto min-h-11 whitespace-normal"
          onClick={download}
        >
          <Download aria-hidden />
          Download preliminary quotation PDF
        </Button>
        <div className="flex flex-wrap gap-5">
          <Link href="/book" className="underline">
            Book a consultation
          </Link>
          <Link href="/contact" className="underline">
            Contact Mistravora
          </Link>
        </div>
      </div>
    );
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary"
            aria-live="polite"
          >
            Step {effectiveStep + 1} of {steps.length}
          </p>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => {
              if (confirm("Start over and remove saved selections?")) {
                setInput(fresh());
                setStepId("project");
                setContact({
                  name: "",
                  email: "",
                  phone: "",
                  whatsapp: "",
                  company: "",
                  preferred: "Email",
                  website: "",
                });
                setConsent(false);
                setErrors({});
                setFeatureSearch("");
                requestId.current = "";
              }
            }}
          >
            <RotateCcw aria-hidden /> Start over
          </Button>
        </div>
        <progress
          value={effectiveStep + 1}
          max={steps.length}
          className="h-2 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
          aria-label="Requirement gathering progress"
        />
        <p className="text-xs text-muted-foreground">
          {preview
            ? "Admin preview: selections are not saved and no emails will be sent."
            : "Selections are saved on this device for 7 days. Business notes and contact details are not saved locally."}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-4 xl:hidden">
          <span className="text-sm font-semibold">
            {lkr(estimate.low)} – {lkr(estimate.high)}
          </span>
          <span className="text-xs text-muted-foreground">
            {estimate.weeksLow}–{estimate.weeksHigh} weeks · 30% advance
          </span>
        </div>
        <details className="rounded-xl border border-border bg-card px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium">
            Your steps · {project.label}
          </summary>
          <nav
            aria-label="Calculator steps"
            className="mt-3 grid gap-2 sm:grid-cols-2"
          >
            {steps.map((item, index) => (
              <button
                key={item.id}
                type="button"
                disabled={index > effectiveStep || busy}
                aria-current={item.id === current.id ? "step" : undefined}
                onClick={() => move(index)}
                className="min-h-11 rounded-lg px-3 py-2 text-left text-sm hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-45"
              >
                {index + 1}. {item.title}
                {item.id === current.id ? " · Current" : ""}
              </button>
            ))}
          </nav>
        </details>
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-semibold focus:outline-none"
        >
          {current.title}
        </h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {current.id === "project"
            ? "Choose the closest match. We’ll tailor the questions and estimate to your project."
            : current.id === "features"
              ? "Add only what you need. Included and answer-based capabilities are already selected."
              : current.id === "review"
                ? "Check your scope and costs before sharing your contact details."
                : current.id === "contact"
                  ? "One last step. Save your brief and get a copy of your preliminary quotation."
                  : "Your answers shape the remaining steps. Optional questions can be skipped if you’re unsure."}
        </p>
        <div className="space-y-7 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8">
          {current.id === "project" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {config.projectTypes.map((p, index) => {
                const Icon = icons[index % icons.length];
                return (
                  <label
                    key={p.id}
                    className={`relative flex cursor-pointer flex-col gap-4 rounded-2xl border p-5 transition-colors focus-within:ring-2 focus-within:ring-primary ${input.projectType === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        aria-hidden
                        className="h-8 w-8 shrink-0 text-primary"
                      />
                      <input
                        type="radio"
                        name="projectType"
                        checked={input.projectType === p.id}
                        onChange={() => {
                          setInput({ ...fresh(), projectType: p.id });
                          requestId.current = "";
                        }}
                      />
                      <strong>{p.label}</strong>
                    </span>
                    <span className="text-sm">{p.description}</span>
                    <span className="mt-auto text-sm font-semibold text-primary">
                      Base {lkr(p.base)}{" "}
                      <span className="font-normal text-muted-foreground">
                        · before scope adjustments
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p.category} · {p.useCases}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          {current.questions.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              value={input.answers[q.id]}
              error={errors[q.id]}
              onChange={(value) => change(q.id, value)}
            />
          ))}
          {current.id === "features" && (
            <>
              <p className="text-sm">
                Capabilities already included or required by your answers are
                listed below and charged only once.
              </p>
              <label className="block space-y-2 text-sm">
                Find a capability
                <input
                  type="search"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="Search features"
                  className="min-h-11 w-full rounded-xl border border-border bg-background px-3"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {config.features
                  .filter(
                    (f) =>
                      project.optional.includes(f.id) &&
                      f.label
                        .toLowerCase()
                        .includes(featureSearch.toLowerCase()),
                  )
                  .map((f) => (
                    <label
                      key={f.id}
                      className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 focus-within:ring-2 focus-within:ring-primary"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={features.has(f.id)}
                        disabled={derived.has(f.id)}
                        onChange={(e) => {
                          setInput((s) =>
                            normalize({
                              ...s,
                              features: e.target.checked
                                ? [...s.features, f.id]
                                : s.features.filter((id) => id !== f.id),
                            }),
                          );
                          requestId.current = "";
                        }}
                      />
                      <span>
                        {f.label}
                        <span className="block text-xs text-muted-foreground">
                          {project.included.includes(f.id)
                            ? "Included in base"
                            : derived.has(f.id)
                              ? "Required by your answers"
                              : lkr(f.price)}
                        </span>
                      </span>
                    </label>
                  ))}
              </div>
              {!config.features.some(
                (f) =>
                  project.optional.includes(f.id) &&
                  f.label.toLowerCase().includes(featureSearch.toLowerCase()),
              ) && (
                <p className="text-sm text-muted-foreground">
                  No matching capabilities. Try another search.
                </p>
              )}
            </>
          )}
          {current.id === "design" &&
            config.design.map((d) => (
              <label
                key={d.id}
                className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 focus-within:ring-2 focus-within:ring-primary"
              >
                <input
                  type="radio"
                  name="design"
                  checked={input.design === d.id}
                  onChange={() => {
                    setInput((s) => normalize({ ...s, design: d.id }));
                    requestId.current = "";
                  }}
                />
                <span>
                  {d.label}
                  <span className="block text-sm text-muted-foreground">
                    {d.description}
                  </span>
                </span>
              </label>
            ))}
          {current.id === "timeline" && (
            <>
              <h3 className="font-semibold">Delivery preference</h3>
              {config.timelines.map((t) => (
                <label
                  key={t.id}
                  className="flex min-h-14 cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 focus-within:ring-2 focus-within:ring-primary"
                >
                  <input
                    type="radio"
                    name="timeline"
                    checked={input.timeline === t.id}
                    onChange={() => {
                      setInput((s) => normalize({ ...s, timeline: t.id }));
                      requestId.current = "";
                    }}
                  />
                  <span>
                    {t.label}
                    <span className="block text-sm text-muted-foreground">
                      {t.description}
                    </span>
                  </span>
                </label>
              ))}
              <h3 className="font-semibold">Ongoing maintenance (separate)</h3>
              {config.maintenance.map((m) => (
                <label
                  key={m.id}
                  className="flex min-h-14 cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 focus-within:ring-2 focus-within:ring-primary"
                >
                  <input
                    type="radio"
                    name="maintenance"
                    checked={input.maintenance === m.id}
                    onChange={() => {
                      setInput((s) => normalize({ ...s, maintenance: m.id }));
                      requestId.current = "";
                    }}
                  />
                  <span>
                    {m.label} — {lkr(m.monthly)}/month
                    <span className="block text-xs text-muted-foreground">
                      {m.description}
                    </span>
                  </span>
                </label>
              ))}
            </>
          )}
          {current.id === "review" && (
            <>
              <EstimateSummary
                estimate={calculateEstimate(config, input)}
                config={config}
                full
              />
              <h3 className="font-semibold">Requirement summary</h3>
              <dl className="space-y-4">
                {buildRequirementSummary(config, input).map((row) => (
                  <div key={row.label}>
                    <dt className="text-sm font-medium">{row.label}</dt>
                    <dd className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2">
                {steps
                  .filter((s) => s.id !== "review" && s.id !== "contact")
                  .map((s) => (
                    <Button
                      key={s.id}
                      variant="outline"
                      size="sm"
                      onClick={() => move(steps.indexOf(s))}
                    >
                      Edit {s.title}
                    </Button>
                  ))}
              </div>
            </>
          )}
          {current.id === "contact" && (
            <>
              <p>
                Enter your email at this final step to receive your preliminary
                quotation PDF and send the requirements to Mistravora.
              </p>
              {(
                [
                  "name",
                  "company",
                  "email",
                  "phone",
                  "whatsapp",
                  "website",
                ] as const
              ).map((key) => (
                <div key={key} className="space-y-2">
                  <label
                    htmlFor={`req-contact-${key}`}
                    className="text-sm font-medium"
                  >
                    {
                      {
                        name: "Full name *",
                        company: "Business / organization",
                        email: "Email *",
                        phone: "Phone (optional)",
                        whatsapp: "WhatsApp (optional)",
                        website: "Company website (optional)",
                      }[key]
                    }
                  </label>
                  <input
                    id={`req-contact-${key}`}
                    disabled={busy}
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone" || key === "whatsapp"
                          ? "tel"
                          : key === "website"
                            ? "url"
                            : "text"
                    }
                    autoComplete={
                      key === "name"
                        ? "name"
                        : key === "email"
                          ? "email"
                          : key === "company"
                            ? "organization"
                            : key === "phone"
                              ? "tel"
                              : "off"
                    }
                    value={contact[key]}
                    maxLength={key === "website" ? 500 : 200}
                    onChange={(e) => {
                      setContact((s) => ({ ...s, [key]: e.target.value }));
                      requestId.current = "";
                    }}
                    className="w-full rounded-lg border border-border bg-background p-3"
                  />
                </div>
              ))}
              <label className="flex flex-col gap-2" htmlFor="req-preferred">
                Preferred contact method
                <select
                  id="req-preferred"
                  disabled={busy}
                  value={contact.preferred}
                  onChange={(e) => {
                    setContact((s) => ({ ...s, preferred: e.target.value }));
                    requestId.current = "";
                  }}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <option>Email</option>
                  <option>Phone</option>
                  <option>WhatsApp</option>
                </select>
              </label>
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={consent}
                  disabled={busy}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I agree that Mistravora may store these requirements, email my
                  preliminary quotation, and contact me about this project under
                  the{" "}
                  <Link href="/policies/privacy-policy" className="underline">
                    privacy policy
                  </Link>
                  . This does not subscribe me to marketing.
                </span>
              </label>
              <p className="text-xs text-muted-foreground">
                Do not include passwords, customer records, or sensitive system
                access.
              </p>
              <Button
                className="h-auto min-h-12 w-full whitespace-normal py-3"
                disabled={busy}
                onClick={submit}
              >
                {busy
                  ? "Preparing your quotation…"
                  : "Send requirements and email my PDF"}
              </Button>
              <p role="status" className="text-sm">
                {status}
              </p>
            </>
          )}
        </div>
        <div className="sticky bottom-3 z-10 flex justify-between gap-3 rounded-2xl border border-border bg-background p-3 shadow-lg">
          <Button
            variant="outline"
            disabled={effectiveStep === 0 || busy}
            onClick={() => move(Math.max(0, effectiveStep - 1))}
          >
            <ArrowLeft aria-hidden /> Back
          </Button>
          {current.id !== "contact" && (
            <Button className="min-h-11" onClick={next}>
              Continue <ArrowRight aria-hidden />
            </Button>
          )}
        </div>
      </div>
      <aside className="space-y-4 xl:sticky xl:top-24">
        <details
          open
          className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-5 sm:p-6"
        >
          <summary className="mb-4 cursor-pointer font-medium">
            Your planning estimate
          </summary>
          <EstimateSummary estimate={estimate} config={config} />
        </details>
        {insights.length > 0 && (
          <section
            aria-label="Suggestions based on your answers"
            className="space-y-4 rounded-3xl border border-border bg-card p-5"
          >
            <h3 className="flex items-center gap-2 font-semibold">
              <Sparkles aria-hidden className="h-4 w-4 text-primary" />
              Based on your answers
            </h3>
            <p className="text-xs text-muted-foreground">
              Suggestions for your scope. Extras are added only when you select
              them.
            </p>
            {insights.slice(0, 4).map((insight) => (
              <div
                key={insight.id}
                className="space-y-2 border-t border-border pt-4"
              >
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {insight.description}
                </p>
                {insight.features
                  .filter((id) => project.optional.includes(id))
                  .map((id) => {
                    const feature = config.features.find((f) => f.id === id)!;
                    return features.has(id) ? (
                      <p
                        key={id}
                        className="flex items-center gap-2 text-xs text-primary"
                      >
                        <Check aria-hidden className="h-3 w-3" />
                        {feature.label} in your scope
                      </p>
                    ) : (
                      <Button
                        key={id}
                        variant="outline"
                        size="sm"
                        className="h-auto min-h-11 whitespace-normal text-left"
                        disabled={busy}
                        onClick={() => addCapability(id)}
                      >
                        Add {feature.label} · {lkr(feature.price)} before
                        adjustments
                      </Button>
                    );
                  })}
              </div>
            ))}
          </section>
        )}
      </aside>
    </div>
  );
}
