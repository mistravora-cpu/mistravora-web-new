import { Quote, Star, ArrowUpRight } from "lucide-react";
import Image from "@/components/content-image";
import { getTestimonials } from "@/lib/services";
import type { CustomerReview } from "@/lib/reviews";

export function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <figure className="flex min-w-0 flex-col gap-5 rounded-2xl border border-border bg-card p-6 motion-safe:transition-colors hover:border-primary/40 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <Quote aria-hidden className="h-7 w-7 text-primary" />
        {review.rating > 0 && review.rating <= 5 && (
          <span
            role="img"
            aria-label={`${review.rating} out of 5 stars`}
            className="flex gap-1 text-primary"
          >
            {Array.from({ length: review.rating }, (_, i) => (
              <Star key={i} aria-hidden className="h-4 w-4 fill-current" />
            ))}
          </span>
        )}
      </div>
      <blockquote className="flex-1 whitespace-pre-line break-words text-base leading-7">
        {review.quote}
      </blockquote>
      <figcaption className="border-t border-border pt-5">
        <div className="flex items-center gap-3">
          {review.avatar && (
            <Image
              src={review.avatar}
              alt=""
              width={48}
              height={48}
              sizes="48px"
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-full object-cover"
            />
          )}
          <div className="min-w-0 break-words">
            <p className="font-semibold">{review.name}</p>
            {review.role && (
              <p className="text-sm text-muted-foreground">{review.role}</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          {review.source_url ? (
            <a
              href={review.source_url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex min-h-8 items-center gap-1 font-medium text-primary underline underline-offset-4"
              aria-label={`Read ${review.name}'s original review on ${review.source_name} (opens in a new tab)`}
            >
              {review.source_name}
              <ArrowUpRight aria-hidden className="h-3 w-3" />
            </a>
          ) : (
            <span>{review.source_name}</span>
          )}
          {review.review_date && (
            <time dateTime={review.review_date}>
              {new Intl.DateTimeFormat("en", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(review.review_date))}
            </time>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

/** Server rendered: no review widgets, third-party embeds or carousel bundle. */
export async function Testimonials({
  path = "/solutions",
  inset = false,
}: {
  path?: string;
  inset?: boolean;
}) {
  const reviews = (await getTestimonials(true)).filter((review) =>
    review.display_paths.includes(path),
  );
  if (!reviews.length) return null;
  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className={`w-full section-py ${inset ? "" : "site-gutter"}`}
    >
      <p className="eyebrow">Customer feedback</p>
      <h2
        id="customer-reviews-heading"
        className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
      >
        What our customers say
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {reviews.slice(0, 6).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {reviews.length > 6 && (
        <details className="mt-6">
          <summary className="w-fit cursor-pointer rounded-lg border border-border px-5 py-3 text-sm font-semibold">
            More customer reviews ({reviews.length - 6})
          </summary>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {reviews.slice(6).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
