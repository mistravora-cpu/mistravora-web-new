import { jsonLd } from "@/lib/seo";
import { getBusinessProfile } from "@/lib/business-profile";

export async function OrganizationJsonLd() {
  const site = await getBusinessProfile();
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
        knowsAbout: site.offering.split("\n").filter(Boolean),
        priceRange: "$$",
        sameAs: [
          "https://github.com/mistravora",
          "https://www.linkedin.com/company/mistravora",
          "https://x.com/mistravora",
          "https://web.facebook.com/people/Mistravora/61575779711385/",
        ],
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
