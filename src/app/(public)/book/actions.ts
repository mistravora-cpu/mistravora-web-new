"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { getBusinessProfile } from "@/lib/business-profile";
import { serverEnv } from "@/lib/env";
import { site } from "@/lib/site";
import { meetingFormats, meetingTimes, type MeetingState } from "@/lib/meeting";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/),
  company: z.string().trim().max(150),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.union([z.enum(meetingTimes), z.literal("")]),
  format: z.union([z.enum(meetingFormats), z.literal("")]),
  topic: z.string().trim().max(2000),
});

/** Store a meeting request as an inquiry so the team sees it in the existing dashboard. */
export async function requestMeeting(_prev: MeetingState, formData: FormData): Promise<MeetingState> {
  const limited = checkRateLimit(new Request(`${site.url}/book`, { headers: await headers() }), RATE_LIMITS.contact);
  if (limited) return { ok: false, error: "Please wait a minute before sending another request." };
  if (String(formData.get("website") ?? "")) return { ok: true };
  if (formData.get("privacyConsent") !== "yes") return { ok: false, error: "Please confirm that we may contact you about this meeting." };

  const parsed = schema.safeParse(Object.fromEntries(["name", "email", "phone", "company", "date", "time", "format", "topic"].map(k => [k, String(formData.get(k) ?? "")])));
  if (!parsed.success) return { ok: false, error: "Please enter your name, a valid company email and choose a date." };
  const { name, email, phone, company, date, time, format, topic } = parsed.data;

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const latest = new Date(Date.now() + 120 * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  if (date <= today || date > latest) return { ok: false, error: "Choose a date from tomorrow up to four months ahead." };

  const message = [
    "[Meeting request]",
    `Preferred date: ${date} (Sri Lanka time)`,
    `Preferred time: ${time || "Any time"}`,
    `Meeting format: ${format || "No preference"}`,
    "",
    topic || "(No topic provided)",
  ].join("\n");

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({ name, email, phone: phone || null, company: company || null, message });
    if (error) {
      console.error(error);
      return { ok: false, error: "We couldn't save your request right now. Please contact us on WhatsApp instead." };
    }
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Something went wrong. Please contact us on WhatsApp instead." };
  }

  const resendKey = serverEnv.RESEND_API_KEY;
  if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Mistravora Website <onboarding@resend.dev>",
        to: [(await getBusinessProfile()).email],
        reply_to: email,
        subject: `Meeting request from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\nCompany: ${company || "-"}\n\n${message}`,
      }),
      signal: AbortSignal.timeout(8000),
    }).catch(error => console.error(error));
  }
  return { ok: true, date, time, format };
}
