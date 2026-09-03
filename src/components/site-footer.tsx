import Image from "next/image";
import Link from "next/link";
import { mainNav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="grid w-full gap-10 px-4 py-12 sm:px-8 lg:grid-cols-2 lg:px-12">
        {/* Left column: Brand + Contact */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/mistravora-logo.svg"
              alt="Mistravora official company logo"
              title="Mistravora"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="font-bold">Mistravora</span>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {site.description}
          </p>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-sm font-semibold">Contact</h2>
            <a
              href={`mailto:${site.email}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {site.email}
            </a>
            <a
              href={`tel:${site.phoneHref}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {site.phone}
            </a>
            <p className="text-sm text-muted-foreground">{site.address}</p>
          </div>
        </div>

        {/* Right column: Nav links in two sub-columns */}
        <div className="grid grid-cols-2 gap-6 sm:gap-8">
          <nav aria-label="Footer" className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">Company</h2>
            {mainNav.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <nav aria-label="Footer secondary" className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">More</h2>
            {mainNav.slice(5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover-underline text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="flex w-full flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-8 lg:px-12">
          <p>© {new Date().getFullYear()} Mistravora. All rights reserved.</p>
          <p>Built for speed, privacy, and Sri Lankan networks.</p>
        </div>
      </div>
    </footer>
  );
}
