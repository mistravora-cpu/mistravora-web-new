"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { CalendarClock, X } from "lucide-react";
import { MEETING_SUBMITTED_KEY, OPEN_MEETING_EVENT } from "@/lib/meeting";
import { getConsentSnapshot, subscribeConsent } from "@/lib/consent";
import { trackEvent } from "@/lib/track-event";

const loadForm = () => import("./meeting-form").then(m => m.MeetingForm);
const MeetingForm = dynamic(loadForm, {
  ssr: false,
  loading: () => <div className="h-96 animate-pulse rounded-lg bg-muted/50" aria-hidden />,
});

const PROMPT_DELAY = 4500;
const NO_PROMPT = /^\/(book|contact|dashboard|admin|login|unsubscribe)(\/|$)/;
// One automatic invitation per page load (a refresh starts a new load).
let promptedThisLoad = false;

function alreadySubmitted() {
  try { return Boolean(localStorage.getItem(MEETING_SUBMITTED_KEY)); } catch { return false; }
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

  // Invitation 5 seconds after each page load (including a refresh). Never on
  // forms or admin pages, never on top of the cookie banner (it waits for the
  // visitor's choice), and not again once a request has been sent.
  React.useEffect(() => {
    if (promptedThisLoad || NO_PROMPT.test(pathname) || alreadySubmitted()) return;
    let unsubscribe: (() => void) | undefined;
    const fire = () => {
      if (promptedThisLoad) return;
      if (getConsentSnapshot() === null || document.querySelector("dialog[open]")) {
        unsubscribe ??= subscribeConsent(() => { if (getConsentSnapshot() !== null) window.setTimeout(fire, 600); });
        return;
      }
      promptedThisLoad = true;
      unsubscribe?.();
      open("prompt");
    };
    const preload = window.setTimeout(() => { void loadForm(); }, PROMPT_DELAY - 1500);
    const timer = window.setTimeout(fire, PROMPT_DELAY);
    return () => {
      window.clearTimeout(preload);
      window.clearTimeout(timer);
      unsubscribe?.();
    };
  }, [pathname, open]);

  return (
    <dialog
      ref={ref}
      id="book-meeting"
      aria-labelledby="book-meeting-title"
      onClick={(event) => { if (event.target === ref.current) ref.current?.close(); }}
      className="meeting-dialog m-auto w-[min(34rem,calc(100vw-1.5rem))] max-h-[calc(100svh-1.5rem)] overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
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
      <div className="px-5 py-5 sm:px-7 sm:py-6">{mounted && <MeetingForm />}</div>
    </dialog>
  );
}
