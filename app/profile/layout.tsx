import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import ProfileShell from "@/components/site/ProfileShell";

export const metadata: Metadata = pageMetadata({
  title: "My Profile",
  description:
    "Manage your bookings, personal details, and preferences at Kila The Heritage Palace.",
  path: "/",
  noIndex: true,
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProfileShell>{children}</ProfileShell>;
}
