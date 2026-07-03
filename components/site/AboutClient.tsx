"use client";

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useEffect, useRef, useState } from "react";
import { Ornament } from "@/components/site/Ornament";
import { MoonPhases } from "@/components/site/MoonPhases";
import RevealWrapper from "@/components/site/RevealWrapper";

const lineage = [
  { name: "Rais Duniyapati Singh", role: "Rais of Kothi", date: "fl. 1810", text: "Married and had issue: Rais Abdhut Singh.", portrait: "/heritage/legacy/l1.webp", family: "/heritage/legacy/l2.webp" },
  { name: "Rais Abdhut Singh", role: "Rais of Kothi", date: "—", text: "Married and had issue: Rao Ran Bahadur Singh.", portrait: "/heritage/legacy/l2.webp", family: "/heritage/legacy/l3.webp" },
  { name: "Rais Ran Bahadur Singh", role: "Raja of Kothi", date: "1862 – 1887", text: "Born 1829. Granted the title of Raja Bahadur as a hereditary distinction on 1st January 1878 in recognition of his loyalty, public spirit, and benevolence. Died 5th June 1887.", portrait: "/heritage/legacy/l3.webp", family: "/heritage/legacy/l4.webp" },
  { name: "Raja Bahadur Bhagwat Bahadur Singh", role: "Raja of Kothi", date: "1887 – 1895", text: "Born 1852. Succeeded to the gadi on 5th June 1887. Married the only daughter of the Kanhpuria Raja of Jamon in Sultanpur District.", portrait: "/heritage/legacy/l4.webp", family: "/heritage/legacy/l5.webp" },
  { name: "Raja Bahadur Avadhendra Singh", role: "Raja of Kothi", date: "1895 – 1914", text: "Issue: Raja Bahadur Kaushalendra Pratap Singh; Umaraman Pratap Singh (b. 1936, succeeded to Jamon); Tej Pratap Singh.", portrait: "/heritage/legacy/l5.webp", family: "/heritage/legacy/l1.webp" },
  { name: "Sitaram Pratap Bahadur Singh", role: "Raja of Kothi", date: "1914 – 1934", text: "Carried the gadi through the early twentieth century.", portrait: "/heritage/legacy/l1.webp", family: "/heritage/legacy/l2.webp" },
  { name: "Raja Bahadur Kaushalendra Pratap Singh", role: "Raja of Kothi", date: "1934 –", text: "Born 1912. Married a daughter of Raja Narendra Bahadur Pal of Mahson, Basti district (U.P.).", portrait: "/heritage/legacy/l2.webp", family: "/heritage/legacy/l3.webp" },
  { name: "Raja Bahadur Govind Pratap Singh", role: "Raja of Kothi", date: "fl. 1970", text: "Married Ranisaheb Jaswant Kumari of Mandwa. Died 11th January 2017.", portrait: "/heritage/legacy/l3.webp", family: "/heritage/legacy/l4.webp" },
  { name: "Raja Bahadur Ghanshyam Singh Judeo", role: "Present Raja of Kothi", date: "Present", text: "Married Ranisaheba Savitri Singh of Thikana Ganshipur (Allahabad).", portrait: "/heritage/legacy/l4.webp", family: "/heritage/legacy/l5.webp" },
  { name: "Raja Bahadur Harshvardhan Singh Judeo", role: "Yuvraj — Heir Apparent", date: "—", text: "The next chapter of the House of Kothi.", portrait: "/heritage/legacy/l5.webp", family: "/heritage/legacy/l1.webp" },
];

const dynasties = [
  { title: "Suryavanshi", sub: "The Solar Dynasty", img: "/heritage/about/lineage/Suryavanshi.webp", text: "The most ancient and revered, tracing its origins directly to the Sun God. This dynasty flows through the mythical kings of Ayodhya — Ikshvaku, Raghu, and the epic hero Lord Rama.", glyph: "☀" },
  { title: "Chandravanshi", sub: "The Lunar Dynasty", img: "/heritage/about/lineage/Chandravashi.webp", text: "Claiming descent from the Moon God (Soma), the Chandravanshi lineage is woven into the fabric of the Mahabharata. Its branches include the Puruvanshi and the Yaduvanshi, to which Lord Krishna belonged.", glyph: "☾" },
  { title: "Agnivanshi", sub: "The Fire Dynasty", img: "/heritage/about/lineage/Agnivanshi.webp", text: "Stands apart, claiming descent from a sacrificial fire pit (Agnipala), symbolizing purification and renewed martial vigor. Includes the Chauhan, Parmara, and Solanki clans.", glyph: "🔥" },
];

