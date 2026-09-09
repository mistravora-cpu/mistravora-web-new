import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  defaultQuoteRecipients,
  quoteRecipientsSchema,
} from "./notification-config";
export async function getQuoteRecipients() {
  const { data, error } = await createAdminClient()
    .from("settings")
    .select("value")
    .eq("key", "quote_notification_recipients")
    .abortSignal(AbortSignal.timeout(8000))
    .maybeSingle();
  if (error) throw error;
  return quoteRecipientsSchema.parse(
    data?.value ? JSON.parse(data.value) : defaultQuoteRecipients,
  );
}
