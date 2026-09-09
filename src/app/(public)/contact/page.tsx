import { ArticleBody } from "@/components/article-body";
import { getBusinessProfile } from "@/lib/business-profile";
import { applySeoOverrides } from "@/lib/seo-overrides";
import { withSocialMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AnimatedHero } from "@/components/animated-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ContactMap } from "@/components/contact-map";
import { ContactForm } from "./contact-form";
import { Faq } from "@/components/faq";
import { site } from "@/lib/site";
import { getHeroSection, getFaqs, getContactInfo, getSocialMedia } from "@/lib/services";

const baseMetadata: Metadata = withSocialMetadata({
  title: "Contact",
  description:
    "Talk to Mistravora about your next project — WhatsApp, phone, or email. Based in Sri Lanka, working worldwide.",
  alternates: { canonical: `${site.url}/contact` },
});

export default async function ContactPage() {
  const [hero, site, faqs, contactRows, socials] = await Promise.all([getHeroSection("contact"), getBusinessProfile(), getFaqs("contact", true), getContactInfo(), getSocialMedia(true)]);
  const contact = contactRows;
  const whatsappMessage = encodeURIComponent(
    "Hi Mistravora! I'd like to discuss a project."
  );

  return (
    <>
    <AnimatedHero hero={hero} page="contact" />
    <section className="w-full site-gutter py-16">
      <PageHeader
        title="Contact"
        description={`Tell us what you are building. ${site.response}.`}
      />

      <ScrollReveal animation="fade-up" className="mt-12 grid w-full gap-6 sm:grid-cols-2">
        <a
          href={`https://wa.me/${site.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group interactive-card hover:-translate-y-0.5 flex items-start gap-4 p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
            <MessageCircle aria-hidden className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fastest way to reach us — chat now.
            </p>
          </div>
        </a>

        <a
          href={`tel:${site.phoneHref}`}
          className="group interactive-card hover:-translate-y-0.5 flex items-start gap-4 p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
            <Phone aria-hidden className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">Phone</h2>
            <p className="mt-1 text-sm text-muted-foreground">{site.phone}</p>
          </div>
        </a>

        <a
          href={`mailto:${site.email}`}
          className="group interactive-card hover:-translate-y-0.5 flex items-start gap-4 p-6"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10 transition-transform duration-300 group-hover:scale-105">
            <Mail aria-hidden className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">{site.email}</p>
          </div>
        </a>

        <div className="interactive-card flex items-start gap-4 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10">
            <MapPin aria-hidden className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">Location</h2>
            <p className="mt-1 text-sm text-muted-foreground">{site.address}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {site.coverage}
            </p>
          </div>
        </div>
      </ScrollReveal>

      <p className="mt-6 text-sm text-muted-foreground">{site.showHours !== "false" ? `${site.availability}.` : ""} {site.response}.</p>
      <ScrollReveal animation="fade-up" delay={200} className="mt-14 grid w-full gap-8 lg:grid-cols-2">
        <div>
          {contact && <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight">{contact.headline}</h2><div className="mt-2 text-sm text-muted-foreground"><ArticleBody body={contact.description ?? ""} title="Contact information" /></div></div>}
          <ContactForm />
          <nav aria-label="Social profiles" className="mt-6 flex flex-wrap gap-4">{socials.filter(s=>/^https:\/\//.test(s.url)).map(s=><a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary link-underline">{s.platform}</a>)}</nav>
        </div>
        <ContactMap />
      </ScrollReveal>

      <ScrollReveal animation="fade-up" className="mx-auto mt-16 w-full">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Before you ask
        </h2>
        <div className="mt-8">
          <Faq items={faqs.map(faq => ({q:faq.question,a:faq.answer}))} />
        </div>
      </ScrollReveal>
    </section>
    </>
  );
}

export async function generateMetadata() { return applySeoOverrides(baseMetadata); }
