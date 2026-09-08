"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  visible,
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
}: {
  config: RequirementConfig;
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
    [step, setStep] = useState(0),
    [ready, setReady] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false),
    [receipt, setReceipt] = useState<Receipt | null>(null),
    [status, setStatus] = useState("");
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
        const saved = JSON.parse(localStorage.getItem(draftKey) || "null");
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
            if (
              Number.isInteger(saved.step) &&
              saved.step >= 0 &&
              saved.step < 100
            )
              setStep(saved.step);
          }
        }
      } catch {}
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [config]);
  useEffect(() => {
    if (!ready) return;
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
          step,
          input: { ...input, answers },
        }),
      );
    } catch {}
  }, [input, config, ready, step]);
  const deferred = useDeferredValue(input),
    estimate = useMemo(
      () => calculateEstimate(config, deferred),
      [config, deferred],
    );
  const { features, project } = resolveFeatures(config, input);
  const derived = resolveFeatures(config, { ...input, features: [] }).features;
  const active = config.questions.filter((q) =>
    visible(q, input.projectType, input.answers, features),
  );
  const groups = Array.from(new Set(active.map((q) => q.group))).flatMap(
    (group) => {
      const questions = active.filter((q) => q.group === group);
      const chunks = [];
      for (let i = 0; i < questions.length; i += 5)
        chunks.push({
          id: `${group}-${i}`,
          title: group,
          questions: questions.slice(i, i + 5),
        });
      return chunks;
    },
  );
  const before = groups.filter(
    (g) =>
      ![
        "Integration and specialist details",
        "Priorities and references",
      ].includes(g.title),
  );
  const after = groups.filter((g) =>
    [
      "Integration and specialist details",
      "Priorities and references",
    ].includes(g.title),
  );
  const steps = [
    { id: "project", title: "Project", questions: [] },
    ...before,
    { id: "features", title: "Optional capabilities", questions: [] },
    ...after,
    { id: "design", title: "Design", questions: [] },
    { id: "timeline", title: "Delivery and maintenance", questions: [] },
    { id: "review", title: "Review your estimate", questions: [] },
    { id: "contact", title: "Send your requirements", questions: [] },
  ];
  const effectiveStep = Math.min(step, steps.length - 1);
  const current = steps[effectiveStep];
  const change = (key: string, value: Answer) => {
    setInput((s) => ({ ...s, answers: { ...s.answers, [key]: value } }));
    setErrors({});
    requestId.current = "";
  };
  function move(next: number) {
    setStep(next);
    setErrors({});
    setTimeout(() => heading.current?.focus(), 0);
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
      return;
    }
    move(Math.min(effectiveStep + 1, steps.length - 1));
  }
  async function submit() {
    const all = validateRequirements(config, input, true);
    if (Object.keys(all).length) {
      setErrors(all);
      const index = steps.findIndex((s) => s.questions.some((q) => all[q.id]));
      if (index >= 0) setStep(index);
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
      <div className="mx-auto max-w-3xl space-y-6 rounded-xl border border-border p-6">
        <h2 className="text-2xl font-semibold">
          Your requirements have been received
        </h2>
        <p>Reference: {receipt.reference}</p>
        <p>{receipt.message}</p>
        <p>
          Our team will review your requirements and respond within 24 hours.
        </p>
        <Button onClick={download}>Download preliminary quotation PDF</Button>
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
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            Step {Math.min(step + 1, steps.length)} of {steps.length}
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              if (confirm("Start over and remove saved selections?")) {
                setInput(fresh());
                setStep(0);
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
                requestId.current = "";
              }
            }}
          >
            Start over
          </Button>
        </div>
        <progress
          value={effectiveStep + 1}
          max={steps.length}
          className="h-2 w-full"
          aria-label="Requirement gathering progress"
        />
        <p className="text-xs text-muted-foreground">
          Selections are saved on this device for 7 days. Business notes and
          contact details are not saved locally.
        </p>
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-semibold focus:outline-none"
        >
          {current.title}
        </h2>
        <div className="space-y-7 rounded-xl border border-border bg-card p-5 sm:p-7">
          {current.id === "project" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {config.projectTypes.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer flex-col gap-3 rounded-xl border p-4 ${input.projectType === p.id ? "border-primary" : "border-border"}`}
                >
                  <span className="flex items-center gap-2">
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
                  <span className="text-sm">From {lkr(p.base)}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.category} · {p.useCases}
                  </span>
                </label>
              ))}
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
              {config.features
                .filter((f) => project.optional.includes(f.id))
                .map((f) => (
                  <label
                    key={f.id}
                    className="flex min-h-11 items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={features.has(f.id)}
                      disabled={derived.has(f.id)}
                      onChange={(e) => {
                        setInput((s) => ({
                          ...s,
                          features: e.target.checked
                            ? [...s.features, f.id]
                            : s.features.filter((id) => id !== f.id),
                        }));
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
            </>
          )}
          {current.id === "design" &&
            config.design.map((d) => (
              <label
                key={d.id}
                className="flex min-h-11 items-start gap-3 rounded-lg border border-border p-4"
              >
                <input
                  type="radio"
                  name="design"
                  checked={input.design === d.id}
                  onChange={() => {
                    setInput((s) => ({ ...s, design: d.id }));
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
                  className="flex min-h-11 gap-3 rounded-lg border border-border p-3"
                >
                  <input
                    type="radio"
                    name="timeline"
                    checked={input.timeline === t.id}
                    onChange={() => {
                      setInput((s) => ({ ...s, timeline: t.id }));
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
                  className="flex min-h-11 gap-3 rounded-lg border border-border p-3"
                >
                  <input
                    type="radio"
                    name="maintenance"
                    checked={input.maintenance === m.id}
                    onChange={() => {
                      setInput((s) => ({ ...s, maintenance: m.id }));
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
              <Button disabled={busy} onClick={submit}>
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
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            disabled={step === 0 || busy}
            onClick={() => move(Math.max(0, effectiveStep - 1))}
          >
            Back
          </Button>
          {current.id !== "contact" && <Button onClick={next}>Continue</Button>}
        </div>
      </div>
      <aside className="lg:sticky lg:top-24">
        <details open className="rounded-xl border border-border bg-card p-5">
          <summary className="mb-4 cursor-pointer font-medium">
            Your planning estimate
          </summary>
          <EstimateSummary estimate={estimate} config={config} />
        </details>
      </aside>
    </div>
  );
}
