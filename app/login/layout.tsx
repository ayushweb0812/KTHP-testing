import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Guest Sign In",
  description: "Sign in to manage your bookings at Kila The Heritage Palace.",
  path: "/",
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
