import { NextResponse } from "next/server";
import { getCollection } from "@/lib/content";
import { getFaqs } from "@/lib/services";
export const revalidate = 300;
export async function GET() { const [services, glossary, guides, faqs] = await Promise.all([getCollection("services"), getCollection("glossary"), getCollection("knowledge-base"), getFaqs(undefined,true)]); return NextResponse.json({ services, glossary, guides, faqs: faqs.map(f => ({ question: f.question, answer: f.answer })) }); }
