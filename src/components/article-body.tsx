import { renderArticleHtml } from "@/lib/article-html";

/** Article text is server-rendered directly for readers and search engines. */
export function ArticleBody({ body, title }: { body: string; title: string }) {
  if (!/<[a-z][\s\S]*>/i.test(body)) return <div className="whitespace-pre-wrap">{body}</div>;
  const { html, css } = renderArticleHtml(body);
  const layout = `[data-article-content]{background:transparent;padding:0;margin:0;color:var(--foreground)}[data-article-content] .article-container{width:100%;max-width:none;margin:0;padding:0;border:0;border-radius:0;box-shadow:none;background:transparent}`;
  return <div data-article-content aria-label={title}>
    <style dangerouslySetInnerHTML={{ __html: css + "\n" + layout }} />
    <div dangerouslySetInnerHTML={{ __html: html }} />
  </div>;
}
