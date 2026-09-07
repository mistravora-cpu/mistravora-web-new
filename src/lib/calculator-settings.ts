import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { calculatorDefaults, calculatorSchema } from "./calculator-config";
export const getCalculatorConfig = unstable_cache(async () => {
  const {data,error} = await createPublicClient().from("settings").select("value").eq("key","pricing_calculator_config").maybeSingle();
  if(error) throw error;
  if(!data?.value) return calculatorDefaults;
  return calculatorSchema.parse(JSON.parse(data.value));
}, ["public-calculator-config"], {tags:["public-data"],revalidate:300});
