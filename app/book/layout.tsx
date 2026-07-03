import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Complete Your Booking",
  description: "Secure checkout for Kila The Heritage Palace reservations.",
  path: "/",
  noIndex: true,
});

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
