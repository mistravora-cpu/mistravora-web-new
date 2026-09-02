import { z } from "zod";

/**
 * Environment variable validation.
 *
 * Public vars (NEXT_PUBLIC_*) are validated at build time and exposed to the
 * browser. Server-only vars are validated lazily — only when accessed by a
 * server route/action — so that builds don't fail when secrets aren't present
 * locally (e.g. during PR previews).
 */

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

/**
 * Server-only environment access.
 * Throws if a required secret is missing when actually called.
 * This prevents accidental exposure to the client bundle.
 */
export const serverEnv = {
  get SUPABASE_URL() {
    const v = process.env.SUPABASE_URL;
    if (!v) throw new Error("SUPABASE_URL is not set");
    return v;
  },
  get SUPABASE_SERVICE_ROLE_KEY() {
    const v = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!v) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return v;
  },
  get ANTHROPIC_API_KEY() {
    return process.env.ANTHROPIC_API_KEY ?? "";
  },
  get RESEND_API_KEY() {
    return process.env.RESEND_API_KEY ?? "";
  },
  get PAGESPEED_API_KEY() {
    return process.env.PAGESPEED_API_KEY ?? "";
  },
  get R2_ACCESS_KEY_ID() {
    const v = process.env.R2_ACCESS_KEY_ID;
    if (!v) throw new Error("R2_ACCESS_KEY_ID is not set");
    return v;
  },
  get R2_SECRET_ACCESS_KEY() {
    const v = process.env.R2_SECRET_ACCESS_KEY;
    if (!v) throw new Error("R2_SECRET_ACCESS_KEY is not set");
    return v;
  },
  get R2_ENDPOINT() {
    const v = process.env.R2_ENDPOINT;
    if (!v) throw new Error("R2_ENDPOINT is not set");
    return v;
  },
  get R2_BUCKET_NAME() {
    const v = process.env.R2_BUCKET_NAME;
    if (!v) throw new Error("R2_BUCKET_NAME is not set");
    return v;
  },
  get R2_PUBLIC_URL() {
    const v = process.env.R2_PUBLIC_URL;
    if (!v) throw new Error("R2_PUBLIC_URL is not set");
    return v;
  },
};
