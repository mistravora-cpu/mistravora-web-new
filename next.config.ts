import type { NextConfig } from "next";

const r2PublicUrl = process.env.R2_PUBLIC_URL;
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : undefined;

// Content Security Policy — strict, production-ready.
// Prevents XSS by whitelisting trusted sources only.
// Analytics domains (GA4, Clarity) are included because they load
// conditionally after user consent via the cookie banner.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://mistravora.com https://www.googletagmanager.com https://www.clarity.ms https://sc-static.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data:",
  "img-src 'self' data: https: blob:",
  "media-src 'self'",
  "connect-src 'self' https://*.supabase.co https://mistravora.com https://www.google-analytics.com https://*.clarity.ms https://sc-static.net https://api.iconify.design",
  "frame-ancestors 'none'",
  "frame-src 'self' https://www.google.com https://maps.google.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: cspDirectives },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: r2Hostname
      ? [{ protocol: "https", hostname: r2Hostname }]
      : [],
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  // Disable browser source maps in production — prevents code exposure
  // and reduces transfer size. Server source maps still work for debugging.
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Security headers applied to all routes.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Public assets — long cache with revalidation.
        source: "/(assets)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Service worker — must not be cached or it won't update.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // llms.txt — short cache for content updates.
        source: "/llms.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  // Turbopack config — Next.js 16 uses Turbopack by default.
  // The dynamic import in RobotHeroClient isolates Three.js into a
  // separate async chunk. Turbopack handles chunk splitting automatically.
  turbopack: {},
};

export default nextConfig;
