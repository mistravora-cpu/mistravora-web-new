import { NextResponse } from "next/server";
import { getBusinessProfile } from "@/lib/business-profile";
import { getSocialMedia } from "@/lib/services";
export const revalidate = 300;
export async function GET() {
  const [profile, social] = await Promise.all([getBusinessProfile(), getSocialMedia(true)]);
  return NextResponse.json({ name: profile.name, url: profile.url, description: profile.description,
    tagline: profile.tagline, founder: profile.founder, cofounder: profile.cofounder, founded: profile.founded,
    type: "Digital Solutions Company", email: profile.email, phone: profile.phone, whatsapp: profile.whatsapp,
    address: profile.address, business_hours: profile.availability, response_expectation: profile.response,
    timezone: profile.timezone, areas_served: profile.coverage, customer_types: profile.customers,
    industries: profile.industries, services: profile.offering.split("\n").filter(Boolean),
    social_profiles: social.map(s => ({ platform: s.platform, url: s.url }))
  }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
