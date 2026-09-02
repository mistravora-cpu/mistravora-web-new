import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST responses are never cached — always fresh.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.newsletter);
  if (limited) return limited;

  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email: email.trim() }, { onConflict: "email" });

    if (error) {
      console.warn("[newsletter] DB error:", error);
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
