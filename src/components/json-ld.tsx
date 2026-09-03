import { site } from "@/lib/site";

export function OrganizationJsonLd() {
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
        geo: {
          "@type": "GeoCoordinates",
          latitude: site.geo.lat,
          longitude: site.geo.lng,
        },
        priceRange: "$$",
        sameAs: [
          "https://github.com/mistravora",
          "https://www.linkedin.com/company/mistravora",
          "https://x.com/mistravora",
          "https://web.facebook.com/people/Mistravora/61575779711385/",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
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
          target: `${site.url}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#service`,
        name: "Software Development & Digital Products",
        provider: { "@id": `${site.url}/#organization` },
        serviceType: "Software Development",
        areaServed: { "@type": "Country", name: "Sri Lanka" },
        url: site.url,
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What services does Mistravora offer?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mistravora builds custom web platforms, business software, e-commerce solutions, and AI-powered features for businesses in Sri Lanka and worldwide.",
            },
          },
          {
            "@type": "Question",
            name: "How can I contact Mistravora?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `You can reach us at ${site.email} or ${site.phone}.`,
            },
          },
          {
            "@type": "Question",
            name: "Where is Mistravora located?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Mistravora is based in Sri Lanka, serving clients locally and worldwide.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
