"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { mainNav } from "@/lib/site";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  React.useEffect(() => {
    if (!mobileOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-mobile-menu]")) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [mobileOpen]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "site-header sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur transition-all duration-300",
        scrolled && "scrolled"
      )}
    >
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Logo — left */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/assets/mistravora-logo.svg"
            alt="Mistravora official company logo"
            title="Mistravora"
            width={32}
            height={32}
            className="rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
          />
          <span className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
            Mistravora
          </span>
        </Link>

        {/* Nav — flex-1 centered, takes space between logo and actions */}
        <nav
          aria-label="Primary"
          className="hidden flex-1 items-center justify-center gap-0 whitespace-nowrap nav:flex"
        >
          {mainNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "group relative rounded-md px-2 py-1.5 text-sm whitespace-nowrap transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring animate-fade-in-up",
                isActive(item.href)
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {item.title}
              <span
                className={cn(
                  "absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300",
                  isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right side actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="ripple-click shrink-0">
            <Link href="/contact">Get in touch</Link>
          </Button>

          <div className="relative nav:hidden" data-mobile-menu>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={(e) => {
                e.stopPropagation();
                setMobileOpen((v) => !v);
              }}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground transition-transform duration-200 active:scale-90"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            {mobileOpen ? (
              <nav
                aria-label="Mobile"
                className="animate-fade-in-up absolute right-0 top-11 flex w-56 flex-col gap-1 rounded-lg border border-border bg-card p-2 shadow-xl"
              >
                {mainNav.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "animate-fade-in-up rounded-md px-3 py-2 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-foreground hover:bg-muted"
                    )}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    {item.title}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="ripple-click mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground"
                >
                  Get in touch
                </Link>
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
