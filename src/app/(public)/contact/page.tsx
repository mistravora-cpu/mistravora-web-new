import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ContactMap } from "@/components/contact-map";
import { ContactForm } from "./contact-form";
import { Faq } from "@/components/faq";
import { site } from "@/lib/site";
import { getHeroSection } from "@/lib/services";

const faqs = [
  {
    q: "How fast do you reply?",
    a: "Within one business day — usually much faster on WhatsApp. For urgent projects, call us directly.",
  },
  {
    q: "What should I prepare before contacting you?",
    a: "Nothing formal. A rough idea of what you want to achieve is enough — we'll guide you through the rest.",
  },
  {
    q: "Do you work with clients outside Sri Lanka?",
    a: "Absolutely. Everything runs remotely with regular video check-ins and a shared project board.",
  },
] as const;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Mistravora about your next project — WhatsApp, phone, or email. Based in Sri Lanka, working worldwide.",
  alternates: { canonical: `${site.url}/contact` },
};

export default async function ContactPage() {
  const hero = await getHeroSection("contact");
  const whatsappMessage = encodeURIComponent(
    "Hi Mistravora! I'd like to discuss a project."
  );

  return (
    <>
    <AnimatedHero hero={hero} page="contact" />
    <section className="w-full px-4 py-16 sm:px-8 lg:px-12">
      <PageHeader
        title="Contact"
        description="Tell us what you're building. We usually reply within one business day."
      />

      <ScrollReveal animation="fade-up" className="mt-12 grid w-full gap-6 sm:grid-cols-2">
        <a
          href={`https://wa.me/${site.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover-glow flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
        >
          <MessageCircle aria-hidden className="h-6 w-6 text-primary hover-icon-bounce" />
          <div>
            <h2 className="font-semibold">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fastest way to reach us — chat now.
            </p>
          </div>
        </a>

        <a
          href={`tel:${site.phoneHref}`}
          className="hover-glow flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
        >
          <Phone aria-hidden className="h-6 w-6 text-primary hover-icon-bounce" />
          <div>
            <h2 className="font-semibold">Phone</h2>
            <p className="mt-1 text-sm text-muted-foreground">{site.phone}</p>
          </div>
        </a>

        <a
          href={`mailto:${site.email}`}
          className="hover-glow flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
        >
          <Mail aria-hidden className="h-6 w-6 text-primary hover-icon-bounce" />
          <div>
            <h2 className="font-semibold">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">{site.email}</p>
          </div>
        </a>

        <div className="hover-glow flex items-start gap-4 rounded-xl border border-border bg-card p-6">
          <MapPin aria-hidden className="h-6 w-6 text-primary hover-icon-bounce" />
          <div>
            <h2 className="font-semibold">Location</h2>
            <p className="mt-1 text-sm text-muted-foreground">{site.address}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {site.geo.lat.toFixed(6)}, {site.geo.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal animation="blur-in" delay={200} className="mt-12 grid w-full gap-6 lg:grid-cols-2">
        <ContactForm />
        <ContactMap />
      </ScrollReveal>

      <ScrollReveal animation="scale-in" className="mx-auto mt-16 w-full max-w-3xl">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Before you ask
        </h2>
        <div className="scroll-reveal mt-8">
          <Faq items={faqs} />
        </div>
      </ScrollReveal>
    </section>
    </>
  );
}
