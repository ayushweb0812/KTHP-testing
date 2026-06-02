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
  title: {
    default: "Kila — The Heritage Palace | 287 Years of Royal Legacy",
    template: "%s | Kila Heritage Palace",
  },
  description:
    "Step into Kila, a living heritage palace in Madhya Pradesh. Two centuries of unbroken royal lineage, four exclusive heritage suites, and personal hosting by the royal family.",
  authors: [{ name: "Kila Heritage Palace" }],
  openGraph: {
    title: "Kila — The Heritage Palace",
    description:
      "Experience 287 years of royal heritage and village serenity in Madhya Pradesh.",
    type: "website",
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
