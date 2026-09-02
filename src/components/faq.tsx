import { Plus } from "lucide-react";

export function Faq({
  items,
}: {
  items: readonly { q: string; a: string }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="group rounded-xl border border-border bg-card px-5 py-4 transition-colors open:border-primary/50"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus
              aria-hidden
              className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-45"
            />
          </summary>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
