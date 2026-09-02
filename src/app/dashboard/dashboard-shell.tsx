"use client";

import * as React from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "./dashboard-nav";
import { signOut } from "./actions";
import { trackButtonClick } from "@/lib/track-event";

type Props = {
  initials: string;
  displayName: string;
  email: string;
  children: React.ReactNode;
};

export function DashboardShell({ initials, displayName, email, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!sidebarOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (sidebarRef.current && !sidebarRef.current.contains(target) && toggleRef.current && !toggleRef.current.contains(target)) {
        setSidebarOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sidebarOpen]);

  return (
    <div className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 md:flex-row lg:px-8">
      {/* Skip to content link for keyboard users */}
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Mobile toggle */}
      <button
        ref={toggleRef}
        type="button"
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
        aria-controls="dashboard-sidebar"
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen((v) => !v);
        }}
        className="mb-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground md:hidden"
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        ref={sidebarRef}
        aria-label="Dashboard navigation"
        className={`shrink-0 self-start md:sticky md:top-0 md:z-30 md:h-screen md:w-64 ${
          sidebarOpen ? "block" : "hidden md:block"
        }`}
      >
        <div className="flex h-full flex-col gap-4 md:py-2">
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-brand-blue text-xs font-bold text-primary-foreground"
              aria-hidden
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-sm">
            <DashboardNav />
          </div>
          {/* View live site link */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackButtonClick("view_live_site", "dashboard_sidebar")}
            className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            View Live Site
          </a>
          <form action={signOut} className="shrink-0 px-1">
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="w-full"
              onClick={() => trackButtonClick("sign_out", "dashboard_sidebar")}
            >
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div
        id="dashboard-content"
        className="min-w-0 flex-1 md:pl-8 md:py-2"
        onClick={() => setSidebarOpen(false)}
      >
        {children}
      </div>
    </div>
  );
}
