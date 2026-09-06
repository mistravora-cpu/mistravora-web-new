import { ImageResponse } from "next/og";
import { collections, isCollection, getCollection } from "@/lib/content";
import { getPostBySlug, getCaseStudyBySlug, getResearchBySlug, getIndustryBySlug } from "@/lib/services";
export const revalidate = 86400;
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  let title = path.map(p => p.replace(/-/g, " ")).join(" · ");
  const [section, slug] = path;
  if (isCollection(section)) title = slug ? (await getCollection(section)).find(e => e.slug === slug)?.title ?? title : collections[section].title;
  if (slug && section === "blog") title = (await getPostBySlug(slug))?.title ?? title;
  if (slug && section === "projects") title = (await getCaseStudyBySlug(slug))?.title ?? title;
  if (slug && section === "research") title = (await getResearchBySlug(slug))?.title ?? title;
  if (slug && section === "industries") title = (await getIndustryBySlug(slug))?.title ?? title;
  if (section === "home") title = "Software that grows your business";
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(135deg,#0a1118,#16213e)", color: "white", padding: 80, justifyContent: "space-between" }}><div style={{ display: "flex", fontSize: 30, color: "#a5b4fc" }}>MISTRAVORA</div><div style={{ display: "flex", fontSize: 60, fontWeight: 700, maxWidth: 1000 }}>{title.slice(0, 130)}</div><div style={{ display: "flex", fontSize: 26 }}>Software · AI · Digital products | mistravora.com</div></div>, { width: 1200, height: 630 });
}
