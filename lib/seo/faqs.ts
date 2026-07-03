export type FaqItem = { question: string; answer: string };

/** Booking & stay — used on /reserve and future /staycation */
export const STAY_FAQS: FaqItem[] = [
  {
    question: "How many rooms does Kila The Heritage Palace have?",
    answer:
      "Kila The Heritage Palace offers four exclusive heritage suites and chambers. Each room is part of a 287-year-old living palace in Kothi, Satna, Madhya Pradesh.",
  },
  {
    question: "Can I book directly at Kila The Heritage Palace?",
    answer:
      "Yes. You can check availability and book direct on kilatheheritagepalace.com/reserve with secure online payment — no OTA commission on direct bookings.",
  },
  {
    question: "Where is Kila The Heritage Palace located?",
    answer:
      "The palace is at 1 Kila Kothi, Near Kila Road, Kothi, Satna, Madhya Pradesh — in the Bundelkhand region, near Maihar Sharda Temple and Bandhavgarh.",
  },
  {
    question: "What experiences are included during a stay?",
    answer:
      "Stays can include royal hospitality, heritage courtyard access, local folk performances, and curated palace experiences hosted by the royal family.",
  },
  {
    question: "Do you offer homestay with the royal family?",
    answer:
      "Yes. The homestay experience lets guests live as guests of the royal household — meals with the family and evenings in the palace courtyard. Enquire via the website.",
  },
];

/** Wedding & pre-wedding shoot — used on /reserve tab and future /wedding-shoot */
export const WEDDING_FAQS: FaqItem[] = [
  {
    question: "Does Kila The Heritage Palace offer pre-wedding and wedding shoots?",
    answer:
      "Yes. The palace offers Half Day (4 hours), Full Day (10 hours), and Two Day Royal shoot packages across courtyards, interiors, and heritage exteriors in Satna, MP.",
  },
  {
    question: "How many people can a wedding shoot crew include?",
    answer:
      "Half Day packages allow up to 6 crew; Full Day up to 12; Two Day Royal up to 20, with palace access, refreshments, and dedicated hosting as per package.",
  },
  {
    question: "Can we stay overnight during a two-day wedding shoot?",
    answer:
      "The Two Day Royal package includes overnight accommodation in a royal suite, full palace access, vintage props styling, and all meals.",
  },
  {
    question: "Is Kila The Heritage Palace suitable for intimate weddings?",
    answer:
      "Yes. With only four chambers, the palace is designed for intimate celebrations and pre-wedding shoots — not large 500-guest banquets.",
  },
];

/** Heritage — used on /about */
export const HERITAGE_FAQS: FaqItem[] = [
  {
    question: "When was Kila The Heritage Palace established?",
    answer:
      "The House of Kothi traces its heritage to 1738. The palace represents over 287 years of unbroken royal lineage in Bundelkhand, Madhya Pradesh.",
  },
  {
    question: "Who hosts guests at Kila The Heritage Palace?",
    answer:
      "Guests are hosted personally by the royal family of the House of Kothi — a living palace experience, not a chain hotel.",
  },
];
