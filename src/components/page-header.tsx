export function PageHeader({
  title,
  description,
  eyebrow,
  as: Tag = "h2",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="relative mx-auto max-w-3xl animate-fade-in-up text-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute -top-12 left-1/2 -z-10 h-40 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl animate-pulse-soft"
      />
      <div
        aria-hidden
        className="absolute -top-4 left-1/2 -z-10 h-1 w-12 -translate-x-1/2 rounded-full bg-primary/40"
      />
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <Tag
        className={
          Tag === "h1"
            ? "text-3xl font-bold tracking-tight sm:text-5xl"
            : "text-2xl font-bold tracking-tight sm:text-3xl"
        }
      >
        {title}
      </Tag>
      {description ? (
        <p className="mt-4 text-sm leading-6 text-foreground/70 sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
