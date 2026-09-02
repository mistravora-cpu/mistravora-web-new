import { NextResponse } from "next/server";
import { getSolutions } from "@/lib/services";
import { site } from "@/lib/site";

export const revalidate = 300;

// AI agent API: /api/services
// Returns structured JSON of all published solutions for AI consumption.
export async function GET() {
  const solutions = await getSolutions(true);

  return NextResponse.json({
    company: site.name,
    url: site.url,
    endpoint: "/api/services",
    count: solutions.length,
    services: solutions.map((s) => ({
      title: s.title,
      slug: s.slug,
      url: `${site.url}/solutions#${s.slug}`,
      summary: s.summary,
      category: s.category,
      features: s.features,
      technologies: s.technologies,
      services: s.services,
      process_steps: s.process_steps,
      pricing_packages: s.pricing_packages,
    })),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
