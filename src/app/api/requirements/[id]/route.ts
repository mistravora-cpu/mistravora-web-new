import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseRequirementRecord } from "@/lib/requirements/record";
import { buildQuotationPdf } from "@/lib/requirements/pdf";
import { emailQuotation } from "@/lib/requirements/email";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { z } from "zod";
export const runtime = "nodejs";
export const maxDuration = 60;
async function lookup(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const { data, error } = await createAdminClient()
    .from("inquiries")
    .select("message")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? parseRequirementRecord(data.message) : null;
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const record = await lookup(id);
    if (!record)
      return NextResponse.json(
        { error: "Quotation not found." },
        { status: 404 },
      );
    const pdf = await buildQuotationPdf(record);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quotation-${id}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not prepare PDF." },
      { status: 503 },
    );
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  const limited = checkRateLimit(request, RATE_LIMITS.contact);
  if (limited) return limited;
  try {
    const { id } = await params;
    const record = await lookup(id);
    if (!record)
      return NextResponse.json(
        { error: "Quotation not found." },
        { status: 404 },
      );
    if (record.emailStatus === "accepted")
      return NextResponse.json({
        message:
          "The provider already accepted this email. No duplicate was sent.",
      });
    const pdf = await buildQuotationPdf(record);
    const result = await emailQuotation(record, pdf);
    record.emailStatus = result.status;
    if (result.id) record.emailId = result.id;
    const { error } = await createAdminClient()
      .from("inquiries")
      .update({ message: JSON.stringify(record) })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard/inquiries");
    return NextResponse.json(
      result.status === "accepted"
        ? { message: "The email provider accepted the quotation for delivery." }
        : {
            error:
              "Email is not configured. Set RESEND_API_KEY and verified EMAIL_FROM in the server environment.",
          },
      { status: result.status === "accepted" ? 200 : 503 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "The email could not be confirmed. Check the sender configuration and retry.",
      },
      { status: 503 },
    );
  }
}
