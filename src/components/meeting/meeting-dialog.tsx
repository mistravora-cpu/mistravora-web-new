"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { CalendarClock, X } from "lucide-react";
import { OPEN_MEETING_EVENT } from "@/lib/meeting";
import { getConsentSnapshot } from "@/lib/consent";
import { trackEvent } from "@/lib/track-event";

const MeetingForm = dynamic(() => import("./meeting-form").then(m => m.MeetingForm), {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted/50" aria-hidden />,
});

const PROMPT_KEY = "mistravora:meeting-prompt";
const PROMPT_INTERVAL = 14 * 86_400_000;
const NO_PROMPT = /^\/(book|contact|dashboard|admin|login|unsubscribe)(\/|$)/;

function promptedRecently() {
  try { return Date.now() - Number(localStorage.getItem(PROMPT_KEY) ?? 0) < PROMPT_INTERVAL; } catch { return true; }
}

export function MeetingDialog() {
  const ref = React.useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  const open = React.useCallback((source: "button" | "prompt") => {
    const dialog = ref.current;
    if (!dialog || dialog.open) return;
    setMounted(true);
    dialog.showModal();
    try { localStorage.setItem(PROMPT_KEY, String(Date.now())); } catch {}
    trackEvent("meeting_dialog_open", { source });
  }, []);

  React.useEffect(() => {
    const onOpen = () => open("button");
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href="#book-meeting"], [data-book-meeting]');
      if (!link) return;
      // Capture phase runs before Next.js <Link>, which then skips navigation.
      event.preventDefault();
      open("button");
    };
    window.addEventListener(OPEN_MEETING_EVENT, onOpen);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener(OPEN_MEETING_EVENT, onOpen);
      document.removeEventListener("click", onClick, true);
    };
  }, [open]);

  // A single, gentle invitation for engaged visitors: after 40 s on the site or
  // after reading most of a page. Never on forms, admin pages or before the
  // visitor has answered the cookie banner.
  React.useEffect(() => {
    if (NO_PROMPT.test(pathname) || promptedRecently()) return;
    let fired = false;
    const fire = () => {
      if (fired || getConsentSnapshot() === null || document.querySelector("dialog[open]")) return;
      fired = true;
      cleanup();
      open("prompt");
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 600 && window.scrollY / max > 0.65) fire();
    };
    const timer = window.setTimeout(fire, 40_000);
    window.addEventListener("scroll", onScroll, { passive: true });
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    }
    return cleanup;
  }, [pathname, open]);

  return (
    <dialog
      ref={ref}
      id="book-meeting"
      aria-labelledby="book-meeting-title"
      onClick={(event) => { if (event.target === ref.current) ref.current?.close(); }}
      className="meeting-dialog m-auto w-[min(40rem,calc(100vw-1.5rem))] max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card/95 px-5 py-4 backdrop-blur sm:px-7">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <CalendarClock aria-hidden className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 id="book-meeting-title" className="text-lg font-semibold tracking-tight">Book a meeting with our team</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">A free 30-minute consultation to discuss your project and next steps.</p>
          </div>
        </div>
        <button type="button" onClick={() => ref.current?.close()} aria-label="Close" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X aria-hidden className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5 py-5 sm:px-7 sm:py-6">{mounted && <MeetingForm compact />}</div>
    </dialog>
  );
}
