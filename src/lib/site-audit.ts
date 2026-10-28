import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type AuditScores = { performance: number; accessibility: number; bestPractices: number; seo: number };
export type AuditCheck = { category: keyof AuditScores; label: string; passed: boolean; advice: string };
export type AuditResult = { url: string; source: "lighthouse" | "quick-check"; scores: AuditScores; checks: AuditCheck[] };

const MAX_BYTES = 2_000_000;
const MAX_REDIRECTS = 4;

/** Reject loopback, private, link-local, CGNAT, multicast and reserved ranges. */
export function isPublicAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return !(
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 168 || b === 0)) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  if (version === 6) {
    const ip = address.toLowerCase();
    const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicAddress(mapped[1]);
    return !(ip === "::" || ip === "::1" || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip) || ip.startsWith("ff") || ip.startsWith("2001:db8"));
  }
  return false;
}

async function assertPublicHost(url: URL) {
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Use a public http(s) website address.");
  if (url.port && !["80", "443"].includes(url.port)) throw new Error("Use a standard website address without a custom port.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(host)) throw new Error("Use a public website address.");
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || !addresses.every(({ address }) => isPublicAddress(address))) throw new Error("Use a public website address.");
}

async function readLimited(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder().decode(Buffer.concat(chunks).subarray(0, MAX_BYTES));
}

/** Fetch a public page, validating every redirect hop against private networks. */
async function fetchPublicPage(start: string) {
  let url = new URL(start);
  const begun = Date.now();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertPublicHost(url);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: { "user-agent": "MistravoraAudit/1.0 (+https://mistravora.com/tools/website-audit)", accept: "text/html,application/xhtml+xml" },
    });
    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url);
      continue;
    }
    const ttfb = Date.now() - begun;
    if (!response.ok) throw new Error(`The website responded with status ${response.status}.`);
    if (!/html/i.test(response.headers.get("content-type") ?? "")) throw new Error("That address does not return an HTML page.");
    const html = await readLimited(response);
    return { finalUrl: url, response, html, ttfb, bytes: Buffer.byteLength(html) };
  }
  throw new Error("The website redirected too many times.");
}

