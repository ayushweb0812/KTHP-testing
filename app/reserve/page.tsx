import type { Metadata } from "next";
import ReserveClient from "@/components/site/ReserveClient";
import { pageMetadata } from "@/lib/seo/metadata";
import { PageJsonLd } from "@/components/seo/PageJsonLd";
import { reservePageSchemas } from "@/lib/seo/schema";

export const metadata: Metadata = pageMetadata({
  title: "Book Direct — Stays, Wedding Shoots & Palace Experiences",
  description:
    "Reserve your heritage suite direct at Kila The Heritage Palace. Check availability for staycations, pre-wedding shoots, homestays, and private events in Satna, MP — no OTA commission.",
  path: "/reserve",
  ogImage: "/heritage/rooms/1.webp",
  ogImageAlt: "Reserve a heritage suite at Kila The Heritage Palace",
});

export default function ReservePage() {
  return (
    <>
      <PageJsonLd schemas={reservePageSchemas()} />
      <ReserveClient />
    </>
  );
}
