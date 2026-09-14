import { createHash } from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Testimonial } from "./types";
import { isPublicMediaUrl } from "./media-url";

// Metadata uses the existing settings store; no new database columns required.
// Keep only public attribution here, never private customer messages or evidence.
export const reviewKey = (id: string) => `testimonial_details:${id}`;
export const reviewPath =
  /^\/(?:about|pricing|contact|(?:solutions|services|projects|industries)(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?)?$/;
const httpsLink = z
  .string()
  .max(2000)
  .refine(
    (value) =>
      !value || (value.startsWith("https://") && isPublicMediaUrl(value)),
    "Use a public HTTPS source link, or leave it blank.",
  );
const detailsSchema = z.object({
  source_name: z.string().trim().max(100).default(""),
  source_url: httpsLink.default(""),
  review_date: z
    .string()
    .default("")
    .refine(
      (value) =>
        !value ||
        (/^\d{4}-\d{2}-\d{2}$/.test(value) &&
          Number.isFinite(Date.parse(value)) &&
          new Date(value).toISOString().slice(0, 10) === value &&
          value <= new Date().toISOString().slice(0, 10)),
      "Use a valid review date (YYYY-MM-DD), no later than today.",
    ),
  permission_confirmed: z.boolean().default(false),
  display_paths: z
    .array(z.string().regex(reviewPath, "Choose a supported public page path."))
    .max(30)
    .default(["/", "/about", "/pricing"]),
});
const reviewSchema = detailsSchema
  .extend({
    quote: z
      .string()
      .trim()
      .min(1, "Enter the customer's actual review.")
      .max(4000),
    name: z
      .string()
      .trim()
      .min(1, "Enter the approved public reviewer name.")
      .max(150),
    role: z.string().trim().max(200).default(""),
    avatar: z
      .string()
      .trim()
      .max(2000)
      .refine(
        (value) => !value || isPublicMediaUrl(value),
        "Use a public image URL or upload a photo.",
      )
      .nullable()
      .default(null),
    rating: z.number().int().min(0).max(5).default(0),
    sort_order: z.number().int().min(0).max(100000).default(0),
    published: z.boolean().default(false),
  })
  .superRefine((value, ctx) => {
    if (
      value.published &&
      (!value.permission_confirmed ||
        !value.source_name ||
        !value.display_paths.length)
    ) {
      ctx.addIssue({
        code: "custom",
        message:
          "Before publishing, confirm permission, enter the review source, and select at least one display page.",
      });
    }
  });
export type ReviewDetails = z.infer<typeof detailsSchema>;
export type CustomerReview = Testimonial & ReviewDetails;

export function reviewFingerprint(
  row: Pick<Testimonial, "quote" | "name" | "role" | "avatar" | "rating">,
) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        row.quote,
        row.name,
        row.role,
        row.avatar || "",
        row.rating,
      ]),
    )
    .digest("hex");
}

export function prepareReview(data: Record<string, unknown>) {
  const result = reviewSchema.safeParse(data);
  if (!result.success)
    return {
      error: result.error.issues.map((issue) => issue.message).join(" "),
    };
  const {
    source_name,
    source_url,
    review_date,
    permission_confirmed,
    display_paths,
    ...row
  } = result.data;
  return {
    row,
    details: {
      source_name,
      source_url,
      review_date,
      permission_confirmed,
      display_paths: [...new Set(display_paths)],
      content_hash: reviewFingerprint(row),
    },
  };
}

export async function attachReviewDetails(
  rows: Testimonial[],
  db: SupabaseClient,
  publicOnly = false,
): Promise<CustomerReview[]> {
  if (!rows.length) return [];
  const { data, error } = await db
    .from("settings")
    .select("key,value")
    .in(
      "key",
      rows.map((row) => reviewKey(row.id)),
    )
    .abortSignal(AbortSignal.timeout(8000));
  if (error) throw error;
  const metadata = new Map((data ?? []).map((row) => [row.key, row.value]));
  return rows.flatMap((row) => {
    let stored: unknown;
    try {
      stored = JSON.parse(metadata.get(reviewKey(row.id)) ?? "null");
    } catch {
      stored = null;
    }
    const parsed = detailsSchema.safeParse(stored);
    const details = parsed.success ? parsed.data : detailsSchema.parse({});
    const matches =
      !!stored &&
      typeof stored === "object" &&
      "content_hash" in stored &&
      stored.content_hash === reviewFingerprint(row);
    const approved =
      matches && details.permission_confirmed && !!details.source_name;
    if (publicOnly && (!row.published || !approved)) return [];
    return [{ ...row, ...details, permission_confirmed: approved }];
  });
}
