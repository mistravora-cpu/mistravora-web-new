import Image from "@/components/content-image";
export function CatalogImage({
  src,
  title,
}: {
  src: string | null | undefined;
  title: string;
}) {
  if (!src) return null;
  return (
    <div className="catalog-image relative mb-5 aspect-video w-full overflow-hidden rounded-xl bg-muted/40">
      <Image
        src={src}
        alt={`${title} preview`}
        fill
        sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 48vw, 32vw"
        className="object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.025]"
      />
    </div>
  );
}
