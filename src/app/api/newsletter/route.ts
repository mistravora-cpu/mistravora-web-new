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

    if (typeof email !== "string" || email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: "Unable to subscribe right now. Please try again." }, { status: 503 });
    }

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
