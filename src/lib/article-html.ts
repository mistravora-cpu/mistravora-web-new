import sanitizeHtml from "sanitize-html";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { publicImageUrl } from "./content-preview";

const defaultScope = "[data-article-content]";
function cleanCss(css: string, scope: string | null) {
  try {
    const root = postcss.parse(css);
    root.walkAtRules(rule => { if (!scope || !["media", "supports"].includes(rule.name.toLowerCase())) rule.remove(); });
    root.walkDecls(decl => {
      if (/url\s*\(|(?:-webkit-)?image-set\s*\(|expression\s*\(|javascript:|\\|[<>]/i.test(decl.value) || /\\|^(position|z-index|behavior|-moz-binding|animation.*)$/i.test(decl.prop)) decl.remove();
    });
    if (scope) root.walkRules(rule => {
      if (rule.parent?.type === "rule") { rule.remove(); return; }
      try {
        // The prefix always targets an outer wrapper. Body/root selectors point
        // at its inner content node, so sibling combinators cannot escape it.
        const local = selectorParser(selectors => {
          selectors.each(selector => {
            selector.walk(node => {
              if (node.type === "nesting") throw Error("Nested CSS is not supported");
              if (node.type === "tag" && node.value.toLowerCase() === "h1") node.value = "h2";
              if ((node.type === "tag" && /^(html|body)$/i.test(node.value)) || (node.type === "pseudo" && node.value === ":root")) {
                node.replaceWith(selectorParser.attribute({ attribute:"data-article-root",value:undefined,raws:{} }));
              }
            });
            // Full documents often use `html body`. Both refer to the same
            // local content root, so collapse that leading descendant chain.
            while (selector.nodes[0]?.type === "attribute" && selector.nodes[0].attribute === "data-article-root" && selector.nodes[1]?.type === "combinator" && ["", ">"].includes(selector.nodes[1].value.trim()) && selector.nodes[2]?.type === "attribute" && selector.nodes[2].attribute === "data-article-root") {
              selector.nodes[1].remove();
              selector.nodes[1].remove();
            }
          });
        }).processSync(rule.selector);
        rule.selector = selectorParser(selectors => {
          selectors.each(selector => { selector.prepend(selectorParser.combinator({value:" "})); const prefix=selectorParser().astSync(scope).first; for(const node of [...prefix.nodes].reverse())selector.prepend(node.clone()); });
        }).processSync(local);
      } catch { rule.remove(); }
    });
    return root.toString().replace(/<\//g,"\\3c /");
  } catch { return ""; }
}

/** Render readable HTML and block-local CSS on the server. No executable content. */
export function renderArticleHtml(body: string, scope = defaultScope) {
  if (!/^\[data-article-(?:content|scope="[a-f0-9]+")\]$/.test(scope)) throw Error("Invalid content scope");
  const styles: string[] = [];
  const withoutStyles = body.replace(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi,(_,css:string)=>{styles.push(cleanCss(css,scope));return "";});
  const html = sanitizeHtml(withoutStyles, {
    allowedTags:[...sanitizeHtml.defaults.allowedTags,"img","details","summary"],
    allowedAttributes:{
      "*": ["id","class","style","title","lang","dir","aria-label"],
      a:["href","title"], img:["src","alt","width","height","loading","decoding","referrerpolicy"],
      details:["open"], th:["scope","colspan","rowspan"],td:["colspan","rowspan"],
    },
    allowedSchemes:["https","http","mailto"],allowProtocolRelative:false,
    transformTags:{"*":(tagName,attribs)=>{
      if(attribs.style)attribs.style=cleanCss(attribs.style,null);
      if(tagName==="img") {
        const src=publicImageUrl(attribs.src); if(src)attribs.src=src;else delete attribs.src;
        attribs.alt??="";attribs.loading="lazy";attribs.decoding="async";attribs.referrerpolicy="no-referrer";
        for(const key of ["width","height"])if(attribs[key] && !/^[1-9]\d{0,4}$/.test(attribs[key]))delete attribs[key];
      }
      return {tagName:tagName==="h1"?"h2":tagName,attribs};
    }},
    exclusiveFilter:frame=>frame.tag==="img"&&!frame.attribs.src,
  });
  return {html,css:styles.join("\n")};
}
export function safeArticleHtml(body:string){return renderArticleHtml(body).html;}
