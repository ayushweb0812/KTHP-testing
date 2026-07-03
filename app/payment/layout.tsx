import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Payment",
  description: "Secure payment for your Kila The Heritage Palace reservation.",
  path: "/payment",
  noIndex: true,
});

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
