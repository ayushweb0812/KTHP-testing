import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import SmoothScroll from "@/components/site/SmoothScroll";
import CursorTrail from "@/components/site/CursorTrail";
import { TransitionProvider } from "@/components/transitions/TransitionContext";
import { HotelJsonLd } from "@/components/seo/HotelJsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_NAME_SHORT,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo/site";
import Script from "next/script";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./globals.css";

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Heritage Palace & Boutique Stay in Satna, MP`,
    template: `%s | ${SITE_NAME_SHORT}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME_SHORT,
  authors: [{ name: SITE_NAME_SHORT, url: SITE_URL }],
  creator: SITE_NAME_SHORT,
  publisher: SITE_NAME_SHORT,
  formatDetection: { telephone: true, email: true },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-5JGGSZ80WN";

  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <HotelJsonLd />
        {/* Google tag (gtag.js) — GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-gtag"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `,
          }}
        />
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        {gtmId && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
        )}
        <CursorTrail />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <SmoothScroll>
            <TransitionProvider>
              <SiteHeader />
              {children}
              <SiteFooter />
            </TransitionProvider>
          </SmoothScroll>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
