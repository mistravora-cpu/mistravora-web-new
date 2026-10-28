import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { serverEnv } from "@/lib/env";
import { quickAudit, type AuditResult } from "@/lib/site-audit";

export const maxDuration = 60;

const bodySchema = z.object({
  url: z.string().trim().min(4).max(300),
  auditConsent: z.literal(true),
});

const categories = ["performance", "accessibility", "best-practices", "seo"];

async function lighthouseAudit(target: string, apiKey: string): Promise<AuditResult | null> {
  const params = new URLSearchParams({ url: target, strategy: "mobile", key: apiKey });
  categories.forEach((category) => params.append("category", category));
  try {
    const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`, { signal: AbortSignal.timeout(45_000) });
    if (!response.ok) {
      console.error("PageSpeed request failed", response.status);
      return null;
    }
    const data = (await response.json()) as { lighthouseResult?: { finalUrl?: string; categories?: Record<string, { score?: number | null }> } };
    const cats = data.lighthouseResult?.categories;
    if (!cats) return null;
    const pct = (key: string) => Math.round((cats[key]?.score ?? 0) * 100);
    return {
      url: data.lighthouseResult?.finalUrl ?? target,
      source: "lighthouse",
      scores: { performance: pct("performance"), accessibility: pct("accessibility"), bestPractices: pct("best-practices"), seo: pct("seo") },
      checks: [],
    };
  } catch (error) {
    console.error("PageSpeed request error", error);
    return null;
  }
}

export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.audit);
  if (limited) return limited;

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a public website address and confirm the audit consent." }, { status: 400 });
  }

  let target = parsed.data.url;
  if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
  try {
    const parsedUrl = new URL(target);
    if (!["https:", "http:"].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password || !parsedUrl.hostname.includes(".")) throw new Error("Invalid public URL");
    parsedUrl.search = "";
    parsedUrl.hash = "";
    target = parsedUrl.toString();
  } catch {
    return NextResponse.json({ error: "That URL doesn't look valid. Try something like example.com." }, { status: 400 });
  }

  const apiKey = serverEnv.PAGESPEED_API_KEY;
  if (apiKey) {
    const lighthouse = await lighthouseAudit(target, apiKey);
    if (lighthouse) return NextResponse.json(lighthouse);
  }

  try {
    return NextResponse.json(await quickAudit(target));
  } catch (error) {
    const message = error instanceof Error && /website|address|HTML|redirect|status/i.test(error.message)
      ? error.message
      : "We couldn't reach that website. Check the address and try again.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
