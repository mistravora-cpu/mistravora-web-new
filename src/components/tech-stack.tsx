import Image from "@/components/content-image";
import { getTechStack } from "@/lib/services";
import { isPublicMediaUrl } from "@/lib/media-url";

export async function TechStack() {
  const rows = await getTechStack(true);
  const items = rows.filter(
    (row, index) =>
      rows.findIndex(
        (other) =>
          other.name.trim().toLowerCase() === row.name.trim().toLowerCase(),
      ) === index,
  );
  if (!items.length) return null;
  return (
    <section
      className="w-full site-gutter section-py"
      aria-labelledby="technology-heading"
    >
      <p className="eyebrow">Technology options</p>
      <h2
        id="technology-heading"
        className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl"
      >
        Tools and platforms for your project
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        We agree the technology choices with you based on scope, budget and
        maintenance needs.
      </p>
      <ul className="mt-8 flex flex-wrap gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            {item.logo && isPublicMediaUrl(item.logo) && (
              <Image
                src={item.logo}
                alt=""
                width={24}
                height={24}
                sizes="24px"
                loading="lazy"
                className="h-6 w-6 object-contain"
              />
            )}
            <span className="text-sm font-medium">{item.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
