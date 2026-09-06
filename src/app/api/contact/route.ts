import { NextResponse } from "next/server";
import { getContactInfo, getSocialMedia } from "@/lib/services";
import { getBusinessProfile } from "@/lib/business-profile";

export const revalidate = 300;

// AI agent API: /api/contact
// Returns structured contact information for AI consumption.
export async function GET() {
  const site = await getBusinessProfile();
  const [contactInfo, socialMedia] = await Promise.all([
    getContactInfo(),
    getSocialMedia(true),
  ]);

  return NextResponse.json({
    company: site.name,
    endpoint: "/api/contact",
    headline: contactInfo?.headline ?? "Get in Touch",
    description: contactInfo?.description,
    email: contactInfo?.email ?? site.email,
    phone: contactInfo?.phone ?? site.phone,
    whatsapp: contactInfo?.whatsapp ?? site.whatsapp,
    address: contactInfo?.address ?? site.address,
    availability: site.availability,
    response_expectation: site.response,
    social: socialMedia.map((s) => ({
      platform: s.platform,
      url: s.url,
    })),
    contact_page_url: `${site.url}/contact`,
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
