"use server";

import { requireAdmin } from "@/lib/auth";
import { getIndexNowStatus, submitIndexNowSitemap } from "@/lib/indexnow";
import type { IndexNowResult } from "@/lib/indexnow-config";

export async function submitPublishedUrls(): Promise<IndexNowResult> {
  const checkedAt = new Date().toISOString();
  if (!(await requireAdmin())) return { ok: false, count: 0, checkedAt, message: "Unauthorized" };
  try {
    const last = await getIndexNowStatus();
    // Persistent cooldown prevents repeated button clicks across page reloads.
    // IndexNow also enforces its own rate limits for concurrent deployments.
    if (last && Date.now() - Date.parse(last.checkedAt) < 60_000) {
      return { ok: false, count: 0, checkedAt, message: "Please wait one minute after the last submission before trying again." };
    }
    return await submitIndexNowSitemap(last?.ok === false ? last.urls : []);
  } catch {
    return { ok: false, count: 0, checkedAt, message: "Unable to prepare the published URLs. Check the database connection and try again." };
  }
}
