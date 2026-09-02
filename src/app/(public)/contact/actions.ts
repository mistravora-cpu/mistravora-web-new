"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import { serverEnv } from "@/lib/env";

export type InquiryState = {
  ok: boolean;
  error?: string;
} | null;

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export async function submitInquiry(
  _prevState: InquiryState,
  formData: FormData
): Promise<InquiryState> {
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    // Bot filled the hidden field — pretend success and drop it.
    return { ok: true };
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    message: formData.get("message"),
    website: "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error:
        "Please check your details — name, a valid email, and a message of at least 10 characters are required.",
    };
  }

  const { name, email, phone, message } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      email,
      phone: phone || null,
      message,
    });

    if (error) {
      console.error(error);
      return {
        ok: false,
        error:
          "Could not save your message right now — please reach us on WhatsApp instead.",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "Something went wrong — please reach us on WhatsApp instead.",
    };
  }

  const resendKey = serverEnv.RESEND_API_KEY;
  if (resendKey) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Mistravora Website <onboarding@resend.dev>",
          to: [site.email],
          subject: `New inquiry from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\n\n${message}`,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  return { ok: true };
}
