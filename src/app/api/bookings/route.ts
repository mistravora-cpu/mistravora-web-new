import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
const booking = z.object({
  privacyConsent: z.literal("yes"),
  slot: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  message: z.string().max(2000).default(""),
  website: z.string().max(0).default(""),
});
export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.contact);
  if (limited) return limited;
  try {
    const input = booking.safeParse(await request.json());
    if (!input.success)
      return NextResponse.json(
        { error: "Check your name, email, and selected appointment." },
        { status: 400 },
      );
    const { slot, name, email, message } = input.data;
    const { error } = await createAdminClient().rpc("reserve_consultation", {
      p_slot: slot,
      p_name: name,
      p_email: email,
      p_message: message,
    });
    if (error)
      return NextResponse.json(
        {
          error:
            "This time is no longer available. Please select another appointment.",
        },
        { status: 409 },
      );
    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Booking is temporarily unavailable. Please contact our team." },
      { status: 503 },
    );
  }
}
