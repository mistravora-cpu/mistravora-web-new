import { contentText } from "./content-preview";

/** Accept only the output of renderArticleHtml, never raw CMS HTML. */
export function articleNavigation(html: string, prefix: string) {
  const headings: { id: string; text: string; level: number }[] = [];
  const used = new Set([...html.matchAll(/\bid="([^"]*)"/g)].map(match => match[1]));
  let sequence = 0;
  const result = html.replace(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/g, (full, level: string, attrs: string, body: string) => {
    const text = contentText(body);
    if (!text) return full;
    const existing = attrs.match(/\bid="([^"]*)"/);
    let id = existing?.[1];
    // Preserve authored IDs and CSS, excluding ambiguous anchors from the menu.
    if (id && !/^[A-Za-z][\w:.-]*$/.test(id)) return full;
    if (!id) {
      do { id = `${prefix}-section-${++sequence}`; } while (used.has(id));
      used.add(id);
    }
    if (headings.some(heading => heading.id === id)) return full;
    headings.push({ id, text, level: Number(level) });
    return existing ? full : `<h${level}${attrs} id="${id}">${body}</h${level}>`;
  });
  const show = headings.length >= 4 && contentText(html).split(/\s+/).length >= 400;
  return { html: show ? result : html, headings: show ? headings : [] };
}
