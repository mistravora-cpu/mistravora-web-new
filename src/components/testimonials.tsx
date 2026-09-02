import { Star, Quote } from "lucide-react";
import { getTestimonials } from "@/lib/services";
import type { Testimonial } from "@/lib/types";

const fallbackTestimonials: Testimonial[] = [
  {
    id: "fallback-1",
    quote:
      "Our new site loads instantly and enquiries doubled within a month. The team explained everything in plain language — no jargon, no surprises.",
    name: "Business Owner",
    role: "Retail — Colombo",
    avatar: null,
    rating: 5,
    sort_order: 1,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-2",
    quote:
      "Mistravora rebuilt our booking flow and it just works — on every phone our customers use. Best investment we made this year.",
    name: "Operations Manager",
    role: "Hospitality — Kandy",
    avatar: null,
    rating: 5,
    sort_order: 2,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-3",
    quote:
      "Fast, honest, and incredibly responsive on WhatsApp. They told us what we didn't need, which saved us real money.",
    name: "Founder",
    role: "Startup — Remote",
    avatar: null,
    rating: 5,
    sort_order: 3,
    published: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "fallback-4",
    quote:
      "The admin dashboard alone saves my team hours every week. Professional work from a team that clearly cares about quality.",
    name: "Director",
    role: "Services — Kurunegala",
    avatar: null,
    rating: 5,
    sort_order: 4,
    published: true,
    created_at: "",
    updated_at: "",
  },
];

function buildLoopItems<T>(items: T[]): T[] {
  if (items.length >= 6) return [...items, ...items];
  if (items.length >= 3) return [...items, ...items, ...items, ...items];
  return [...items, ...items, ...items, ...items, ...items, ...items];
}

function loopPercent(len: number): string {
  const copies = len >= 6 ? 2 : len >= 3 ? 4 : 6;
  return `${-100 / copies}%`;
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <figure className="group/card shine-sweep hover-lift card-glow relative flex w-[20rem] shrink-0 flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 sm:w-[24rem]">
      <div className="flex items-center justify-between">
        <div
          role="img"
          aria-label={`${t.rating} out of 5 stars`}
          className="flex gap-0.5 text-primary"
        >
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star key={i} aria-hidden className="h-4 w-4 fill-current transition-transform duration-300 group-hover/card:scale-110" />
          ))}
        </div>
        <Quote aria-hidden className="h-6 w-6 text-primary/20 transition-colors duration-300 group-hover/card:text-primary/40" />
      </div>
      <blockquote className="flex-1 text-sm leading-6 text-muted-foreground">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3 border-t border-border/50 pt-3">
        {t.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary transition-transform duration-300 group-hover/card:scale-110">
            {initials}
          </span>
        )}
        <div>
          <p className="text-sm font-semibold">{t.name}</p>
          <p className="text-xs text-muted-foreground">{t.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export async function Testimonials() {
  let testimonials = await getTestimonials(true);
  if (testimonials.length === 0) testimonials = fallbackTestimonials;

  const half = Math.ceil(testimonials.length / 2);
  const row1Items = testimonials.slice(0, half);
  const row2Items = testimonials.slice(half);
  const row1 = buildLoopItems(row1Items);
  const row2 = buildLoopItems(row2Items);

  return (
    <section className="w-full overflow-hidden bg-surface py-16">
      <div className="flex flex-col items-center gap-3 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Client love
        </p>
        <h2 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
          What our <span className="gradient-text-flow">clients</span> say
        </h2>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <div className="group/row relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div
            className="flex w-max gap-4 will-change-transform group-hover/row:[animation-play-state:paused]"
            style={{ animation: "marquee-var 50s linear infinite", ["--marquee-end" as string]: loopPercent(row1Items.length) }}
          >
            {row1.map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} />
            ))}
          </div>
        </div>
        <div className="group/row relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div
            className="flex w-max gap-4 will-change-transform group-hover/row:[animation-play-state:paused]"
            style={{ animation: "marquee-var 50s linear infinite reverse", ["--marquee-end" as string]: loopPercent(row2Items.length) }}
          >
            {row2.map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