// HTML allows double-quoted, single-quoted and unquoted attribute values.
const attr = (tag: string, name: string) => {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i"));
  return (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
};
const metaContent = (html: string, key: string) => {
  const tag = (html.match(/<meta\b[^>]*>/gi) ?? []).find(t => [attr(t, "name"), attr(t, "property")].some(v => v.toLowerCase() === key));
  return tag ? attr(tag, "content") : "";
};

/** Lightweight on-page audit used when Google PageSpeed is unavailable. */
export async function quickAudit(target: string): Promise<AuditResult> {
  const { finalUrl, response, html, ttfb, bytes } = await fetchPublicPage(target);
  const head = html.slice(0, 200_000);
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? "";
  const description = metaContent(head, "description");
  const viewport = metaContent(head, "viewport");
  const robots = metaContent(head, "robots");
  const images = html.match(/<img\b[^>]*>/gi) ?? [];
  const withAlt = images.filter(img => /\salt\s*=/i.test(img)).length;
  const sized = images.filter(img => /\swidth\s*=/i.test(img) && /\sheight\s*=/i.test(img)).length;
  const h1s = (html.match(/<h1\b/gi) ?? []).length;
  const scripts = (html.match(/<script\b[^>]*\bsrc\s*=/gi) ?? []).length;
  const inputs = (html.match(/<input\b[^>]*>/gi) ?? []).filter(i => !["hidden", "submit", "button", "reset", "image"].includes(attr(i, "type").toLowerCase()));
  const labelFor = new Set((html.match(/<label\b[^>]*>/gi) ?? []).map(l => attr(l, "for")).filter(Boolean));
  const labelled = inputs.filter(i => /\saria-label(?:ledby)?\s*=|\stitle\s*=/i.test(i) || labelFor.has(attr(i, "id"))).length;
  const https = finalUrl.protocol === "https:";
  const header = (name: string) => response.headers.get(name) ?? "";

  const checks: AuditCheck[] = [
    { category: "seo", label: "Page title", passed: title.length >= 10 && title.length <= 65, advice: "Use a unique, descriptive title of about 10–65 characters." },
    { category: "seo", label: "Meta description", passed: description.length >= 50 && description.length <= 165, advice: "Add a meta description of about 50–160 characters." },
    { category: "seo", label: "One main heading (H1)", passed: h1s === 1, advice: "Use exactly one H1 heading per page." },
    { category: "seo", label: "Canonical URL", passed: (head.match(/<link\b[^>]*>/gi) ?? []).some(l => attr(l, "rel").toLowerCase() === "canonical"), advice: "Add a canonical link to avoid duplicate-content issues." },
    { category: "seo", label: "Indexable by search engines", passed: !/noindex/i.test(robots) && !/noindex/i.test(header("x-robots-tag")), advice: "Remove noindex if this page should appear in search." },
    { category: "seo", label: "Social sharing tags", passed: Boolean(metaContent(head, "og:title") && metaContent(head, "og:image")), advice: "Add Open Graph title and image tags for link previews." },
    { category: "seo", label: "Structured data", passed: /application\/ld\+json/i.test(html), advice: "Add JSON-LD structured data (e.g. Organization, LocalBusiness)." },
    { category: "accessibility", label: "Page language", passed: /^[a-z]{2,3}\b/i.test(attr(html.match(/<html\b[^>]*>/i)?.[0] ?? "", "lang")), advice: "Declare the page language on the <html> element." },
    { category: "accessibility", label: "Image text alternatives", passed: images.length === 0 || withAlt === images.length, advice: `Add alt text to every image (${images.length - withAlt} missing).` },
    { category: "accessibility", label: "Zoom allowed", passed: !/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(viewport), advice: "Do not disable pinch-zoom in the viewport tag." },
    { category: "accessibility", label: "Form fields labelled", passed: inputs.length === 0 || labelled === inputs.length, advice: "Give every form field a visible label." },
    { category: "bestPractices", label: "Secure HTTPS", passed: https, advice: "Serve the website over HTTPS." },
    { category: "bestPractices", label: "HSTS header", passed: Boolean(header("strict-transport-security")), advice: "Send a Strict-Transport-Security header." },
    { category: "bestPractices", label: "No insecure resources", passed: !https || !/\s(?:src|href)\s*=\s*["']http:\/\//i.test(html), advice: "Load all scripts, styles and images over HTTPS." },
    { category: "bestPractices", label: "HTML5 doctype and charset", passed: /^\s*<!doctype html>/i.test(html) && /<meta\b[^>]*charset/i.test(head), advice: "Start with <!doctype html> and declare a character set." },
    { category: "bestPractices", label: "Security headers", passed: Boolean(header("content-security-policy") && header("x-content-type-options")), advice: "Add Content-Security-Policy and X-Content-Type-Options headers." },
    { category: "performance", label: "Fast server response", passed: ttfb < 800, advice: `Server responded in ${ttfb} ms — aim for under 800 ms.` },
    { category: "performance", label: "Lightweight HTML", passed: bytes < 500_000, advice: `HTML is ${Math.round(bytes / 1024)} KB — keep it under 500 KB.` },
    { category: "performance", label: "Text compression", passed: Boolean(header("content-encoding")) || bytes < 20_000, advice: "Enable gzip or Brotli compression." },
    { category: "performance", label: "Limited scripts", passed: scripts <= 20, advice: `${scripts} external scripts found — reduce or defer them.` },
    { category: "performance", label: "Image dimensions set", passed: images.length === 0 || sized / images.length >= 0.8, advice: "Set width and height on images to prevent layout shifts." },
    { category: "performance", label: "Mobile viewport", passed: /width\s*=\s*device-width/i.test(viewport), advice: "Add a responsive viewport meta tag." },
  ];
  const score = (category: keyof AuditScores) => {
    const group = checks.filter(c => c.category === category);
    return Math.round((group.filter(c => c.passed).length / group.length) * 100);
  };
  return {
    url: finalUrl.toString(),
    source: "quick-check",
    scores: { performance: score("performance"), accessibility: score("accessibility"), bestPractices: score("bestPractices"), seo: score("seo") },
    checks,
  };
}
