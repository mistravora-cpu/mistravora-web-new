"use client";
import { FormPrivacy } from "@/components/form-privacy";
import { useBusinessProfile } from "@/components/business-profile-provider";

import { useActionState, useEffect } from "react";
import { trackEvent } from "@/lib/track-event";
import { CheckCircle2 } from "lucide-react";
import { submitInquiry, type InquiryState } from "./actions";
import { Button } from "@/components/ui/button";

const initialState: InquiryState = null;

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40";

export function ContactForm() {
  const profile = useBusinessProfile();
  const [state, formAction, pending] = useActionState(
    submitInquiry,
    initialState
  );

  useEffect(() => { if (state?.ok) trackEvent("generate_lead", { form_name: "contact" }); }, [state]);
  if (state?.ok) {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-12 text-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 aria-hidden className="h-6 w-6 text-primary" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">Message sent</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Thanks for reaching out. {profile.response}.
        </p>
      </div>
    );
  }

  return (
    <form
      data-form-name="contact"
      action={(data) => { data.set("attribution", ""); formAction(data); }}
      className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-7"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          minLength={10}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/40"
        />
      </div>

      <details className="rounded-lg border border-border p-4 transition-colors hover:border-primary/20">
        <summary className="cursor-pointer text-sm font-medium">Add project details (optional)</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[["company", "Company", "organization"], ["service", "Service or project type", "off"], ["budget", "Budget range (LKR)", "off"], ["timeline", "Desired timeline", "off"]].map(([name, label, autoComplete]) => <label key={name} className="flex flex-col gap-2 text-sm">{label}<input name={name} maxLength={100} autoComplete={autoComplete} className={inputClass} /></label>)}
        </div>
      </details>

      {/* Honeypot — hidden from humans, bots fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-label="Website"
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-red-500">
          {state.error}
        </p>
      ) : null}

      <FormPrivacy />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
