import { NextResponse } from "next/server";
import { getIndustries } from "@/lib/services";
import { site } from "@/lib/site";

export const revalidate = 300;

// AI agent API: /api/industries
// Returns structured industry data for AI consumption.
export async function GET() {
  const industries = await getIndustries(true);

  return NextResponse.json({
    company: site.name,
    endpoint: "/api/industries",
    count: industries.length,
    industries: industries.map((ind) => ({
      title: ind.title,
      slug: ind.slug,
      url: `${site.url}/industries/${ind.slug}`,
      summary: ind.summary,
      description: ind.description,
      challenges: ind.challenges,
      solutions: ind.solutions,
    })),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