export default function AboutClient() {
  return (
    <RevealWrapper>
      <div className="overflow-hidden">
        {/* HERO */}
        <section className="relative h-screen min-h-[720px] flex items-center justify-center text-center text-parchment overflow-hidden">
          <div className="absolute inset-0">
            <img src="/heritage/legacy/l1.webp" alt="The House of Kothi" className="w-full h-full object-cover ken-burns" />
            <div className="absolute inset-0 bg-[oklch(0.14_0.04_30/0.7)]" />
            <div className="absolute inset-0" style={{ background: "var(--gradient-vignette)" }} />
          </div>
          <div className="relative z-10 px-6 max-w-4xl">
            <p className="eyebrow text-[var(--gold)] animate-fade-up">Genealogy · The House of Kothi</p>
            <Ornament className="mx-auto mt-6 w-44 text-[var(--gold)] animate-fade-up-delay-1" />
            <h1 className="text-display text-[clamp(2.75rem,7vw,6rem)] mt-6 leading-[1] animate-fade-up-delay-1">
              A legacy through<br />
              <em className="not-italic gold-text">generations.</em>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto font-serif text-lg md:text-xl text-parchment/85 animate-fade-up-delay-2">
              Walk the long corridor of time. Two centuries of unbroken nobility, told through the names that have carried the gadi forward.
            </p>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-parchment/60 text-[10px] uppercase tracking-[0.4em] flex flex-col items-center gap-3">
            <span>Walk through</span>
            <div className="w-px h-12 bg-gradient-to-b from-[var(--gold)] to-transparent" />
          </div>
        </section>

        {/* INTRO */}
        <section className="relative pt-24 pb-0 md:pt-28 md:pb-0 px-6 lg:px-10 paper-grain overflow-hidden">
          <MoonPhases opacity={0.13} duration={75} count={9} size={52} />
          <div className="relative mx-auto max-w-3xl text-center reveal">
            <p className="eyebrow">Kila · The Heritage Palace</p>
            <h2 className="text-display text-4xl md:text-6xl mt-5 leading-tight">The House of <em className="gold-text not-italic">Kothi</em></h2>
            <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
            <p className="mt-10 font-serif text-xl leading-relaxed text-foreground/80">
              From the early nineteenth century, the rulers of Kothi have stewarded a thread of unbroken nobility — recognized by the Crown, intertwined with neighbouring royal houses, and devoted to public spirit and benevolence.
            </p>
          </div>
        </section>

        {/* LINEAGE WALK */}
        <LineageWalk />

        {/* DYNASTIES */}
        <section className="py-28 md:py-32 px-6 lg:px-10 text-parchment relative paper-grain overflow-hidden" style={{ background: "var(--gradient-royal)" }}>
          <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 60%)" }} />
          <div className="mx-auto max-w-7xl relative">
            <div className="text-center mb-16 reveal">
              <p className="eyebrow text-[var(--gold)]">Lineage</p>
              <h2 className="text-display text-5xl md:text-6xl mt-5 leading-tight">The Rajput Kshatriya <em className="gold-text not-italic">Vanshas</em></h2>
              <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
              <p className="mt-8 max-w-3xl mx-auto font-serif text-lg text-parchment/80">Three fundamental lineages from which the 36 major royal clans descend — flowing from the sun, the moon, and the sacrificial fire.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
              {dynasties.map((d, i) => (
                <article key={d.title} className="group reveal relative bg-[oklch(0.18_0.06_258/0.55)] border border-[var(--gold)]/30 backdrop-blur-sm overflow-hidden hover:border-[var(--gold)] hover:-translate-y-1 transition-all duration-700" style={{ transitionDelay: `${i * 140}ms` }}>
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img src={d.img} alt={d.title} className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.06_258/0.95)] via-[oklch(0.14_0.06_258/0.4)] to-transparent" />
                    <div className="absolute top-5 right-5 w-12 h-12 rounded-full border border-[var(--gold)]/60 flex items-center justify-center text-[var(--gold)] text-xl backdrop-blur-sm bg-[oklch(0.14_0.06_258/0.4)]">{d.glyph}</div>
                    <div className="absolute bottom-5 left-6 right-6">
                      <p className="eyebrow text-[var(--gold)]">{d.sub}</p>
                      <h3 className="text-display text-3xl md:text-4xl mt-2 text-parchment">{d.title}</h3>
                    </div>
                  </div>
                  <div className="p-8"><p className="font-serif text-base text-parchment/85 leading-relaxed">{d.text}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CLOSING */}
        <section className="relative py-28 md:py-32 px-6 lg:px-10 text-center paper-grain overflow-hidden">
          <MoonPhases opacity={0.12} duration={85} count={10} size={48} direction="rtl" />
          <div className="relative mx-auto max-w-2xl reveal">
            <Ornament className="mx-auto w-40 text-[var(--gold)]" />
            <p className="mt-8 font-serif italic text-2xl md:text-3xl leading-relaxed text-foreground/80">
              &quot;Stones speak. Centuries whisper their secrets in silent halls where kings once walked.&quot;
            </p>
            <Link href="/reserve" className="inline-block mt-12 px-10 py-4 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.36em] hover:bg-[var(--maroon-deep)] transition-colors">
              Walk these halls →
            </Link>
          </div>
        </section>
      </div>
    </RevealWrapper>
  );
}

