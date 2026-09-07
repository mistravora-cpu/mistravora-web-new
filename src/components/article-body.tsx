import { safeArticleHtml, articleDocument, hasArticleCode } from "@/lib/article-html";

/** CMS code runs in an opaque-origin frame, never in the website document. */
export function ArticleBody({ body, title }: { body: string; title: string }) {
  const html = /<[a-z][\s\S]*>/i.test(body);
  if (!html) return <div className="whitespace-pre-wrap">{body}</div>;
  const readable = <div dangerouslySetInnerHTML={{ __html: safeArticleHtml(body) }} />;
  if (!hasArticleCode(body)) return readable;
  return <div className="space-y-4">
    <iframe
      title={`${title} — formatted article`}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      loading="lazy"
      className="h-[75vh] min-h-96 w-full rounded-xl border border-border bg-white"
      srcDoc={articleDocument(body)}
    />
    <details className="rounded-lg border border-border p-4">
      <summary className="cursor-pointer font-medium">Read text version</summary>
      <div className="mt-4">{readable}</div>
    </details>
  </div>;
}
