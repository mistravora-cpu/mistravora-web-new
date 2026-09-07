import sanitizeHtml from "sanitize-html";

/** Editorial HTML cannot load scripts, frames, tracking pixels or active forms. */
export function safeArticleHtml(body: string) {
  return sanitizeHtml(body, {
    allowedTags: sanitizeHtml.defaults.allowedTags.filter(tag => !["img", "iframe", "form"].includes(tag)),
    allowedAttributes: { a: ["href", "title"], th: ["scope", "colspan", "rowspan"], td: ["colspan", "rowspan"] },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
  });
}

export function hasArticleCode(body: string) {
  return /<(?:script|style)\b|\s(?:style|on[a-z]+)\s*=/i.test(body);
}

/** This document must only be used with sandbox="allow-scripts", without allow-same-origin. */
export function articleDocument(body: string) {
  const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html{color-scheme:light}body{margin:0;padding:16px;font-family:system-ui,sans-serif;line-height:1.6;overflow-wrap:anywhere}*,*::before,*::after{box-sizing:border-box}img,svg,canvas,video{max-width:100%}pre{overflow-x:auto}button,input,select,textarea{font:inherit}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}</style></head><body>${body}</body></html>`;
}
