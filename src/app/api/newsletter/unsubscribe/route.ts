import { NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email-tokens";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.newsletter); if (limited) return limited;
  try {
    const type = request.headers.get("content-type") ?? "";
    const token = type.includes("application/json") ? (await request.json()).token : (await request.formData()).get("token");
    const id = typeof token === "string" ? verifyUnsubscribeToken(token) : null;
    if (!id) return NextResponse.json({ error: "This unsubscribe link is invalid." }, { status: 400 });
    const { error } = await createAdminClient().from("newsletter_subscribers").update({ status: "unsubscribed" }).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Unable to unsubscribe right now. Please use our contact page." }, { status: 503 }); }
}
