import sanitizeHtml from "sanitize-html";

export function publicImageUrl(value: string | null | undefined): string | null {
  const src = value?.trim();
  if (!src || /[\\\u0000-\u001f\u007f]/.test(src)) return null;
  if (/^\/(?!\/)/.test(src)) return src;
  try { const url = new URL(src); return url.protocol === "https:" && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function contentText(value: string | null | undefined, limit?: number): string {
  if (!value) return "";
  const stripped = /<[a-z][\s\S]*>/i.test(value) ? sanitizeHtml(value.replace(/<\/(p|div|h[1-6]|li|section|tr)>|<br\s*\/?\s*>/gi, "$& "), {allowedTags:[],allowedAttributes:{}}) : value;
  const text = stripped.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,"&").replace(/\s+/g," ").trim();
  return limit && text.length > limit ? text.slice(0,limit-1).trimEnd()+"…" : text;
}
export function primaryContentImage(explicit: string | null | undefined, ...bodies: (string | null | undefined)[]): string | null {
  const primary = publicImageUrl(explicit);
  if (primary) return primary;
  let first: string | null = null;
  for (const body of bodies) {
    if (!body || first) continue;
    sanitizeHtml(body, {allowedTags:["img"],allowedAttributes:{img:["src"]},transformTags:{img: (tagName, attribs) => {first ||= publicImageUrl(attribs.src); return {tagName,attribs};}}});
  }
  return first;
}
export function firstContent(...values: (string | null | undefined)[]): string {
  return values.find(value => value?.trim()) ?? "";
}
