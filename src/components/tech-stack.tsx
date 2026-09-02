import { techCategories } from "@/lib/technologies";
import { getTechStack } from "@/lib/services";

type TechItem = { name: string; icon: string };

const dedupe = (arr: readonly TechItem[]): TechItem[] => {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = item.name.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }) as TechItem[];
};

// Flatten all categories into one deduplicated list, then split into N balanced rows
const allTechItems = dedupe(
  techCategories.flatMap((c) => c.items as readonly TechItem[])
);
const rowCount = 3;
const perRow = Math.ceil(allTechItems.length / rowCount);
const fallbackRows: { items: readonly TechItem[]; reverse?: boolean }[] = Array.from(
  { length: rowCount },
  (_, i) => ({
    items: allTechItems.slice(i * perRow, (i + 1) * perRow),
    reverse: i % 2 === 1,
  })
).filter((r) => r.items.length > 0);

// Duplicate items enough times so the row always fills the screen width.
// 2x is the minimum for seamless -50% loop. For short rows, use 4x with -25% loop.
function buildLoopItems(items: TechItem[]): TechItem[] {
  if (items.length >= 10) return [...items, ...items];
  if (items.length >= 5) return [...items, ...items, ...items, ...items];
  return [...items, ...items, ...items, ...items, ...items, ...items];
}

function loopPercent(items: TechItem[]): string {
  const copies = items.length >= 10 ? 2 : items.length >= 5 ? 4 : 6;
  return `${-100 / copies}%`;
}

function TechChip({ item }: { item: TechItem }) {
  if (!item.icon) {
    return (
      <>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary transition-transform duration-300 group-hover:scale-110">
          {item.name.charAt(0)}
        </span>
        <span className="text-xs font-medium transition-colors duration-300 group-hover:text-primary">{item.name}</span>
      </>
    );
  }
  return (
    <>
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 p-1 transition-transform duration-300 group-hover:scale-110">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.icon}
          alt={`${item.name} logo`}
          loading="lazy"
          width={16}
          height={16}
          className="h-4 w-4"
        />
      </span>
      <span className="text-xs font-medium transition-colors duration-300 group-hover:text-primary">{item.name}</span>
    </>
  );
}

export async function TechStack() {
  const dbTech = await getTechStack(true);

  let rows: { items: TechItem[]; reverse?: boolean }[];

  if (dbTech.length > 0) {
    // Deduplicate, flatten, and split evenly into 3 rows
    const seen = new Set<string>();
    const flat: TechItem[] = [];
    for (const t of dbTech) {
      const key = t.name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      flat.push({ name: t.name, icon: t.logo ?? "" });
    }
    const dbPerRow = Math.ceil(flat.length / rowCount);
    rows = Array.from({ length: rowCount }, (_, i) => ({
      items: flat.slice(i * dbPerRow, (i + 1) * dbPerRow),
      reverse: i % 2 === 1,
    })).filter((r) => r.items.length > 0);
  } else {
    rows = fallbackRows as { items: TechItem[]; reverse?: boolean }[];
  }

  return (
    <section className="w-full overflow-hidden bg-surface px-4 py-16 sm:px-8 lg:px-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Trusted technologies
        </p>
        <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
          Built with <span className="gradient-text-flow">industry-leading</span> tools and platforms
        </h2>
        <p className="text-xs text-muted-foreground">
          Frontend · Backend · Databases · Cloud · Mobile · AI · Design · Marketing
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {rows.map((row, rowIndex) => {
          const loopItems = buildLoopItems(row.items);
          const originalCount = row.items.length;
          return (
            <div
              key={rowIndex}
              className="group/row relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            >
              <ul
                className="flex w-max gap-3 will-change-transform group-hover/row:[animation-play-state:paused]"
                style={{
                  animation: `marquee-var 40s linear infinite${row.reverse ? " reverse" : ""}`,
                  ["--marquee-end" as string]: loopPercent(row.items),
                }}
              >
                {loopItems.map((item, index) => (
                  <li
                    key={`${item.name}-${index}`}
                    aria-hidden={index >= originalCount}
                    className="group flex items-center gap-2 rounded-full border border-border bg-card py-2 pl-2.5 pr-4 transition-all duration-300 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
                  >
                    <TechChip item={item} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
