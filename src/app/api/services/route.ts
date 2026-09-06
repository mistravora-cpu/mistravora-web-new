import { NextResponse } from "next/server";
import { getCollection } from "@/lib/content";
import { getBusinessProfile } from "@/lib/business-profile";
export const revalidate = 300;
export async function GET() {
  const [services, profile] = await Promise.all([getCollection("services"), getBusinessProfile()]);
  return NextResponse.json({ company: profile.name, url: profile.url, endpoint: "/api/services", count: services.length,
    services: services.map(s => ({ title: s.title, slug: s.slug, url: `${profile.url}/services/${s.slug}`, summary: s.description,
      category: s.category, features: s.features, technologies: s.technologies }))
  }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
