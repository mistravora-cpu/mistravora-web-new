import { applySeoOverrides } from "@/lib/seo-overrides";
import { notFound } from "next/navigation";
import { collections, isCollection, getCollection } from "@/lib/content";
import { ContentGrid, ContentShell } from "@/components/content-page";
import { pageMetadata } from "@/lib/seo";
export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(collections).filter(section => section !== "solutions").map(section => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params; if (!isCollection(section)) notFound();
  return applySeoOverrides(pageMetadata(collections[section].title, collections[section].description, `/${section}`));
}
export default async function CollectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params; if (!isCollection(section)) notFound();
  const entries = await getCollection(section);
  return <ContentShell {...collections[section]}><ContentGrid entries={entries} prefix={`/${section}`} /></ContentShell>;
}
