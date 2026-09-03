import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { site } from "@/lib/site";
import { PageHeader } from "@/components/page-header";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Brand Assets & Press Kit",
  description:
    "Official Mistravora logo, brand colors, and media assets for press, partners, and AI indexing.",
  alternates: { canonical: `${site.url}/brand` },
};

const brandColors = [
  { name: "Primary", hex: "#6366f1", usage: "Buttons, links, accents" },
  { name: "Dark Surface", hex: "#0a1118", usage: "Backgrounds, dark mode" },
  { name: "Light Surface", hex: "#ffffff", usage: "Backgrounds, light mode" },
  { name: "Foreground", hex: "#f8fafc", usage: "Text on dark backgrounds" },
];

const assets = [
  {
    name: "mistravora-logo.svg",
    description: "Vector logo — scalable to any size. Use for web and print.",
    url: "/assets/mistravora-logo.svg",
    format: "SVG",
    size: "13 KB",
  },
  {
    name: "android-chrome-512x512.png",
    description: "High-resolution PNG — 512×512. Use for favicons and app icons.",
    url: "/android-chrome-512x512.png",
    format: "PNG",
    size: "512×512",
  },
  {
    name: "apple-touch-icon.png",
    description: "Apple touch icon — 180×180. Use for iOS home screen.",
    url: "/apple-touch-icon.png",
    format: "PNG",
    size: "180×180",
  },
];

export default function BrandPage() {
  return (
    <div className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Breadcrumbs items={[{ label: "Brand Assets" }]} />

        <PageHeader
          title="Brand Assets & Press Kit"
          description="Official logo and brand assets for Mistravora. Download, reference, or embed these assets for press, partnerships, and directories."
        />

        {/* Logo showcase */}
        <ScrollReveal animation="fade-up" className="mt-12">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-10">
            <div className="flex items-center justify-center rounded-2xl bg-background p-8 ring-1 ring-border">
              <Image
                src="/assets/mistravora-logo.svg"
                alt="Mistravora official company logo"
                title="Mistravora"
                width={120}
                height={120}
                className="rounded-full"
                priority
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Official logo of Mistravora — Software Solutions &amp; Digital Products
            </p>
          </div>
        </ScrollReveal>

        {/* Downloadable assets */}
        <ScrollReveal animation="fade-up" delay={100} className="mt-8">
          <h2 className="text-xl font-semibold">Download assets</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <a
                key={asset.name}
                href={asset.url}
                download
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {asset.format}
                  </span>
                  <Download className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
                <p className="font-mono text-sm font-semibold">{asset.name}</p>
                <p className="text-xs leading-5 text-muted-foreground">{asset.description}</p>
                <p className="text-xs text-muted-foreground/70">{asset.size}</p>
              </a>
            ))}
          </div>
        </ScrollReveal>

        {/* Brand colors */}
        <ScrollReveal animation="fade-up" delay={200} className="mt-10">
          <h2 className="text-xl font-semibold">Brand colors</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {brandColors.map((color) => (
              <div
                key={color.name}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
              >
                <div
                  className="h-16 w-full rounded-lg ring-1 ring-border"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{color.name}</span>
                  <code className="text-xs text-muted-foreground">{color.hex}</code>
                </div>
                <p className="text-xs text-muted-foreground">{color.usage}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Usage guidelines */}
        <ScrollReveal animation="fade-up" delay={300} className="mt-10">
          <h2 className="text-xl font-semibold">Usage guidelines</h2>
          <ul className="mt-4 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
            <li>• Use the SVG logo for web and digital applications whenever possible.</li>
            <li>• Maintain clear space around the logo equal to at least the logo height.</li>
            <li>• Do not stretch, rotate, or recolor the logo.</li>
            <li>• For dark backgrounds, the logo&apos;s built-in styling works on any surface.</li>
            <li>• When referencing Mistravora in text, use &quot;Mistravora&quot; as a proper noun.</li>
          </ul>
        </ScrollReveal>

        {/* Structured reference for AI crawlers */}
        <ScrollReveal animation="fade-up" delay={400} className="mt-10">
          <div className="rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="text-sm font-semibold">Official logo URL</h2>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              The canonical URL for the Mistravora logo is:
            </p>
            <code className="mt-2 block rounded-lg bg-background px-3 py-2 text-xs">
              {site.url}/assets/mistravora-logo.svg
            </code>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              This URL is registered in our JSON-LD Organization schema and XML image sitemap
              for search engine and AI crawler indexing.
            </p>
          </div>
        </ScrollReveal>

        {/* Contact */}
        <ScrollReveal animation="fade-up" delay={500} className="mt-10 text-center">
          <p className="text-sm text-muted-foreground">
            Need a different format or have a press inquiry?{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Contact us <ExternalLink className="inline h-3 w-3" />
            </Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
