import { articleNavigation } from "@/lib/article-navigation";
import { createHash } from "node:crypto";
import { renderArticleHtml } from "@/lib/article-html";

/** Server-rendered content: no browser-side compiler or JavaScript payload. */
export function ArticleBody({ body, title, showContents = false }: { body: string; title: string; showContents?: boolean }) {
  if (!/<[a-z][\s\S]*>/i.test(body))
    return <div className="whitespace-pre-wrap">{body}</div>;
  const id = createHash("sha256")
    .update(title + "\0" + body)
    .digest("hex")
    .slice(0, 16);
  const { html, css } = renderArticleHtml(body, `[data-article-scope="${id}"]`);
  const navigation = showContents ? articleNavigation(html, `article-${id}`) : { html, headings: [] };
  return (
    <>
      {navigation.headings.length > 0 && (
        <details className="mb-8 border-y border-border py-4">
          <summary className="cursor-pointer py-2 font-semibold focus-visible:outline-2 focus-visible:outline-primary">On this page</summary>
          <nav aria-label="Article contents" className="mt-3">
            <ol className="space-y-1">
              {navigation.headings.map(heading => (
                <li key={heading.id} className={heading.level === 3 ? "pl-4" : undefined}>
                  <a className="inline-block py-2 text-sm text-primary underline underline-offset-4" href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      )}
    <div
      data-article-scope={id}
      data-article-content
      aria-label={title}
      className="rich-content"
    >
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div data-article-root dangerouslySetInnerHTML={{ __html: navigation.html }} />
    </div>
    </>
  );
}
