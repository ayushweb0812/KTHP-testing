import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { Ornament } from "@/components/site/Ornament";
import { pageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, CONTACT } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service & Booking Conditions",
  description: `Booking terms, cancellation policy, and conditions of stay at ${SITE_NAME}, Satna, Madhya Pradesh.`,
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 pt-32 pb-20 lg:px-10">
      <p className="eyebrow">Legal</p>
      <h1 className="text-display text-4xl md:text-5xl mt-4 text-[var(--maroon)]">Terms of Service</h1>
      <Ornament className="mt-6 w-24 text-[var(--gold)]" />
      <p className="mt-6 text-sm text-muted-foreground">Last updated: June 2026</p>

      <div className="mt-10 space-y-8 font-serif text-foreground/85 leading-relaxed">
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Bookings</h2>
          <p>
            Reservations at {SITE_NAME} are confirmed only after payment verification through our secure checkout
            partner. Room rates, inclusions, and shoot packages are as displayed at the time of booking or as agreed
            in writing for bespoke enquiries.
          </p>
        </section>
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Cancellation</h2>
          <p>
            Cancellation and refund terms are communicated at booking confirmation. Force majeure events may be
            handled on a case-by-case basis in line with palace policy and applicable law.
          </p>
        </section>
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Property rules</h2>
          <p>
            Guests must respect heritage property guidelines, local customs, and the privacy of the royal family
            quarters. Commercial photography and events require prior written approval.
          </p>
        </section>
        <section>
          <h2 className="text-display text-2xl text-[var(--maroon)] mb-3">Contact</h2>
          <p>
            <a href={`mailto:${CONTACT.email}`} className="text-[var(--maroon)] underline">
              {CONTACT.email}
            </a>{" "}
            · {CONTACT.phoneDisplay}
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
