import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { Ornament } from "@/components/site/Ornament";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, CONTACT } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}. How we collect, use, and protect guest data for bookings and enquiries.`,
  path: "/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pt-32 pb-20 lg:px-10">
      
      <p className="eyebrow">Legal</p>
      <h1 className="text-display text-4xl md:text-5xl mt-4 text-[var(--maroon)]">Privacy Policy</h1>
      <Ornament className="mt-6 w-24 text-[var(--gold)]" />
      <p className="mt-6 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-10 space-y-8 font-serif text-foreground/85 leading-relaxed">
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Who we are</h2>
          <p>
            {SITE_NAME} (&quot;we&quot;, &quot;the Palace&quot;) operates{" "}
            <a href="https://kilatheheritagepalace.com" className="text-[var(--maroon)] underline">
              kilatheheritagepalace.com
            </a>
            . Our registered address is {CONTACT.address.street}, {CONTACT.address.locality},{" "}
            {CONTACT.address.region}, India.
          </p>
        </section>
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Information we collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Name, email, and phone when you submit an enquiry or create a booking account</li>
            <li>Stay dates, guest count, and payment status for reservations</li>
            <li>Technical data (IP address, browser type) via analytics when you consent</li>
          </ul>
        </section>
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">How we use your data</h2>
          <p>
            To confirm bookings, respond to enquiries, process payments through our payment partner, improve our
            website, and communicate about your stay or shoot. We do not sell personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Contact</h2>
          <p>
            Questions:{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-[var(--maroon)] underline">
              {CONTACT.email}
            </a>
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="inline-block mt-12 text-xs uppercase tracking-[0.28em] text-[var(--maroon)] border-b border-[var(--gold)] pb-1 hover:text-[var(--gold)]"
      >
        ← Back to palace
      </Link>
    </article>
  );
}
