// Server Component — no hooks, plain Links → next/link

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { Ornament } from "./Ornament";
import { CONTACT, SOCIAL } from "@/lib/seo/site";

export function SiteFooter() {
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hello, I would like to enquire about Kila The Heritage Palace."
  )}`;

  return (
    <footer
      id="contact"
      className="relative mt-4 text-parchment paper-grain"
      style={{ background: "var(--gradient-royal)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 relative">
        <div className="text-center mb-4">
          <p className="eyebrow text-[var(--gold)]">Contact</p>
          <h2 className="text-display text-2xl md:text-3xl text-parchment mt-2">
            Begin your <em className="gold-text not-italic">royal</em> journey
          </h2>
          <Ornament className="mx-auto mt-3 w-16 text-[var(--gold)]" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div className="sm:text-left">
            <p className="eyebrow">Email</p>
            <p className="font-display text-xl mt-1">
              <a href={`mailto:${CONTACT.email}`} className="hover:text-[var(--gold)] transition-colors">
                {CONTACT.email}
              </a>
            </p>
            <p className="text-parchment/60 text-xs mt-1">For inquiries &amp; private reservations</p>
          </div>
          <div className="sm:text-center">
            <p className="eyebrow">Telephone &amp; WhatsApp</p>
            <p className="font-display text-xl mt-1">
              <a href={`tel:${CONTACT.phone}`} className="hover:text-[var(--gold)] transition-colors">
                {CONTACT.phoneDisplay}
              </a>
            </p>
            <p className="text-parchment/60 text-xs mt-1">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">
                Chat on WhatsApp →
              </a>
            </p>
          </div>
          <div className="sm:text-right">
            <p className="eyebrow">Address</p>
            <p className="font-display text-xl mt-1 leading-tight">
              {CONTACT.address.street},<br />
              {CONTACT.address.locality}, {CONTACT.address.region}
            </p>
            <p className="text-parchment/60 text-xs mt-1">Amidst royal serenity</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--gold)]/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[var(--gold)]/60 flex items-center justify-center">
              <span className="text-[var(--gold)] font-display text-xl">क</span>
            </div>
            <div className="leading-none">
              <div className="text-[var(--gold)] font-display text-xl">KILA</div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-parchment/60">
                The Heritage Palace
              </div>
            </div>
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs uppercase tracking-[0.22em] text-parchment/70">
            <Link href="/" className="hover:text-[var(--gold)]">Home</Link>
            <Link href="/about" className="hover:text-[var(--gold)]">Heritage</Link>
            <Link href="/reserve" className="hover:text-[var(--gold)]">Bookings</Link>
            <a href={SOCIAL.tripAdvisor} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">
              TripAdvisor
            </a>
            <a href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">
              Instagram
            </a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--gold)]">
              WhatsApp
            </a>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-xs text-parchment/50">© {new Date().getFullYear()} Kila Heritage Palace</p>
            <p className="text-[10px] text-parchment/40 mt-1 uppercase tracking-wider">
              <Link href="/privacy" className="hover:text-[var(--gold)]">Privacy</Link>
              {" · "}
              <Link href="/terms" className="hover:text-[var(--gold)]">Terms</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
