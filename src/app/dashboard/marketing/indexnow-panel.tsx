"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { indexNowConfig, type IndexNowResult } from "@/lib/indexnow-config";
import { submitPublishedUrls } from "./indexnow-actions";

export function IndexNowPanel({ initial, statusError, production }: {
  initial: IndexNowResult | null;
  statusError?: string;
  production: boolean;
}) {
  const [result, setResult] = useState(initial);
  const [message, setMessage] = useState(statusError || "");
  const [pending, startTransition] = useTransition();

  function submit() {
    setMessage("");
    startTransition(async () => {
      try { setResult(await submitPublishedUrls()); }
      catch { setMessage("The request did not finish. Please try again."); }
    });
  }

  return (
    <section aria-labelledby="indexnow-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 id="indexnow-heading" className="text-lg font-semibold">IndexNow notifications</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        Public content changes in this admin notify participating search engines automatically after saving.
        You can also submit the current published sitemap after deployment or an update made directly in Supabase.
        A retry includes the URLs from the last failed request, including renamed or removed pages.
      </p>
      <a href={`${indexNowConfig.origin}/${indexNowConfig.key}.txt`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-primary underline underline-offset-4">
        Open the ownership verification file
      </a>
      <div className="mt-4 text-sm leading-6" role="status" aria-live="polite" aria-atomic="true">
        {pending ? <p>Submitting published URLs…</p> : message ? <p>{message}</p> : result ? (
          <>
            <p>{result.message}</p>
            <p className="text-muted-foreground">
              {result.count} URLs · <time dateTime={result.checkedAt}>{new Date(result.checkedAt).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC")}</time>
              {result.status ? ` · HTTP ${result.status}` : ""}
            </p>
          </>
        ) : <p className="text-muted-foreground">No recorded submission yet.</p>}
      </div>
      {!production && <p className="mt-3 text-sm text-muted-foreground">Submissions are enabled only on the Vercel production deployment.</p>}
      <Button type="button" onClick={submit} disabled={pending || !production} aria-busy={pending} className="mt-4 whitespace-normal">
        {pending ? "Submitting URLs…" : "Submit published URLs"}
      </Button>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">A received submission is not confirmation of indexing. Check crawling and indexing in Bing Webmaster Tools.</p>
    </section>
  );
}
