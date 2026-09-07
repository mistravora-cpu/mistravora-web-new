import { getBusinessProfile } from "@/lib/business-profile";
import Image from "next/image";
import Link from "next/link";
import { getPolicies } from "@/lib/services";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { mainNav } from "@/lib/site";

export async function SiteFooter() {
  const [site, policies] = await Promise.all([getBusinessProfile(), getPolicies(true)]);
  return (
    <footer className="[&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center [&_button]:min-h-11 border-t border-border bg-surface">
      <div className="grid w-full gap-12 site-gutter py-14 lg:grid-cols-2">
        {/* Left column: Brand + Contact */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/mistravora-logo.svg"
              alt="Mistravora official company logo"
              title="Mistravora"
              width={28}
              height={28}
              className="rounded-full"
            />
            <span className="text-base font-semibold tracking-tight">{site.name}</span>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            {site.description}
          </p>
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80">Contact</h2>
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
            <p className="text-sm text-muted-foreground">{site.showHours !== "false" ? `${site.availability}.` : ""} {site.response}.</p>
          </div>
        </div>

        {/* Right column: Nav links in two sub-columns */}
        <div className="grid grid-cols-2 gap-8 sm:gap-10">
          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80">Company</h2>
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

          <nav aria-label="Footer secondary" className="flex flex-col gap-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80">More</h2>
            <Link href="/services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Services</Link>
            <Link href="/insights" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Insights &amp; resources</Link>
            <Link href="/book" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Book a consultation</Link>
            <Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Search</Link>
            {policies.map(policy => <Link key={policy.slug} href={`/policies/${policy.slug}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{policy.title}</Link>)}
            <CookieSettingsButton />
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
        <div className="flex w-full flex-col items-center justify-between gap-2 site-gutter py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>{site.footer}</p>
        </div>
      </div>
    </footer>
  );
}
