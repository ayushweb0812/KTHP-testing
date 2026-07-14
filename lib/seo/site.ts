export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://kilatheheritagepalace.com";

export const SITE_NAME = "Killa The Heritage Palace";
export const SITE_NAME_SHORT = "Killa Heritage Palace";

export const SITE_DESCRIPTION =
  "A 287-year-old living palace in Kothi, Satna, Madhya Pradesh. Four exclusive heritage suites, palace pre-wedding shoots, royal homestays, and direct booking with the royal family.";

export const OG_IMAGES = {
  home: "/home.png",
  about: "/about.png",
  reserve: "/reserve.png",
} as const;

export const DEFAULT_OG_IMAGE = OG_IMAGES.home;

export const CONTACT = {
  email:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "team@kilatheheritagepalace.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 9898203503",
  phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY || "+91 9898203503",
  whatsapp:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "91 9898203503",
  address: {
    street: "1 Kila Kothi, Near Kila Road, Kothi",
    locality: "Kothi, Satna",
    region: "Madhya Pradesh",
    country: "IN",
    postalCode: process.env.NEXT_PUBLIC_HOTEL_POSTAL || "485001",
  },
};

export const SOCIAL = {
  tripAdvisor:
    process.env.NEXT_PUBLIC_TRIPADVISOR_URL ||
    "https://www.tripadvisor.in/Hotel-Kila_Kothi_Satna",
  instagram:
    process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
    "https://www.instagram.com/kilatheheritagepalacekothi/",
};

export const HOTEL_GEO = {
  latitude: process.env.NEXT_PUBLIC_HOTEL_LAT || "24.5693",
  longitude: process.env.NEXT_PUBLIC_HOTEL_LNG || "80.7810",
};
