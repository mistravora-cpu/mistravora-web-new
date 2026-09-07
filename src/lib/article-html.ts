import sanitizeHtml from "sanitize-html";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

const scope = "[data-article-content]";
function cleanCss(css: string, scoped: boolean) {
  try {
    const root = postcss.parse(css);
    root.walkAtRules(rule => { if (!scoped || !["media", "supports"].includes(rule.name.toLowerCase())) rule.remove(); });
    root.walkDecls(decl => {
      if (/url\s*\(|expression\s*\(|javascript:|\\|[<>]/i.test(decl.value) || /^(position|z-index|behavior|-moz-binding|animation.*)$/i.test(decl.prop)) decl.remove();
    });
    if (scoped) root.walkRules(rule => {
      // Nested selector rules require a separate compiler; omit them safely.
      if (rule.parent?.type === "rule") { rule.remove(); return; }
      try {
        rule.selector = selectorParser(selectors => {
          selectors.each(selector => {
            selector.walk(node => {
              if ((node.type === "tag" && /^(html|body)$/i.test(node.value)) || (node.type === "pseudo" && node.value === ":root")) {
                node.replaceWith(selectorParser.attribute({ attribute: "data-article-content", value: undefined, raws: {} }));
              }
            });
            if (!selector.toString().startsWith(scope)) {
              selector.prepend(selectorParser.combinator({ value: " " }));
              selector.prepend(selectorParser.attribute({ attribute: "data-article-content", value: undefined, raws: {} }));
            }
          });
        }).processSync(rule.selector);
      } catch { rule.remove(); }
    });
    return root.toString().replace(/</g, "\\3c ");
  } catch { return ""; }
}

function safeImage(src: string) {
  return /^\/(?!\/)/.test(src) || /^https:\/\//i.test(src);
}

/** Server-rendered article markup; no scripts, embeds, forms or global CSS. */
export function renderArticleHtml(body: string) {
  const styles: string[] = [];
  const withoutStyles = body.replace(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi, (_, css: string) => {
    styles.push(cleanCss(css, true));
    return "";
  });
  const html = sanitizeHtml(withoutStyles, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      "*": ["id", "class", "style", "title", "lang", "dir"],
      a: ["href", "title"],
      img: ["src", "alt", "width", "height", "loading", "decoding", "referrerpolicy"],
      th: ["scope", "colspan", "rowspan"], td: ["colspan", "rowspan"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      "*": (tagName, attribs) => {
        if (attribs.style) attribs.style = cleanCss(attribs.style, false);
        if (tagName === "img") {
          if (!safeImage(attribs.src || "")) delete attribs.src;
          attribs.alt ??= "";
          attribs.loading = "lazy";
          attribs.decoding = "async";
          attribs.referrerpolicy = "no-referrer";
        }
        return { tagName: tagName === "h1" ? "h2" : tagName, attribs };
      },
    },
    exclusiveFilter: frame => frame.tag === "img" && !frame.attribs.src,
  });
  return { html, css: styles.join("\n") };
}

export function safeArticleHtml(body: string) {
  return renderArticleHtml(body).html;
}
