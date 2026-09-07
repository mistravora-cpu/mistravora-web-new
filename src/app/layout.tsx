import { getBusinessProfile } from "@/lib/business-profile";
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OrganizationJsonLd } from "@/components/json-ld";
import { Analytics } from "@/components/analytics-lazy";
import { ServiceWorker } from "@/components/service-worker";
import { SiteBackground } from "@/components/site-background";
import { SeoVerification } from "@/components/seo-verification";
import { ScrollProgress } from "@/components/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  // Avoid a late font swap moving the hero on slow connections.
  display: "optional",
  // Optional fonts may not be used on the first visit; load through CSS on demand.
  preload: false,
  adjustFontFallback: true,
});

const siteUrl = "https://mistravora.com";

const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mistravora — Software Solutions & Digital Products",
    template: "%s | Mistravora",
  },
  description:
    "Mistravora builds high-performance software, web platforms, and digital products for ambitious businesses in Sri Lanka and worldwide.",
  keywords: [
    "Mistravora",
    "software development Sri Lanka",
    "web development",
    "custom software",
    "Next.js development",
  ],
  authors: [{ name: "Mistravora", url: siteUrl }],
  creator: "Mistravora",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Mistravora",
    title: "Mistravora | Software & Digital Solutions",
    description:
      "Mistravora builds high-performance software, web platforms, and digital products for ambitious businesses.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Mistravora Official Logo and Brand Identity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mistravora",
    description:
      "Mistravora builds high-performance software, web platforms, and digital products.",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const p = await getBusinessProfile();
  return { ...baseMetadata, title: { default: `${p.name} — ${p.headline}`, template: `%s | ${p.name}` },
    description: p.intro, authors: [{ name: p.name, url: p.url }], creator: p.name,
    openGraph: { ...baseMetadata.openGraph, title: p.headline, description: p.intro, siteName: p.name },
    twitter: { ...baseMetadata.twitter, title: p.name, description: p.intro } };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1118" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} h-full antialiased`}
    >
      <head />

      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* SEO verification meta tags — stream in via Suspense so they
              don't block the initial HTML response. Search engines fetch
              these asynchronously so a slight delay is fine. */}
          <Suspense fallback={null}>
            <SeoVerification />
          </Suspense>
          <OrganizationJsonLd />
          {/* Optional tracking paused pending provider and consent review. */}
          <ScrollProgress />
          <SiteBackground />
          {children}
          <Suspense fallback={null}><CookieControls /></Suspense>
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}

async function CookieControls() {
  const profile = await getBusinessProfile();
  return <Analytics showBanner={profile.cookieBannerEnabled !== "false"} />;
}
