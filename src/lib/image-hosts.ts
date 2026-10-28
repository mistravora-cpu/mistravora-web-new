/**
 * External image hosts served through the Next.js image optimizer. Images from
 * these hosts are resized, converted to AVIF/WebP and delivered from our own
 * domain, so visitors never receive third-party cookies from them.
 */
export const optimizedImageHosts = [
  "miro.medium.com",
  "cdn-images-1.medium.com",
  "shopmateapp.com",
  "cdn.simpleicons.org",
  "api.iconify.design",
] as const;

const r2Host = (() => {
  try { return process.env.R2_PUBLIC_URL ? new URL(process.env.R2_PUBLIC_URL).hostname : null; } catch { return null; }
})();

export function isOptimizedImageHost(src: string): boolean {
  try {
    const { protocol, hostname } = new URL(src);
    return protocol === "https:" && (hostname === r2Host || (optimizedImageHosts as readonly string[]).includes(hostname));
  } catch {
    return false;
  }
}

/** Same-origin optimizer URL for an allowed remote image (width must be a configured size). */
export function optimizedImageUrl(src: string, width = 1200, quality = 75): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