function LineageWalk() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const passed = (vh / 2) - rect.top;
      const p = Math.max(0, Math.min(1, passed / rect.height));
      setProgress(p);
      setActiveIndex(Math.min(lineage.length - 1, Math.floor(p * lineage.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  return (
    <section ref={sectionRef} className="relative pt-0 pb-28 md:pt-0 md:pb-32 px-6 lg:px-10 bg-[oklch(0.94_0.022_80)] paper-grain overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-30 float-slow" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 65%)" }} />
      <MoonPhases opacity={0.11} duration={100} count={11} size={56} />
      <div className="mx-auto max-w-6xl relative">
        <div className="sticky top-20 z-30 -mx-6 lg:-mx-10 mb-14 px-6 lg:px-10 py-5 bg-[oklch(0.94_0.022_80)] border-y border-[var(--gold)]/20 shadow-sm">
          <div className="flex items-baseline justify-between gap-6 max-w-6xl mx-auto">
            <div>
              <p className="eyebrow">Walk the Lineage</p>
              <h2 className="text-display text-2xl md:text-4xl mt-1 text-[var(--maroon)] leading-tight">
                Generation <em className="gold-text not-italic">{String(activeIndex + 1).padStart(2, "0")}</em>
                <span className="text-muted-foreground text-base md:text-xl"> / {lineage.length}</span>
              </h2>
            </div>
            <div className="flex-1 max-w-md hidden sm:block">
              <div className="h-px bg-[var(--gold)]/20 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--gold)] to-[var(--maroon)]" style={{ width: `${progress * 100}%` }} />
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.32em] text-muted-foreground text-right">{Math.round(progress * 100)}% through history</div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-[var(--gold)]/20" />
          <div className="absolute left-6 sm:left-1/2 top-0 w-px bg-gradient-to-b from-[var(--gold)] via-[var(--maroon)] to-transparent" style={{ height: `${progress * 100}%` }} />
          <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full pointer-events-none" style={{ top: `${progress * 100}%`, background: "var(--gold)", boxShadow: "0 0 30px 8px color-mix(in oklab, var(--gold) 60%, transparent)" }} />
          {lineage.map((p, i) => (
            <LineageEntry key={p.name} entry={p} index={i} total={lineage.length} isActive={i === activeIndex} />
          ))}
        </div>
        <div className="text-center mt-16 reveal">
          <Ornament className="mx-auto w-40 text-[var(--gold)] opacity-70" />
          <p className="mt-6 font-serif italic text-lg text-muted-foreground">…and so the gadi passes on.</p>
        </div>
      </div>
    </section>
  );
}

