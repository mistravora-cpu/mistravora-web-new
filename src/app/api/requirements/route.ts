import { recommendationInsights } from "@/lib/requirements/flow";
import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBusinessProfile } from "@/lib/business-profile";
import { getRequirementConfig } from "@/lib/requirements/settings";
import { submissionSchema } from "@/lib/requirements/submission";
import {
  buildRequirementSummary,
  calculateEstimate,
  qualify,
  resolveFeatures,
  validateRequirements,
} from "@/lib/requirements/engine";
import { buildQuotationPdf } from "@/lib/requirements/pdf";
import { deliverQuotationEmails } from "@/lib/requirements/delivery";
import { getQuoteRecipients } from "@/lib/requirements/notification-settings";
import {
  parseRequirementRecord,
  type RequirementRecord,
} from "@/lib/requirements/record";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const limited = checkRateLimit(request, RATE_LIMITS.contact);
  if (limited) return limited;
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Submit from the website." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 100000)
    return NextResponse.json(
      { error: "Requirements are too long." },
      { status: 413 },
    );
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Could not read requirements." },
      { status: 400 },
    );
  }
  if (raw.length > 100000)
    return NextResponse.json(
      { error: "Requirements are too long." },
      { status: 413 },
    );
  let payload;
  try {
    payload = submissionSchema.safeParse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  if (!payload.success)
    return NextResponse.json(
      {
        error:
          payload.error.issues[0]?.message || "Check your details and consent.",
      },
      { status: 400 },
    );
  const input = payload.data;
  try {
    const config = await getRequirementConfig();
    const db = createAdminClient();
    const hash = createHash("sha256")
      .update(JSON.stringify(input))
      .digest("hex");
    const { data: existing, error: readError } = await db
      .from("inquiries")
      .select("message")
      .eq("id", input.id)
      .maybeSingle();
    if (readError) throw Error("Inquiry lookup failed");
    let record: RequirementRecord | null = existing
      ? parseRequirementRecord(existing.message)
      : null;
    if (existing && (!record || record.requestHash !== hash))
      return NextResponse.json(
        {
          error:
            "This submission reference is already in use. Start a new submission.",
        },
        { status: 409 },
      );
    if (!record) {
      if (input.configVersion !== config.version)
        return NextResponse.json(
          {
            error:
              "The calculator configuration changed. Reload the page and review the updated estimate before submitting.",
          },
          { status: 409 },
        );
      if (
        !config.projectTypes.some(
          (project) => project.id === input.requirements.projectType,
        )
      )
        return NextResponse.json(
          { error: "Choose a valid project type." },
          { status: 400 },
        );
      const errors = validateRequirements(config, input.requirements, true);
      if (Object.keys(errors).length)
        return NextResponse.json(
          {
            error:
              "Complete the required questions using the available options.",
            fields: errors,
          },
          { status: 400 },
        );
      const { answers } = resolveFeatures(config, input.requirements);
      const requirements = { ...input.requirements, answers };
      const estimate = calculateEstimate(config, requirements),
        profile = await getBusinessProfile();
      record = {
        source: "requirement_calculator",
        reference: `MST-REQ-${new Date().getUTCFullYear()}-${input.id}`,
        submittedAt: new Date().toISOString(),
        requestHash: hash,
        requirements,
        contact: input.contact,
        consent: { accepted: true, version: "requirement-v1" },
        configVersion: config.version,
        estimate,
        summary: buildRequirementSummary(config, requirements),
        qualification: qualify(requirements, estimate),
        insights: recommendationInsights(config, requirements).map(
          ({ id, title, description, features }) => ({
            id,
            title,
            description,
            features,
          }),
        ),
        terms: {
          notice: config.notice,
          exclusions: config.exclusions,
          advancePercent: 30,
        },
        business: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          url: profile.url,
        },
        emailStatus: "pending",
        notification: {
          recipients: await getQuoteRecipients(),
          status: "pending",
        },
      };
      const { error } = await db.from("inquiries").insert({
        id: input.id,
        name: input.contact.name,
        email: input.contact.email,
        phone: input.contact.phone || null,
        company: input.contact.company || null,
        message: JSON.stringify(record),
        status: "new",
      });
      if (error) {
        if (error.code === "23505")
          return NextResponse.json(
            {
              error:
                "This request is already being processed. Please retry shortly.",
            },
            { status: 409 },
          );
        throw Error("Could not save requirements");
      }
    }
    const pdf = await buildQuotationPdf(record);
    if (!record.notification)
      record.notification = {
        recipients: await getQuoteRecipients(),
        status: "pending",
      };
    if (
      record.emailStatus !== "accepted" ||
      record.notification.status !== "accepted"
    ) {
      await deliverQuotationEmails(record, pdf);
      const { error } = await db
        .from("inquiries")
        .update({ message: JSON.stringify(record) })
        .eq("id", input.id);
      if (error)
        return NextResponse.json(
          {
            error:
              "Your requirements were saved, but the receipt could not be confirmed. Retry this submission.",
          },
          { status: 503 },
        );
    }
    revalidatePath("/dashboard/inquiries");
    return NextResponse.json(
      {
        reference: record.reference,
        emailStatus: record.emailStatus,
        pdf: pdf.toString("base64"),
        message:
          record.emailStatus === "accepted"
            ? "Your requirements are saved and the email provider has accepted your PDF for delivery. You can also download it below."
            : "Your requirements are saved. The PDF could not be emailed automatically; download it below. Our team will follow up.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not complete your submission right now. Please retry; your reference will prevent a duplicate enquiry.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
