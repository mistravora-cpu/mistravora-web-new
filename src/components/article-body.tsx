import { createHash } from "node:crypto";
import { renderArticleHtml } from "@/lib/article-html";

/** Server-rendered content: no browser-side compiler or JavaScript payload. */
export function ArticleBody({ body, title }: { body: string; title: string }) {
  if (!/<[a-z][\s\S]*>/i.test(body))
    return <div className="whitespace-pre-wrap">{body}</div>;
  const id = createHash("sha256")
    .update(title + "\0" + body)
    .digest("hex")
    .slice(0, 16);
  const { html, css } = renderArticleHtml(body, `[data-article-scope="${id}"]`);
  return (
    <div
      data-article-scope={id}
      data-article-content
      aria-label={title}
      className="rich-content"
    >
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div data-article-root dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
