"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { CalendarCheck2, MessageCircle } from "lucide-react";
import { FormPrivacy } from "@/components/form-privacy";
import { Button } from "@/components/ui/button";
import { useBusinessProfile } from "@/components/business-profile-provider";
import { requestMeeting } from "@/app/(public)/book/actions";
import { MEETING_SUBMITTED_KEY, meetingFormats, meetingTimes, type MeetingState } from "@/lib/meeting";
import { trackEvent } from "@/lib/track-event";
import { MeetingCalendar } from "./meeting-calendar";

const field =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50";

function colomboDate(offsetDays: number) {
  return new Date(Date.now() + offsetDays * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
}

export function MeetingForm() {
  const profile = useBusinessProfile();
  const id = useId();
  const [state, formAction, pending] = useActionState<MeetingState, FormData>(requestMeeting, null);
  const [dateError, setDateError] = useState(false);
  const [range] = useState(() => ({ min: colomboDate(1), max: colomboDate(120) }));

  useEffect(() => {
    if (!state?.ok) return;
    trackEvent("generate_lead", { form_name: "meeting" });
    try { localStorage.setItem(MEETING_SUBMITTED_KEY, String(Date.now())); } catch {}
  }, [state]);

  if (state?.ok) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CalendarCheck2 aria-hidden className="h-6 w-6 text-primary" />
        </span>
        <h3 className="text-lg font-semibold tracking-tight">Meeting request received</h3>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          Thank you. Our team will confirm a time{state.date ? ` on ${new Date(`${state.date}T12:00:00+05:30`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}` : ""} by email. {profile.response}.
        </p>
      </div>
    );
  }

  const label = "text-sm font-medium";
  const optional = <span className="font-normal text-muted-foreground">(optional)</span>;
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const missing = !new FormData(event.currentTarget).get("date");
        setDateError(missing);
        if (missing) event.preventDefault();
      }}
      data-form-name="meeting"
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-name`} className={label}>Your name</label>
          <input id={`${id}-name`} name="name" required minLength={2} maxLength={100} autoComplete="name" className={field} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-email`} className={label}>Company email</label>
          <input id={`${id}-email`} name="email" type="email" required maxLength={200} autoComplete="email" placeholder="name@company.com" className={field} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p id={`${id}-date-label`} className={label}>Preferred date</p>
        <MeetingCalendar name="date" min={range.min} max={range.max} labelledBy={`${id}-date-label`} />
        {dateError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">Please choose a date for the meeting.</p>}
      </div>

      <details className="group rounded-xl border border-border px-4 py-3">
        <summary className="cursor-pointer select-none text-sm font-medium">Add more details {optional}</summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-time`} className={label}>Preferred time (Sri Lanka)</label>
            <select id={`${id}-time`} name="time" defaultValue="" className={field}>
              <option value="">Any time</option>
              {meetingTimes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-format`} className={label}>Meeting format</label>
            <select id={`${id}-format`} name="format" defaultValue="" className={field}>
              <option value="">No preference</option>
              {meetingFormats.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-phone`} className={label}>Phone</label>
            <input id={`${id}-phone`} name="phone" type="tel" maxLength={30} autoComplete="tel" className={field} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-company`} className={label}>Company</label>
            <input id={`${id}-company`} name="company" maxLength={150} autoComplete="organization" className={field} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor={`${id}-topic`} className={label}>What would you like to discuss?</label>
            <textarea id={`${id}-topic`} name="topic" maxLength={2000} rows={3} placeholder="A short overview of your project or questions" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50" />
          </div>
        </div>
      </details>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input name="website" tabIndex={-1} autoComplete="off" aria-label="Website" />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      <FormPrivacy />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={pending} aria-busy={pending} className="sm:min-w-44">
          {pending ? "Sending…" : "Request meeting"}
        </Button>
        {profile.whatsapp && (
          <a href={`https://wa.me/${profile.whatsapp}?text=${encodeURIComponent("Hi Mistravora, I'd like to book a meeting with your team.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            <MessageCircle aria-hidden className="h-4 w-4" /> Prefer WhatsApp?
          </a>
        )}
      </div>
    </form>
  );
}
