import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";
import { getTrustedCompanies } from "@/lib/services";
import { clients as fallbackClients } from "@/lib/social-proof";

export async function ClientsMarquee() {
  const dbCompanies = await getTrustedCompanies(true);
  const companies = dbCompanies
    .filter((c) => c.published)
    .map((c) => ({
      name: c.name,
      logo: c.logo,
      category: c.category,
      demo_url: c.demo_url,
      website_url: c.website_url,
      featured: c.featured,
    }));

  const clients =
    companies.length > 0
      ? companies
      : fallbackClients.map((name) => ({
          name,
          logo: null as string | null,
          category: null as string | null,
          demo_url: null as string | null,
          website_url: null as string | null,
          featured: false,
        }));

  // Featured clients with demo links get highlighted cards below the marquee.
  const featured = clients.filter((c) => c.demo_url).slice(0, 3);
  const row = [...clients, ...clients];

  return (
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12" data-cv="auto">
      {/* Heading — stronger digital marketing copy */}
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Trusted by growing businesses
        </p>
        <h2 className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
          Powering digital success across Sri Lanka &amp; beyond
        </h2>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          From e-commerce platforms to enterprise dashboards — real products,
          real results.
        </p>
      </div>

      {/* Marquee — client logos/names */}
      <div className="relative mt-10 overflow-hidden rounded-2xl border border-border bg-card/50 py-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <ul className="flex w-max animate-marquee gap-4">
          {row.map((client, index) => {
            const link = client.demo_url || client.website_url;
            const isDuplicate = index >= clients.length;
            return (
              <li
                key={index}
                aria-hidden={isDuplicate}
                className="group flex items-center gap-2.5 rounded-full border-2 border-primary/20 bg-card px-5 py-2.5 transition-colors hover:border-primary/40"
              >
                {client.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    loading="lazy"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {client.name
                      .split(" ")
                      .map((word) => word[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
                <span className="whitespace-nowrap text-base font-bold text-foreground">
                  {client.name}
                </span>
                {client.demo_url ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-primary">
                    <Play aria-hidden className="h-3 w-3" />
                    Demo
                  </span>
                ) : null}
                {link && !client.demo_url && client.website_url ? (
                  <ExternalLink
                    aria-hidden
                    className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Featured demo cards — showcase clickable demo links */}
      {featured.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((client) => (
            <Link
              key={client.name}
              href={client.demo_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {client.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    loading="lazy"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {client.name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                )}
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="font-semibold leading-tight">{client.name}</span>
                {client.category ? (
                  <span className="text-xs text-muted-foreground">{client.category}</span>
                ) : null}
              </div>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Play aria-hidden className="h-3 w-3" />
                View Demo
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
