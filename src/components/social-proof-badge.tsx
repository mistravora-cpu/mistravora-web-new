import { getTrustedCompanies } from "@/lib/services";

export async function SocialProofBadge() {
  const companies = await getTrustedCompanies(true);
  const featured = companies.filter((c) => c.featured).slice(0, 5);
  const count = companies.length;

  if (count === 0) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Trusted by {count}+ businesses
      </p>
      {featured.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {featured.map((company) => (
            <div
              key={company.id}
              className="flex items-center gap-2 opacity-60 transition-opacity hover:opacity-100"
            >
              {company.logo ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={company.logo}
                  alt={company.name}
                  className="h-6 w-auto object-contain"
                />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">
                  {company.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
