import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { unsubscribeToken } from "@/lib/email-tokens";
import { getBusinessProfile } from "@/lib/business-profile";
import { timingSafeEqual } from "node:crypto";
export const maxDuration = 60;
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const received = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const authorization = Buffer.from(received);
  if (
    !secret ||
    authorization.length !== expected.length ||
    !timingSafeEqual(authorization, expected)
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (
    !process.env.RESEND_API_KEY ||
    !process.env.EMAIL_FROM ||
    (process.env.EMAIL_TOKEN_SECRET?.length ?? 0) < 32
  )
    return NextResponse.json(
      { error: "Email delivery is not configured" },
      { status: 503 },
    );
  try {
    const db = createAdminClient();
    const site = await getBusinessProfile();
    const { data: campaigns, error: loadError } = await db
      .from("email_campaigns")
      .select("*")
      .in("status", ["scheduled", "sending"])
      .lte("scheduled_at", new Date().toISOString())
      .limit(2);
    if (loadError) throw loadError;
    const deadline = Date.now() + 40_000;
    let sent = 0;
    for (const campaign of campaigns ?? []) {
      if (Date.now() >= deadline) break;
      // Snapshot the entire audience and start the campaign in one transaction.
      const { error: queueError } = await db.rpc("queue_email_campaign", {
        campaign: campaign.id,
      });
      if (queueError) throw queueError;
      const { data: deliveries, error: deliveryError } = await db
        .from("email_deliveries")
        .select("id, subscriber_id")
        .eq("campaign_id", campaign.id)
        .eq("status", "pending")
        .limit(10);
      if (deliveryError) throw deliveryError;
      for (const delivery of deliveries ?? []) {
        if (Date.now() >= deadline) break;
        const { data: current, error: currentError } = await db
          .from("email_campaigns")
          .select("status, subject, body")
          .eq("id", campaign.id)
          .single();
        if (currentError) throw currentError;
        if (current?.status !== "sending") break;
        // Atomic claim avoids duplicate delivery when workers overlap.
        const { data: claim, error: claimError } = await db
          .from("email_deliveries")
          .update({ status: "sending", updated_at: new Date().toISOString() })
          .eq("id", delivery.id)
          .eq("status", "pending")
          .select("id");
        if (claimError) throw claimError;
        if (!claim?.length) continue;
        const { data: subscriber } = await db
          .from("newsletter_subscribers")
          .select("email, status")
          .eq("id", delivery.subscriber_id)
          .single();
        if (subscriber?.status !== "active") {
          await db
            .from("email_deliveries")
            .update({ status: "skipped" })
            .eq("id", delivery.id);
          continue;
        }
        const token = unsubscribeToken(delivery.subscriber_id);
        const unsubscribe = `${site.url}/unsubscribe?token=${token}`;
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            signal: AbortSignal.timeout(8000),
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
              "Idempotency-Key": delivery.id,
            },
            body: JSON.stringify({
              from: process.env.EMAIL_FROM,
              to: [subscriber.email],
              subject: current.subject,
              text: `${current.body}\n\n${site.name} · ${site.address}\nUnsubscribe: ${unsubscribe}`,
            }),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(`Provider returned ${response.status}`);
          const { error: receiptError } = await db
            .from("email_deliveries")
            .update({
              status: "sent",
              provider_id: result.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", delivery.id);
          if (receiptError) throw receiptError;
          sent++;
        } catch (error) {
          await db
            .from("email_deliveries")
            .update({
              status: "failed",
              error: error instanceof Error ? error.message : "Delivery failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", delivery.id);
        }
      }
      const { count } = await db
        .from("email_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaign.id)
        .in("status", ["pending", "sending", "failed"]);
      if (count === 0)
        await db
          .from("email_campaigns")
          .update({ status: "sent" })
          .eq("id", campaign.id)
          .eq("status", "sending");
    }
    return NextResponse.json(
      { sent },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Campaign worker failed. Inspect delivery status before retrying.",
      },
      { status: 500 },
    );
  }
}
