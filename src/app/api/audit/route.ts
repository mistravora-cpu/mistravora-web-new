import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/env";

const bodySchema = z.object({
  url: z.string().trim().min(4).max(300),
  email: z.string().trim().email().max(200),
});

const categories = ["performance", "accessibility", "best-practices", "seo"];

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.audit);
  if (limited) return limited;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid URL and email." },
      { status: 400 }
    );
  }

  let target = parsed.data.url;
  if (!/^https?:\/\//i.test(target)) {
    target = `https://${target}`;
  }

  try {
    new URL(target);
  } catch {
    return NextResponse.json(
      { error: "That URL doesn't look valid." },
      { status: 400 }
    );
  }

  const params = new URLSearchParams({ url: target, strategy: "mobile" });
  categories.forEach((category) => params.append("category", category));
  const apiKey = serverEnv.PAGESPEED_API_KEY;
  if (apiKey) {
    params.set("key", apiKey);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`,
      { signal: controller.signal }
    );

    if (!response.ok) {
      console.error(await response.text());
      return NextResponse.json(
        { error: "Couldn't analyze that site right now — try again in a bit." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      lighthouseResult?: {
        categories?: Record<string, { score?: number }>;
      };
    };
    const cats = data.lighthouseResult?.categories ?? {};

    const scores = {
      performance: Math.round((cats.performance?.score ?? 0) * 100),
      accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
      bestPractices: Math.round((cats["best-practices"]?.score ?? 0) * 100),
      seo: Math.round((cats.seo?.score ?? 0) * 100),
    };

    // Best-effort lead capture — failures don't block the report.
    try {
      const supabase = await createClient();
      await supabase.from("inquiries").insert({
        name: "Website audit request",
        email: parsed.data.email,
        message: `Audit for ${target}\nScores — performance: ${scores.performance}, accessibility: ${scores.accessibility}, best practices: ${scores.bestPractices}, SEO: ${scores.seo}`,
      });
    } catch (error) {
      console.error(error);
    }

    return NextResponse.json({ url: target, scores });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "The audit timed out — the site may be slow or unreachable." },
      { status: 504 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
