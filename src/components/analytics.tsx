"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { CONSENT_VERSION, saveConsent, setConsentValue, subscribeConsent, getConsentSnapshot, getConsentSSR } from "@/lib/consent";

export function Analytics({ showBanner = true }: { showBanner?: boolean }) {
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentSSR);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  function open() {
    const saved = getConsentSnapshot();
    setAnalytics(saved?.analytics ?? false); setMarketing(saved?.marketing ?? false);
    dialog.current?.showModal();
  }
  useEffect(() => {
    const handler = () => open();
    window.addEventListener("mistravora:cookie-settings", handler);
    return () => window.removeEventListener("mistravora:cookie-settings", handler);
  }, []);
  function choose(allowAnalytics: boolean, allowMarketing: boolean) {
    const previous = getConsentSnapshot();
    const choice = { version: CONSENT_VERSION, analytics: allowAnalytics, marketing: allowMarketing, functional: true, timestamp: new Date().toISOString() };
    saveConsent(choice); setConsentValue(choice); dialog.current?.close();
    // Unmounting a script does not stop code already executed. A reload does.
    if ((previous?.analytics && !allowAnalytics) || (previous?.marketing && !allowMarketing)) window.location.reload();
  }
  const button = "rounded-lg border border-border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-primary hover:bg-muted";
  return <>
    {showBanner && mounted && !consent && <section aria-label="Cookie choices" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl"><h2 className="font-semibold">Your privacy choices</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Necessary storage supports sign-in and your preferences. Optional analytics and marketing are off until you choose. <Link href="/policies/cookie-policy" className="underline">Cookie Policy</Link></p></div>
        <div className="flex flex-wrap gap-2"><button className={button} onClick={() => choose(false, false)}>Decline all</button><button className={button} onClick={open}>Customize</button><button className={button} onClick={() => choose(true, true)}>Accept all</button></div>
      </div>
    </section>}
    <dialog ref={dialog} aria-labelledby="cookie-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 text-foreground shadow-xl backdrop:bg-black/60">
      <h2 id="cookie-title" className="text-xl font-bold">Cookie preferences</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">You can change your choice at any time from the footer. Optional tracking is currently paused while provider settings are reviewed.</p>
      <p className="mt-4 text-sm">Necessary storage: always available for requested features.</p>
      <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="h-5 w-5" />Allow optional analytics</label>
      <label className="mt-4 flex items-center gap-3"><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="h-5 w-5" />Allow optional marketing</label>
      <div className="mt-6 flex flex-wrap gap-2"><button className={button} onClick={() => choose(false, false)}>Decline all</button><button className={button} onClick={() => choose(analytics, marketing)}>Save preferences</button><button className={button} onClick={() => dialog.current?.close()}>Close preferences</button></div>
    </dialog>
  </>;
}