function LineageEntry({ entry, index, isActive }: { entry: (typeof lineage)[number]; index: number; total: number; isActive: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const left = index % 2 === 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.25, rootMargin: "0px 0px -10% 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative mb-24 md:mb-32 sm:grid sm:grid-cols-2 sm:gap-16 items-center">
      <div className={`absolute left-6 sm:left-1/2 -translate-x-1/2 top-3 z-10 transition-all duration-700 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
        <div className={`relative w-12 h-12 rounded-full border flex items-center justify-center font-display text-sm transition-all duration-500 ${isActive ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--maroon-deep)] shadow-[0_0_24px_rgba(184,134,60,0.6)] scale-110" : "border-[var(--gold)]/60 bg-[oklch(0.94_0.022_80)] text-[var(--maroon)]"}`}>
          {String(index + 1).padStart(2, "0")}
        </div>
      </div>
      <div className={`hidden sm:flex justify-center transition-all duration-1000 ease-out ${left ? "sm:order-2 sm:pl-16 sm:justify-start" : "sm:order-1 sm:pr-16 sm:justify-end"} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: visible ? "260ms" : "0ms" }}>
        <PortraitFrame portrait={entry.portrait} family={entry.family} name={entry.name} />
      </div>
      <div className={`pl-20 sm:pl-0 transition-all duration-1000 ease-out ${left ? "sm:order-1 sm:text-right sm:pr-16" : "sm:order-2 sm:pl-16"} ${visible ? "opacity-100 translate-x-0" : `opacity-0 ${left ? "sm:-translate-x-12" : "sm:translate-x-12"} translate-y-6`}`} style={{ transitionDelay: visible ? "120ms" : "0ms" }}>
        <p className="eyebrow text-[var(--gold)]">{entry.date}</p>
        <h3 className="text-display text-3xl md:text-4xl mt-3 text-[var(--maroon)] leading-tight">{entry.name}</h3>
        <p className="font-serif italic text-[var(--maroon)]/70 mt-2">{entry.role}</p>
        <div className={`mt-4 h-px w-24 bg-gradient-to-r from-[var(--gold)] to-transparent ${left ? "sm:ml-auto sm:from-transparent sm:to-[var(--gold)]" : ""}`} />
        {entry.text && <p className="mt-5 font-serif text-base md:text-lg text-foreground/75 leading-relaxed max-w-xl sm:inline-block">{entry.text}</p>}
        <div className="mt-6 sm:hidden"><PortraitFrame portrait={entry.portrait} family={entry.family} name={entry.name} compact /></div>
      </div>
    </div>
  );
}

function PortraitFrame({ portrait, family, name, compact }: { portrait?: string; family?: string; name: string; compact?: boolean }) {
  if (!portrait) return null;
  return (
    <div className={`relative ${compact ? "w-48" : "w-full max-w-[280px]"} group`}>
      <div className="relative p-3 bg-gradient-to-b from-[oklch(0.78_0.12_80)] via-[var(--gold)] to-[oklch(0.55_0.12_70)] shadow-[var(--shadow-royal)] rounded-sm">
        <div className="p-2 bg-[oklch(0.16_0.06_258)] rounded-sm">
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
            <img src={portrait} alt={`Portrait of ${name}`} className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0.05_258/0.55)] via-transparent to-[oklch(0.95_0.04_85/0.10)] mix-blend-multiply" />
            <div className="absolute inset-2 border border-[var(--gold)]/50 pointer-events-none" />
          </div>
        </div>
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rotate-45 bg-[var(--gold)] border border-[oklch(0.16_0.06_258)]" />
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-px h-4 bg-[var(--gold)]/60" />
        <div className="mt-3 text-center">
          <p className="text-[9px] uppercase tracking-[0.32em] text-[var(--maroon-deep)] bg-[var(--gold)] py-1.5 px-2 truncate">
            {name.replace(/^Raja Bahadur |^Rais |^Raja /, "")}
          </p>
        </div>
      </div>
      {family && !compact && (
        <div className="absolute -bottom-6 -right-6 w-24 h-24 p-1.5 bg-gradient-to-b from-[var(--gold)] to-[oklch(0.55_0.12_70)] shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-700">
          <div className="relative w-full h-full overflow-hidden">
            <img src={family} alt={`Family of ${name}`} className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-[oklch(0.18_0.05_258/0.25)] mix-blend-multiply" />
          </div>
          <span className="absolute -bottom-5 right-0 text-[8px] uppercase tracking-[0.3em] text-[var(--maroon)]">Family</span>
        </div>
      )}
    </div>
  );
}
