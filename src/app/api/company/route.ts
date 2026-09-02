import { NextResponse } from "next/server";
import { getContactInfo, getSocialMedia, getSettings } from "@/lib/services";
import { site } from "@/lib/site";

export const revalidate = 300;

// AI agent API: /api/company
// Returns structured company information for AI consumption.
export async function GET() {
  const [contactInfo, socialMedia, settings] = await Promise.all([
    getContactInfo(),
    getSocialMedia(true),
    getSettings(),
  ]);

  const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

  return NextResponse.json({
    name: site.name,
    legal_name: site.name,
    url: site.url,
    tagline: settingsMap.get("site_tagline") ?? "Software Solutions & Digital Products",
    description: "Mistravora is a software company in Sri Lanka building high-performance web platforms, custom dashboards, and AI-driven tools for ambitious companies worldwide.",
    email: contactInfo?.email ?? site.email,
    phone: contactInfo?.phone ?? site.phone,
    whatsapp: contactInfo?.whatsapp ?? site.whatsapp,
    address: contactInfo?.address ?? site.address,
    geo: {
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    business_hours: settingsMap.get("business_hours") ?? "Mon-Fri 9:00-18:00",
    timezone: settingsMap.get("timezone") ?? "Asia/Colombo",
    social_profiles: socialMedia.map((s) => ({
      platform: s.platform,
      url: s.url,
    })),
    areas_served: ["Sri Lanka", "Worldwide (remote)"],
    founded: "2019",
    type: "Software Company",
    services: [
      "Web Development",
      "Software Development",
      "AI Development",
      "Mobile App Development",
      "ERP Development",
      "POS Development",
      "CRM Development",
      "UI/UX Design",
      "Digital Marketing",
      "SEO",
      "Cloud Solutions",
    ],
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
