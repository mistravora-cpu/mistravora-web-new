import "server-only";
import type { RequirementRecord } from "./record";
export function quotationEmailConfigured() {
  return !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;
}
export async function emailQuotation(record: RequirementRecord, pdf: Buffer) {
  if (!quotationEmailConfigured()) return { status: "not_configured" as const };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(12000),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `requirement-${record.reference}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [record.contact.email],
      reply_to: record.business.email,
      subject: `${record.business.name}: your preliminary project quotation ${record.reference}`,
      text: `Hello ${record.contact.name},\n\nAttached is your preliminary project quotation and requirement summary (${record.reference}). Final scope, pricing and dates require review. A 30% advance of the agreed price is required before work begins. Maintenance is separate.\n\nOur team will review your requirements and respond within 24 hours.\n\n${record.business.name}\n${record.business.email}`,
      attachments: [
        {
          filename: `${record.reference}.pdf`,
          content: pdf.toString("base64"),
        },
      ],
    }),
  });
  if (!response.ok) throw Error(`Email provider returned ${response.status}`);
  const data = await response.json();
  if (typeof data.id !== "string")
    throw Error("Email provider did not return a receipt.");
  return { status: "accepted" as const, id: data.id };
}
