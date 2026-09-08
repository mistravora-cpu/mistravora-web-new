import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import defaults from "./defaults.json";
import { requirementConfigSchema } from "./schema";
export const getRequirementConfig = unstable_cache(
  async () => {
    const { data, error } = await createPublicClient()
      .from("settings")
      .select("value")
      .eq("key", "requirement_calculator_config")
      .abortSignal(AbortSignal.timeout(8000))
      .maybeSingle();
    if (error) throw error;
    return requirementConfigSchema.parse(
      data?.value ? JSON.parse(data.value) : defaults,
    );
  },
  ["requirement-calculator-v1"],
  { tags: ["public-data"], revalidate: 300 },
);
