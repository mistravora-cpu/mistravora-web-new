import { getValueCards } from "@/lib/services";
import { getIcon } from "@/lib/icon-map";
import { ArticleBody } from "@/components/article-body";

export async function ValueCards() {
  const cards = await getValueCards(true);
  if (!cards.length) return null;
  return (
    <section
      className="w-full site-gutter section-py"
      aria-labelledby="value-cards-heading"
    >
      <h2
        id="value-cards-heading"
        className="text-3xl font-bold tracking-tight sm:text-4xl"
      >
        How we work with you
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = getIcon(card.icon);
          return (
            <div
              key={card.id}
              className="min-w-0 rounded-xl border border-border p-6"
            >
              <Icon aria-hidden className="h-6 w-6 text-primary" />
              <h3 className="mt-4 text-xl font-semibold">{card.title}</h3>
              <div className="mt-3 text-sm leading-7 text-muted-foreground">
                <ArticleBody body={card.description} title={card.title} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
