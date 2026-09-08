import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { parseHeroMedia } from "./hero-media-config";
export const getHeroMedia = unstable_cache(async () => {
  const {data, error} = await createPublicClient().from("settings").select("value").eq("key", "hero_media_config").abortSignal(AbortSignal.timeout(8000)).maybeSingle();
  if (error) throw error;
  return parseHeroMedia(data?.value);
}, ["hero-media-config"], {revalidate:300, tags:["public-data"]});
