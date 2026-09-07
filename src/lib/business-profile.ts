import "server-only";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { businessProfileFromRows, publicBusinessKeys } from "./business-profile-data";

// CMS-controlled content with server caching; admin saves invalidate public-data.
// Only this explicit public projection may be serialized into client components.
export const getBusinessProfile = unstable_cache(async () => {
  const { data, error } = await createPublicClient().from("settings").select("key,value")
    .in("key", publicBusinessKeys).abortSignal(AbortSignal.timeout(8000));
  if (error) throw error;
  const { data: contact, error: contactError } = await createPublicClient().from("contact_info")
    .select("email,phone,whatsapp,address").order("created_at").limit(1).abortSignal(AbortSignal.timeout(8000)).maybeSingle();
  if (contactError) throw contactError;
  const rows = [...(data ?? [])];
  if (contact) for (const field of ["email", "phone", "whatsapp", "address"] as const) {
    if (contact[field] != null) rows.push({ key: `site_${field}`, value: contact[field] });
  }
  return businessProfileFromRows(rows);
}, ["public-business-profile-v2"], { revalidate: 300, tags: ["public-data"] });
