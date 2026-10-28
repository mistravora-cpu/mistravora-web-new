import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { publicImageUrl } from "./content-preview";
import { isOptimizedImageHost } from "./image-hosts";
import { site } from "./site";

export const shareImageSize = { width: 1200, height: 630 };

export type ShareCard = {
  /** Small label above the title, e.g. "Case study" or "Blog". */
  eyebrow: string;
  title: string;
  description?: string | null;
  /** Optional cover/photo shown on the right (CMS image). */
  image?: string | null;
};

const BRAND = { bg: "#0a1118", panel: "#0f1b26", cyan: "#00c2e0", text: "#f8fafc", muted: "#9fb3c8" };

let logoData: Promise<string> | null = null;
function logo() {
  logoData ??= readFile(path.join(process.cwd(), "public/assets/mistravora-logo.svg"))
    .then(svg => `data:image/svg+xml;base64,${svg.toString("base64")}`);
  return logoData;
}

/**
 * Fetch a CMS image from an allow-listed host only (no arbitrary URLs) and
 * convert it to JPEG, which the OG renderer supports for every source format.
 */
async function coverData(src: string | null | undefined): Promise<string | null> {
  const url = publicImageUrl(src);
  if (!url) return null;
  try {
    let buffer: Buffer;
    if (url.startsWith("/")) {
      const publicDir = path.join(process.cwd(), "public");
      const file = path.resolve(publicDir, `.${decodeURIComponent(url.split(/[?#]/)[0])}`);
      if (!file.startsWith(publicDir + path.sep) || !/\.(png|jpe?g|webp|svg)$/i.test(file)) return null;
      buffer = await readFile(file);
    } else {
      if (!isOptimizedImageHost(url)) return null;
      const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!response.ok || Number(response.headers.get("content-length") ?? 0) > 15_000_000) return null;
      buffer = Buffer.from(await response.arrayBuffer());
    }
    const jpeg = await sharp(buffer, { limitInputPixels: 50_000_000 })
      .resize(520, 630, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

const clamp = (text: string, max: number) => {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6))}…`;
};

/** One branded 1200×630 social card used for every page on the site. */
export async function renderShareImage({ eyebrow, title, description, image }: ShareCard) {
  const [logoSrc, cover] = await Promise.all([logo(), coverData(image)]);
  const host = new URL(site.url).host.replace(/^www\./, "");
  const titleText = clamp(title, cover ? 80 : 110);
  const titleSize = cover
    ? (titleText.length > 55 ? 44 : titleText.length > 30 ? 52 : 62)
    : (titleText.length > 70 ? 48 : titleText.length > 40 ? 58 : 68);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: BRAND.bg, color: BRAND.text, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", position: "absolute", top: -220, left: -160, width: 640, height: 640, borderRadius: 640, background: "radial-gradient(circle, rgba(0,194,224,0.22), rgba(0,194,224,0) 70%)" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "64px 64px 56px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={64} height={64} alt="" style={{ borderRadius: 64 }} />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>Mistravora</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", alignSelf: "flex-start", fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", whiteSpace: "nowrap", color: BRAND.cyan, border: `2px solid rgba(0,194,224,0.45)`, borderRadius: 999, padding: "8px 22px" }}>
              {clamp(eyebrow, cover ? 26 : 40)}
            </div>
            <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>{titleText}</div>
            {description ? <div style={{ display: "flex", fontSize: cover ? 24 : 26, lineHeight: 1.4, color: BRAND.muted }}>{clamp(description, cover ? 85 : 150)}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24, color: BRAND.muted }}>
            <div style={{ display: "flex", color: BRAND.text, fontWeight: 700 }}>{host}</div>
            {cover ? null : <div style={{ display: "flex" }}>Software · Web · Mobile · Digital marketing</div>}
          </div>
        </div>
        {cover ? (
          <div style={{ display: "flex", width: 470, height: "100%", position: "relative", borderLeft: `4px solid ${BRAND.cyan}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} width={470} height={630} alt="" style={{ objectFit: "cover", width: 470, height: 630 }} />
          </div>
        ) : null}
        <div style={{ display: "flex", position: "absolute", left: 0, bottom: 0, width: "100%", height: 8, background: `linear-gradient(90deg, ${BRAND.cyan}, #0a8fd9)` }} />
      </div>
    ),
    { ...shareImageSize, headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" } },
  );
}
