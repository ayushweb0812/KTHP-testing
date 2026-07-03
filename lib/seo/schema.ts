import type { FaqItem } from "./faqs";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  CONTACT,
} from "./site";
import { STAY_FAQS, WEDDING_FAQS, HERITAGE_FAQS } from "./faqs";

const HOTEL_ID = `${SITE_URL}/#hotel`;

export function buildHotelSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Hotel", "LodgingBusiness"],
    "@id": HOTEL_ID,
    name: SITE_NAME,
    alternateName: ["KTHP", "Kila Kothi", "House of Kothi"],
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    foundingDate: "1738",
    numberOfRooms: 4,
    priceRange: "₹₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.locality,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: process.env.NEXT_PUBLIC_HOTEL_LAT || "24.5693",
      longitude: process.env.NEXT_PUBLIC_HOTEL_LNG || "80.7810",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Heritage architecture", value: true },
      { "@type": "LocationFeatureSpecification", name: "Pre-wedding shoot location", value: true },
      { "@type": "LocationFeatureSpecification", name: "Royal family hosted stay", value: true },
    ],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": HOTEL_ID },
    inLanguage: "en-IN",
  };
}

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/about#organization`,
    name: SITE_NAME,
    alternateName: ["House of Kothi", "Kila Kothi"],
    url: `${SITE_URL}/about`,
    foundingDate: "1738",
    description:
      "The Suryavanshi House of Kothi — rulers of Kothi, Satna, and stewards of Kila The Heritage Palace, a living heritage property in Bundelkhand.",
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.locality,
      addressRegion: CONTACT.address.region,
      postalCode: CONTACT.address.postalCode,
      addressCountry: CONTACT.address.country,
    },
    parentOrganization: { "@id": HOTEL_ID },
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? SITE_URL : `${SITE_URL}${item.path}`,
    })),
  };
}

export function buildFAQPageSchema(faqs: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildWeddingServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/reserve#wedding-shoot-service`,
    name: "Palace Pre-Wedding & Wedding Shoot Packages",
    serviceType: "Wedding and pre-wedding photography location",
    provider: { "@id": HOTEL_ID },
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Madhya Pradesh, India",
    },
    description:
      "Half Day, Full Day, and Two Day Royal wedding shoot packages at Kila The Heritage Palace, Kothi, Satna — heritage courtyards, interiors, and royal hosting.",
    url: `${SITE_URL}/reserve`,
  };
}

const HERITAGE_ROOMS = [
  { name: "Royal Suite", description: "Heritage suite with carved wooden panels and royal palace character." },
  { name: "Courtyard Room", description: "Chamber opening to palace arches with marble floors and courtyard views." },
  { name: "Garden View Room", description: "Heritage room with garden outlook and palace serenity." },
  { name: "Heritage Nook", description: "Intimate heritage chamber within the living palace." },
];

export function buildHotelRoomSchemas() {
  return HERITAGE_ROOMS.map((room, index) => ({
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    "@id": `${SITE_URL}/reserve#room-${index + 1}`,
    name: room.name,
    description: room.description,
    containedInPlace: { "@id": HOTEL_ID },
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: 2,
      unitText: "guests",
    },
    url: `${SITE_URL}/reserve`,
  }));
}

export function homePageSchemas() {
  return [buildWebSiteSchema()];
}

export function aboutPageSchemas() {
  const pageUrl = `${SITE_URL}/about`;
  return [
    buildOrganizationSchema(),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Royal History & Lineage", path: "/about" },
    ]),
    buildFAQPageSchema(HERITAGE_FAQS, pageUrl),
  ];
}

export function reservePageSchemas() {
  const pageUrl = `${SITE_URL}/reserve`;
  return [
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Reserve", path: "/reserve" },
    ]),
    buildFAQPageSchema([...STAY_FAQS, ...WEDDING_FAQS], pageUrl),
    buildWeddingServiceSchema(),
    ...buildHotelRoomSchemas(),
  ];
}

/** Ready for Week 2 — /wedding-shoot */
export function weddingShootPageSchemas() {
  const pageUrl = `${SITE_URL}/wedding-shoot`;
  return [
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Wedding Shoot", path: "/wedding-shoot" },
    ]),
    buildFAQPageSchema(WEDDING_FAQS, pageUrl),
    { ...buildWeddingServiceSchema(), url: pageUrl, "@id": `${pageUrl}#wedding-shoot-service` },
  ];
}

/** Ready for Week 2 — /staycation */
export function staycationPageSchemas() {
  const pageUrl = `${SITE_URL}/staycation`;
  return [
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Staycation", path: "/staycation" },
    ]),
    buildFAQPageSchema(STAY_FAQS, pageUrl),
    ...buildHotelRoomSchemas().map((room) => ({ ...room, url: pageUrl })),
  ];
}
