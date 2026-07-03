import type { Metadata } from "next";

const SITE_URL = "https://kilatheheritagepalace.com";
const SITE_NAME = "Kila The Heritage Palace";
const DEFAULT_OG_IMAGE = "/heritage/legacy/l3.webp";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = `${SITE_NAME} — heritage palace in Satna, Madhya Pradesh`,
  keywords,
  noIndex = false,
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    authors: [{ name: "Kila Heritage Palace" }],
  };
}
