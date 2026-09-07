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

export function hasArticleStyles(body: string) {
  return /<style\b|\sstyle\s*=/i.test(body);
}

/** Internal CSS stays inside a fully sandboxed, script-free document. */
export function articleDocument(body: string) {
  const policy = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
  const styledHtml = sanitizeHtml(body, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "style", "html", "head", "body"],
    allowedAttributes: {
      "*": ["id", "class", "style", "title", "lang", "dir"],
      a: ["href", "title"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    // Styles are allowed only in the isolated frame, under its restrictive CSP.
    allowVulnerableTags: true,
  });
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html{color-scheme:light}body{margin:0;padding:16px;font-family:system-ui,sans-serif;line-height:1.6;overflow-wrap:anywhere}*,*::before,*::after{box-sizing:border-box}img,svg,canvas,video{max-width:100%}pre{overflow-x:auto}button,input,select,textarea{font:inherit}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}</style></head><body>${styledHtml}</body></html>`;
}
