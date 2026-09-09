"use server";
import { requireAdmin } from "@/lib/auth";
import { renderArticleHtml } from "@/lib/article-html";
export async function previewContent(body: string) {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (typeof body !== "string" || body.length > 200000)
    return { error: "Preview supports up to 200,000 characters." };
  const escape = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const result = /<[a-z][\s\S]*>/i.test(body)
    ? renderArticleHtml(body)
    : { html: `<p style="white-space:pre-wrap">${escape(body)}</p>`, css: "" };
  return {
    document: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>body{font-family:system-ui,sans-serif;color:#182533;margin:20px;line-height:1.7}*{box-sizing:border-box}img{max-width:100%;height:auto}pre,table{max-width:100%;overflow:auto}a{color:#075985}h2,h3{line-height:1.3}${result.css}</style></head><body><div data-article-content><div data-article-root>${result.html}</div></div></body></html>`,
  };
}
