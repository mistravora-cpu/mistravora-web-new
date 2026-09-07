import { getBusinessProfile } from "@/lib/business-profile";
import Image from "next/image";
import { MotionPreferences } from "@/components/motion-preferences";
import Link from "next/link";
import { getPolicies } from "@/lib/services";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import { mainNav } from "@/lib/site";

export async function SiteFooter() {
  const [site, policies] = await Promise.all([getBusinessProfile(), getPolicies(true)]);
  return (
    <footer className="[&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center [&_button]:min-h-11 border-t border-border bg-surface">
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
            <span className="font-bold">{site.name}</span>
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
            <p className="text-sm text-muted-foreground">{site.availability}. {site.response}.</p>
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
            <Link href="/services" className="text-sm hover:text-primary">Services</Link>
            <Link href="/insights" className="text-sm hover:text-primary">Insights & resources</Link>
            <Link href="/book" className="text-sm hover:text-primary">Book a consultation</Link>
            <Link href="/search" className="text-sm hover:text-primary">Search</Link>
            {policies.map(policy => <Link key={policy.slug} href={`/policies/${policy.slug}`} className="text-sm hover:text-primary">{policy.title}</Link>)}
            <CookieSettingsButton />
            <MotionPreferences />
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
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>{site.footer}</p>
        </div>
      </div>
    </footer>
  );
}
