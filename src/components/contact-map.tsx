import { MapPin, ExternalLink, Navigation } from "lucide-react";
import { site } from "@/lib/site";

export function ContactMap() {
  const { lat, lng } = site.geo;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="hover-glow group overflow-hidden rounded-xl border border-border transition-all duration-300">
      <div className="relative" style={{ height: "320px" }}>
        {/* Animated gradient overlay on top */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-background/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
        <iframe
          title="Mistravora location on Google Maps"
          src={`https://www.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
          className="absolute left-0 top-0 h-[340px] w-full border-0 transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ pointerEvents: "none" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        {/* Pulsing location pin overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-15 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="relative flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-primary ring-2 ring-background" />
          </span>
        </div>
        {/* Overlay bar with address and actions */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-2 border-t border-border bg-card/95 px-4 py-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <MapPin aria-hidden className="h-4 w-4 shrink-0 text-primary animate-bounce-soft" />
            <span className="truncate">{site.address}</span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-underline inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              <Navigation aria-hidden className="h-3 w-3" />
              Directions
            </a>
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-underline inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              <ExternalLink aria-hidden className="h-3 w-3" />
              Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
