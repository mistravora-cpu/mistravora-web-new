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
