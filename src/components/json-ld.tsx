import { getCollection } from "@/lib/content";
import { getSocialMedia } from "@/lib/services";
import { isPublicMediaUrl } from "@/lib/media-url";
import { jsonLd } from "@/lib/seo";
import { getBusinessProfile } from "@/lib/business-profile";

export async function OrganizationJsonLd() {
  const [site, services, socials] = await Promise.all([getBusinessProfile(), getCollection("services"), getSocialMedia(true)]);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        description: site.description,
        email: site.email,
        telephone: site.phone,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}/assets/mistravora-logo.svg`,
          caption: "Official Mistravora Logo",
        },
        image: `${site.url}/android-chrome-512x512.png`,
        address: {
          "@type": "PostalAddress",
          addressCountry: "LK",
        },
        foundingDate: site.founded,
        founder: [{ "@type": "Person", name: site.founder }, { "@type": "Person", name: site.cofounder }],
        areaServed: site.coverage,
        sameAs: [...new Set(socials.map(social => social.url).filter(url => url.startsWith("https://") && isPublicMediaUrl(url)))],
        hasOfferCatalog: services.length ? {
          "@type": "OfferCatalog", name: "Mistravora services",
          itemListElement: services.map(service => ({
            "@type": "Offer", itemOffered: {
              "@type": "Service", name: service.title, url: `${site.url}/services/${service.slug}`,
              provider: { "@id": `${site.url}/#organization` },
            },
          })),
        } : undefined,
        knowsAbout: site.offering.split("\n").filter(Boolean),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "enquiries",
          description: `${site.availability}. ${site.response}.`,
          email: site.email,
          telephone: site.phone,
          availableLanguage: ["en"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": `${site.url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${site.url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#service`,
        name: site.headline,
        provider: { "@id": `${site.url}/#organization` },
        serviceType: site.offering.split("\n").filter(Boolean),
        areaServed: site.coverage,
        url: site.url,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd(data) }}
    />
  );
}
