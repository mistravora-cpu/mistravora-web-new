import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { attachReviewDetails, prepareReview, reviewKey } from "./reviews";

/** Caller must verify admin membership before invoking this function. */
export async function saveReview(
  db: SupabaseClient,
  input: Record<string, unknown>,
  id?: string,
) {
  let changed = false;
  const savedId = id ?? randomUUID();
  try {
    let data = input;
    if (id) {
      const current = await db
        .from("testimonials")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (current.error || !current.data)
        return {
          error: "This review could not be loaded. Refresh and try again.",
          changed: false,
        };
      const [attached] = await attachReviewDetails([current.data], db);
      data = { ...attached, ...input };
    }
    const prepared = prepareReview(data);
    if (prepared.error || !prepared.row)
      return { error: prepared.error ?? "Invalid review", changed: false };
    // A partial write must leave a draft, never publish a review without attribution.
    const row = { ...prepared.row, published: false };
    const saved = id
      ? await db.from("testimonials").update(row).eq("id", id)
      : await db.from("testimonials").insert({ ...row, id: savedId });
    if (saved.error)
      return {
        error: "The review could not be saved. Please retry.",
        changed: false,
      };
    changed = true;
    const metadata = await db
      .from("settings")
      .upsert(
        { key: reviewKey(savedId), value: JSON.stringify(prepared.details) },
        { onConflict: "key" },
      );
    if (metadata.error)
      return {
        error:
          "Review saved as a draft. Source details could not be saved; please retry.",
        changed: true,
        savedId,
      };
    if (prepared.row.published) {
      const publish = await db
        .from("testimonials")
        .update({ published: true })
        .eq("id", savedId);
      if (publish.error)
        return {
          error: "Review saved as a draft. Publishing failed; please retry.",
          changed: true,
          savedId,
        };
    }
    return { error: null, changed: true, savedId };
  } catch {
    return {
      error: changed
        ? "Review saved as a draft. The connection was interrupted; please retry."
        : "The review could not be loaded or saved. Please retry.",
      changed,
      ...(changed ? { savedId } : {}),
    };
  }
}
