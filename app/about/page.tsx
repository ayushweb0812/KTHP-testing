import type { Metadata } from "next";
import AboutClient from "@/components/site/AboutClient";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { aboutPageSchemas } from "@/lib/seo/schema";
import { OG_IMAGES } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Royal History & Lineage of the House of Kothi",
  description:
    "Discover the House of Kothi — 287 years of Bundelkhand royalty, Rajput lineage, and living heritage at Killa The Heritage Palace in Satna, Madhya Pradesh.",
  path: "/about",
  ogImage: OG_IMAGES.about,
  ogImageAlt:
    "Discover your royal legacy — genealogical heritage and lineage at Killa The Heritage Palace",
});

export default function AboutPage() {
  return (
    <>
      <PageJsonLd schemas={aboutPageSchemas()} />
      <AboutClient />
    </>
  );
}
