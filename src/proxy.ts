import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

const publicRoots = new Set(["", "about", "admin", "api", "assistant", "authors", "blog", "book", "brand", "careers", "contact", "dashboard", "glossary", "industries", "insights", "knowledge-base", "policies", "pricing", "projects", "research", "resources", "search", "services", "share", "solutions", "tools", "unsubscribe", "_next", "_not-found"]);
export async function proxy(request: NextRequest) {
  const root = request.nextUrl.pathname.split("/")[1];
  if (!publicRoots.has(root) && !root.includes(".")) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  }
  // Vercel owns the primary-domain redirect. Redirecting hosts here can
  // reverse its domain setting and create an apex <-> www redirect loop.
  // 1. Refresh Supabase session + enforce RBAC on /dashboard and /admin.
  const response = await updateSession(request);

  if (request.nextUrl.pathname === "/admin" || request.nextUrl.pathname.startsWith("/dashboard")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  // 2. Add security headers to every response (including API routes).
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: [
    // Run on all routes except static assets.
    "/((?!_next/static|_next/image|favicon.ico|sw.js|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|bmp|mp4|webm|mp3|ogg|wav|pdf)$).*)",
  ],
};
