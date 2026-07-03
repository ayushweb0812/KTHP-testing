import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import SmoothScroll from "@/components/site/SmoothScroll";
import CursorTrail from "@/components/site/CursorTrail";
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
  metadataBase: new URL("https://kilatheheritagepalace.com"),
  title: {
    default: "Kila The Heritage Palace",
    template: "%s | Kila The Heritage Palace",
  },
  description:
    "Experience royal heritage, luxury stays, royal weddings, and authentic hospitality at Kila The Heritage Palace.",
  authors: [{ name: "Kila Heritage Palace" }],
  formatDetection: { telephone: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: "Kila The Heritage Palace",
    description:
      "Experience royal heritage, luxury stays, royal weddings, and authentic hospitality at Kila The Heritage Palace.",
    url: "https://kilatheheritagepalace.com",
    siteName: "Kila The Heritage Palace",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/heritage/legacy/l3.webp",
        width: 1200,
        height: 630,
        alt: "Kila The Heritage Palace — Kothi, Satna, Madhya Pradesh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kila The Heritage Palace",
    description:
      "Experience royal heritage, luxury stays, royal weddings, and authentic hospitality at Kila The Heritage Palace.",
    images: ["/heritage/legacy/l3.webp"],
  },
};

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
