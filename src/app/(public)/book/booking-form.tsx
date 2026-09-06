"use client";
import { useBusinessProfile } from "@/components/business-profile-provider";
import { useState } from "react";
import { trackEvent } from "@/lib/track-event";
export type Slot = { id: string; starts_at: string; ends_at: string };
export function BookingForm({ slots }: { slots: Slot[] }) {
  const profile = useBusinessProfile();
  const [status, setStatus] = useState(""); const [pending, setPending] = useState(false); const [chosen, setChosen] = useState<Slot | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setPending(true); setStatus("");
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setChosen(slots.find(s => s.id === data.get("slot")) ?? null); trackEvent("booking_completed", { form_name: "consultation" });
    } catch (error) { setStatus(error instanceof Error ? error.message : "Please try again."); } finally { setPending(false); }
  }
  function calendar() {
    if (!chosen) return;
    const stamp = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Mistravora//Consultation//EN", "BEGIN:VEVENT", `UID:${chosen.id}@mistravora.com`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(chosen.starts_at)}`, `DTEND:${stamp(chosen.ends_at)}`, "SUMMARY:Mistravora consultation", `DESCRIPTION:Contact ${profile.email.replace(/[\r\n]/g, "")} for meeting details.`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/calendar" })); const a = document.createElement("a"); a.href = url; a.download = "mistravora-consultation.ics"; a.click(); URL.revokeObjectURL(url);
  }
  if (chosen) return <div role="status" className="mt-8 rounded-xl border border-border bg-card p-6"><h2 className="text-xl font-semibold">Your consultation is booked</h2><p className="mt-3">Our team will contact you with the meeting details.</p><button onClick={calendar} className="mt-4 text-primary underline">Add to your calendar</button></div>;
  const input = "mt-2 w-full rounded-lg border border-border bg-card px-3 py-3";
  return <form data-form-name="booking" onSubmit={submit} className="mt-8 max-w-xl space-y-5"><label className="block">Appointment (Sri Lanka time)<select required name="slot" className={input} defaultValue=""><option value="" disabled>Select a time</option>{slots.map(s => <option value={s.id} key={s.id}>{new Date(s.starts_at).toLocaleString("en-GB", { timeZone: "Asia/Colombo", dateStyle: "medium", timeStyle: "short" })}</option>)}</select></label><label className="block">Your name<input name="name" required minLength={2} maxLength={100} autoComplete="name" className={input} /></label><label className="block">Email<input name="email" type="email" required maxLength={200} autoComplete="email" className={input} /></label><label className="block">What would you like to discuss?<textarea name="message" maxLength={2000} rows={4} className={input} /></label><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" /><button disabled={pending} className="rounded-lg bg-primary px-6 py-3 text-primary-foreground">{pending ? "Booking…" : "Book consultation"}</button>{status && <p role="alert">{status}</p>}</form>;
}
