import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { OrganizationJsonLd } from "@/components/json-ld";
import { Analytics } from "@/components/analytics-lazy";
import { ServiceWorker } from "@/components/service-worker";
import { SiteBackground } from "@/components/site-background";
import { HeaderScrollFx } from "@/components/header-scroll-fx";
import { MarketingTags } from "@/components/marketing-tags";
import { SeoVerification } from "@/components/seo-verification";
import { ScrollProgress } from "@/components/scroll-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const siteUrl = "https://mistravora.com";

export const metadata: Metadata = {
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
    title: "Mistravora — Software Solutions & Digital Products",
    description:
      "Mistravora builds high-performance software, web platforms, and digital products for ambitious businesses.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mistravora — Software Solutions & Digital Products",
    description:
      "Mistravora builds high-performance software, web platforms, and digital products.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
      <head>
        {/* Preconnect to Supabase for faster client-side auth/API calls. */}
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
            <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
          </>
        )}
      </head>
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
          {/* Marketing tags — stream in via Suspense. These are all
              afterInteractive scripts and don't block paint. */}
          <Suspense fallback={null}>
            <MarketingTags />
          </Suspense>
          <ScrollProgress />
          <SiteBackground />
          <HeaderScrollFx />
          {children}
          <Analytics />
          <ServiceWorker />
        </ThemeProvider>
      </body>
    </html>
  );
}
