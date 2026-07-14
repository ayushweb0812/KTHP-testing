import type { Metadata } from "next";
import { Suspense } from "react";
import ReserveClient from "@/components/site/ReserveClient";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { reservePageSchemas } from "@/lib/seo/schema";
import { OG_IMAGES } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Book Direct — Stays, Wedding Shoots & Palace Experiences",
  description:
    "Book direct at Killa The Heritage Palace — four heritage chambers, palace pre-wedding shoots, homestay with the royal family, and private events in Kothi, Satna.",
  path: "/reserve",
  ogImage: OG_IMAGES.reserve,
  ogImageAlt:
    "Book your royal stay at Killa The Heritage Palace — heritage suites and palace experiences",
});

export default function ReservePage() {
  return (
    <>
      <PageJsonLd schemas={reservePageSchemas()} />
      <Suspense fallback={null}>
        <ReserveClient />
      </Suspense>
    </>
  );
}
