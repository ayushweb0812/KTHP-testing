// Server Component — no hooks, plain Links → next/link

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { Ornament } from "./Ornament";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="relative mt-32 text-parchment paper-grain"
      style={{ background: "var(--gradient-royal)" }}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 relative">
        <div className="text-center mb-16">
          <p className="eyebrow text-[var(--gold)]">Contact</p>
          <h2 className="text-display text-5xl md:text-6xl text-parchment mt-4">
            Begin your <em className="gold-text not-italic">royal</em> journey
          </h2>
          <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
        </div>

        <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <p className="eyebrow">Email</p>
            <p className="font-display text-2xl mt-3">heritage@kilatheheritageplc.com</p>
            <p className="text-parchment/60 text-sm mt-2">For inquiries &amp; private reservations</p>
          </div>
          <div>
            <p className="eyebrow">Telephone</p>
            <p className="font-display text-2xl mt-3">+91 (755) 123-4567</p>
            <p className="text-parchment/60 text-sm mt-2">Direct line to guest relations</p>
          </div>
          <div>
            <p className="eyebrow">Address</p>
            <p className="font-display text-2xl mt-3 leading-tight">
              Kila The Heritage Palace<br />Maihar, Madhya Pradesh
            </p>
            <p className="text-parchment/60 text-sm mt-2">Amidst royal serenity</p>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-[var(--gold)]/25 flex flex-col md:flex-row items-center justify-between gap-6">
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
          <div className="flex gap-8 text-xs uppercase tracking-[0.28em] text-parchment/70">
            <Link href="/" className="hover:text-[var(--gold)]">Home</Link>
            <Link href="/about" className="hover:text-[var(--gold)]">Heritage</Link>
          </div>
          <p className="text-xs text-parchment/50">© {new Date().getFullYear()} Kila Heritage Palace</p>
        </div>
      </div>
    </footer>
  );
}
