import { NextResponse } from "next/server";
import { getCaseStudies } from "@/lib/services";
import { site } from "@/lib/site";

export const revalidate = 300;

// AI agent API: /api/case-studies
// Returns structured case study data for AI consumption.
export async function GET() {
  const caseStudies = await getCaseStudies(true);

  return NextResponse.json({
    company: site.name,
    endpoint: "/api/case-studies",
    count: caseStudies.length,
    case_studies: caseStudies.map((cs) => ({
      title: cs.title,
      slug: cs.slug,
      url: `${site.url}/case-studies/${cs.slug}`,
      client: cs.client,
      industry: cs.industry,
      location: cs.location,
      date: cs.date,
      problem: cs.problem_statement,
      solution: cs.solution,
      outcome: cs.outcome,
      results: cs.results,
      technologies: cs.technologies,
    })),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
