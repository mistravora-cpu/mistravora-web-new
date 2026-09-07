import Image from "@/components/content-image";
import { ExternalLink } from "lucide-react";
import { getTrustedCompanies } from "@/lib/services";

export async function ClientsMarquee() {
  const companies = await getTrustedCompanies(true);
  const seen = new Set<string>();
  const clients = companies.filter((company) => {
    const name = company.name.trim().toLocaleLowerCase();
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  });
  if (!clients.length) return null;

  return (
    <section aria-labelledby="trusted-companies-heading" className="w-full site-gutter py-16" data-cv="auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Trusted by growing businesses</p>
        <h2 id="trusted-companies-heading" className="max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
          Companies we work with
        </h2>
      </div>
      <div className="company-marquee mt-10 overflow-hidden py-2">
        <div className="company-marquee-track flex w-max">
        {[false, true].map((duplicate) => (
      <ul key={String(duplicate)} aria-hidden={duplicate || undefined} inert={duplicate || undefined} className={`flex shrink-0 gap-5 pr-5 ${duplicate ? "company-marquee-copy" : ""}`}>
        {clients.map((client) => {
          const candidate = client.demo_url || client.website_url;
          const link = candidate && /^https?:\/\//i.test(candidate) ? candidate : null;
          const content = (
            <>
              <span className="flex h-20 w-20 shrink-0 items-center justify-center">
                {client.logo ? (
                  <Image src={client.logo} alt="" width={80} height={80} sizes="80px" className="h-20 w-20 object-contain" />
                ) : (
                  <span aria-hidden="true" className="text-xl font-bold text-primary">
                    {client.name.split(/\s+/).map((word) => word[0]).slice(0, 2).join("")}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold">{client.name}</span>
                {client.category && <span className="block text-xs text-muted-foreground">{client.category}</span>}
                {link && <span className="mt-1 block text-xs text-primary">{client.demo_url ? "View demo" : "Visit website"}</span>}
              </span>
              {link && <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />}
            </>
          );
          const className = "flex h-full items-center gap-4 rounded-xl border border-border bg-card/50 p-6";
          return (
            <li key={client.id} className="w-[300px] shrink-0 sm:w-[340px]">
              {link ? (
                <a href={link} target="_blank" rel="noopener noreferrer" className={`${className} transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}>
                  {content}
                </a>
              ) : <div className={className}>{content}</div>}
            </li>
          );
        })}
      </ul>
        ))}
        </div>
      </div>
    </section>
  );
}
