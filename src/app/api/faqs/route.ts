import { NextResponse } from "next/server";
import { getFaqs } from "@/lib/services";
import { site } from "@/lib/site";

export const revalidate = 300;

// AI agent API: /api/faqs
// Returns structured FAQ data for AI consumption.
export async function GET() {
  const faqs = await getFaqs(undefined, true);

  return NextResponse.json({
    company: site.name,
    endpoint: "/api/faqs",
    count: faqs.length,
    faqs: faqs.map((f) => ({
      page: f.page,
      question: f.question,
      answer: f.answer,
    })),
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Content-Type": "application/json",
    },
  });
}
