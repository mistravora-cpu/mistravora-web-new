import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/services";
import { site } from "@/lib/site";
export const revalidate = 300;
export async function GET() { return NextResponse.json({ articles: (await getPublishedPosts()).map(p => ({ title: p.title, description: p.excerpt, url: `${site.url}/blog/${p.slug}`, published_at: p.published_at, updated_at: p.updated_at })) }); }
