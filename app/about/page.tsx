import type { Metadata } from "next";
import AboutClient from "@/components/site/AboutClient";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { aboutPageSchemas } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "Royal History & Lineage of the House of Kothi",
  description:
    "Explore 287 years of Suryavanshi royal heritage at Kila The Heritage Palace in Kothi, Satna. Genealogy, palace history, and the living legacy of Bundelkhand.",
  path: "/about",
  ogImage: "/heritage/legacy/l1.webp",
  ogImageAlt: "Royal lineage and heritage history — Kila The Heritage Palace",
});

export default function AboutPage() {
  return (
    <>
      <PageJsonLd schemas={aboutPageSchemas()} />
      <AboutClient />
    </>
  );
}
