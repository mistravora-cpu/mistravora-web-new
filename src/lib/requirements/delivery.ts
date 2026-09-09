import "server-only";
import type { RequirementRecord } from "./record";
import { emailQuotation, emailQuoteNotification } from "./email";
// Persist each channel independently: a failed staff notification must not resend a customer PDF.
export async function deliverQuotationEmails(
  record: RequirementRecord,
  pdf: Buffer,
) {
  await Promise.all([
    (async () => {
      if (record.emailStatus === "accepted") return;
      try {
        const sent = await emailQuotation(record, pdf);
        record.emailStatus = sent.status;
        if (sent.id) record.emailId = sent.id;
      } catch {
        record.emailStatus = "failed";
      }
    })(),
    (async () => {
      if (!record.notification || record.notification.status === "accepted")
        return;
      try {
        const sent = await emailQuoteNotification(record, pdf);
        record.notification.status = sent.status;
        if (sent.id) record.notification.id = sent.id;
      } catch {
        record.notification.status = "failed";
      }
    })(),
  ]);
}
