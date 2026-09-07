import { MapPin, ExternalLink } from "lucide-react";
import { getBusinessProfile } from "@/lib/business-profile";

export async function ContactMap() {
  const profile = await getBusinessProfile();
  return <section className="flex min-h-64 flex-col items-start justify-center gap-4 rounded-xl border border-border bg-card p-8" aria-label="Business location">
    <MapPin aria-hidden className="h-9 w-9 text-primary" />
    <h2 className="text-xl font-semibold">Based in {profile.address}</h2>
    <p className="text-sm leading-6 text-muted-foreground">{profile.coverage} We don’t load an external map automatically. Opening Google Maps takes you to Google’s website.</p>
    <a href={`https://www.google.com/maps?q=${encodeURIComponent(profile.address)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-3 font-medium text-primary">Open Google Maps (new tab)<ExternalLink aria-hidden className="h-4 w-4" /></a>
  </section>;
}
