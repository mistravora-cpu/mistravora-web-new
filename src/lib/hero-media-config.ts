import { z } from "zod";
const url = z.string().max(2000).refine(value => {
  try { const parsed = new URL(value); return parsed.protocol === "https:" && !parsed.username && !parsed.password; } catch { return false; }
}, "Use a direct HTTPS media URL.");
export const heroMediaSchema = z.record(z.string().regex(/^\/(?:[a-z0-9-]+\/?)*$/), z.array(z.object({
  url, type: z.enum(["image", "video"]), alt: z.string().trim().min(1).max(300),
})).max(12));
export type HeroMediaConfig = z.infer<typeof heroMediaSchema>;
export function parseHeroMedia(value?: string | null): HeroMediaConfig {
  if (!value) return {};
  try { return heroMediaSchema.parse(JSON.parse(value)); } catch { return {}; }
}
