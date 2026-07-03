import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import SmoothScroll from "@/components/site/SmoothScroll";
import "./globals.css";

// next/font replaces the <link> tags in __root.tsx.
// Fonts are self-hosted at build time — no layout shift, better CLS/LCP.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
<<<<<<< Updated upstream
  title: {
    default: "Kila — The Heritage Palace | 287 Years of Royal Legacy",
    template: "%s | Kila Heritage Palace",
=======
  metadataBase: new URL("https://kilatheheritagepalace.com"),
  title: {
    default: "Kila The Heritage Palace",
    template: "%s | Kila The Heritage Palace",
  },
  description:
    "Experience royal heritage, luxury stays, royal weddings, and authentic hospitality at Kila The Heritage Palace.",
  applicationName: SITE_NAME_SHORT,
  authors: [{ name: SITE_NAME_SHORT, url: SITE_URL }],
  creator: SITE_NAME_SHORT,
  publisher: SITE_NAME_SHORT,
  formatDetection: { telephone: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
>>>>>>> Stashed changes
  },
  description:
    "Step into Kila, a living heritage palace in Madhya Pradesh. Two centuries of unbroken royal lineage, four exclusive heritage suites, and personal hosting by the royal family.",
  authors: [{ name: "Kila Heritage Palace" }],
  openGraph: {
<<<<<<< Updated upstream
    title: "Kila — The Heritage Palace",
    description:
      "Experience 287 years of royal heritage and village serenity in Madhya Pradesh.",
    type: "website",
=======
    title: SITE_NAME,
    description:
      "Experience royal heritage, luxury stays, royal weddings, and authentic hospitality at Kila The Heritage Palace.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Kothi, Satna, Madhya Pradesh`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Experience royal heritage, luxury stays, royal weddings, and authentic hospitality at Kila The Heritage Palace.",
    images: [DEFAULT_OG_IMAGE],
>>>>>>> Stashed changes
  },
  twitter: { card: "summary_large_image" },
};

import CursorTrail from "@/components/site/CursorTrail";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <CursorTrail />
        <SmoothScroll>
          <SiteHeader />
          {children}
          <SiteFooter />
        </SmoothScroll>
      </body>
    </html>
  );
}
