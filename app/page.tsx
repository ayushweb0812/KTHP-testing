import type { Metadata } from "next";
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { Ornament } from "@/components/site/Ornament";
import { MoonPhases } from "@/components/site/MoonPhases";
import RevealWrapper from "@/components/site/RevealWrapper";
import { HeroSlideshow } from "@/components/site/HeroSlideshow";

export const metadata: Metadata = {
  title: "Kila — The Heritage Palace | 287 Years of Royal Legacy",
  description: "A living palace in Madhya Pradesh. Two centuries of unbroken royal lineage, four exclusive heritage suites, hosted personally by the royal family.",
  openGraph: { images: ["/heritage/legacy/l3.webp"] },
  twitter: { images: ["/heritage/legacy/l3.webp"] },
};

const legacyImages = [
  { src: "/heritage/legacy/l1.webp", title: "A Moment in History", caption: "Historic gathering at the palace entrance" },
  { src: "/heritage/legacy/l2.webp", title: "Grand Evening", caption: "Palace transformed for celebration" },
  { src: "/heritage/legacy/l3.webp", title: "Sunset Splendor", caption: "Dramatic dusk over the historic palace" },
  { src: "/heritage/legacy/l4.webp", title: "Morning Tea at the Kila", caption: "Peaceful tea with palace as backdrop" },
  { src: "/heritage/legacy/l5.webp", title: "Heritage Lounge", caption: "Regal interior with warm decor" },
];

const treasures = [
  { src: "/heritage/heritage/Container1.webp", title: "287 Years of Majesty", text: "Time stands still within these walls. Each stone breathes the story of generations past." },
  { src: "/heritage/heritage/Container2.webp", title: "The Monolithic Gate", text: "Carved from a single stone, the entrance tells tales of courage and the path of warriors and kings." },
  { src: "/heritage/heritage/Container3.webp", title: "The Sword of Lightning", text: "Vidyut Khand gleams with ancient power — forged by nature's fury, an emblem of unbroken spirit." },
  { src: "/heritage/heritage/Container4.webp", title: "A Royal Memory", text: "Echoes of history resonate through corridors. Memories breathe life into silent chambers." },
];

import { roomsApi } from "@/lib/api/rooms";

const essence = [
  { title: "Journey", sub: "The art of royal hospitality", text: "Discover the subtle rhythms of palace life through curated experiences.", img: "/heritage/Essence/c1.webp" },
  { title: "Moments", sub: "Traditions of silent elegance", text: "Every gesture carries the weight of generations, every interaction a living narrative.", img: "/heritage/Essence/c2.webp" },
  { title: "Stories", sub: "Whispers of heritage", text: "Experience the delicate balance between royal legacy and personal connection.", img: "/heritage/Essence/c3.webp" },
];

const discover = [
  { title: "Maihar Temple", sub: "Spiritual pilgrimage", text: "Sacred journey through centuries of devotion.", img: "/heritage/discover/s1.webp" },
  { title: "Bandhavgarh", sub: "Wildlife expedition", text: "Wilderness adventure in pristine natural landscapes.", img: "/heritage/discover/s2.webp" },
  { title: "Rural Heritage", sub: "Local traditions", text: "Authentic encounters with indigenous culture and craftsmanship.", img: "/heritage/discover/s3.webp" },
];

// Server Component — RevealWrapper is the only client boundary
export default async function HomePage() {
  let rooms: any[] = [];
  try {
    const res = await roomsApi.getRooms();
    if (res.success) {
      rooms = res.rooms.map((room, i) => ({
        id: room.id,
        tag: "Premium",
        n: String(i + 1).padStart(2, "0"),
        name: room.name,
        text: room.description || "Discover the charm of our heritage rooms.",
        img: room.images && room.images.length > 0 ? room.images[0] : null
      }));
    }
  } catch (error) {
    // Fallback static rooms if API fails on server
    rooms = [
      { tag: "Suite", n: "01", name: "Royal Suite", text: "Carved wooden panels frame ancient memories. Silk drapes tell stories of maharajas who once walked these floors.", img: "/heritage/rooms/1.webp" },
      { tag: "Deluxe", n: "02", name: "Courtyard Room", text: "Sunlight filters through centuries-old arches. Marble floors reflect the quiet dignity of generations past.", img: "/heritage/rooms/2.webp" },
      { tag: "Premium", n: "03", name: "Garden View Room", text: "Fragrant jasmine drifts through open windows. Verdant landscapes echo the palace's timeless beauty.", img: "/heritage/rooms/3.webp" },
      { tag: "Executive", n: "04", name: "Heritage Nook", text: "Small yet profound. Each corner holds a fragment of royal narrative, waiting to be discovered.", img: "/heritage/rooms/4.webp" },
    ];
  }

  // Cap at 4 rooms to match the original design intent
  const displayRooms = rooms.slice(0, 4);
  return (
    <RevealWrapper>
      <div className="overflow-hidden">
        {/* HERO */}
        <section className="relative h-screen min-h-[720px] flex items-center justify-center text-center text-parchment overflow-hidden">
          <HeroSlideshow />
          <div className="relative z-10 px-6 max-w-5xl">
            <p className="eyebrow text-[var(--gold)] animate-fade-up">Estd. 1738 · Madhya Pradesh</p>
            <Ornament className="mx-auto mt-6 w-44 text-[var(--gold)] animate-fade-up-delay-1" />
            <h1 className="text-display text-[clamp(3rem,8vw,7rem)] mt-6 leading-[0.95] text-parchment animate-fade-up-delay-1">
              Two centuries<br />
              <em className="not-italic gold-text">of royal heritage.</em>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl font-serif text-parchment/85 animate-fade-up-delay-2">
              Step into a living palace where history breathes and tradition welcomes you.
              An intimate glimpse into the royal life of Madhya Pradesh.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-fade-up-delay-3">
              <Link href="/reserve" className="px-10 py-4 bg-[var(--gold)] text-[var(--maroon-deep)] text-xs uppercase tracking-[0.36em] hover:bg-parchment transition-all duration-500 shadow-[var(--shadow-gold)]">
                Reserve Your Stay
              </Link>
              <Link href="/about" className="px-10 py-4 border border-parchment/40 text-parchment text-xs uppercase tracking-[0.36em] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-500">
                Discover the Heritage
              </Link>
            </div>
          </div>
        </section>

        {/* LEGACY */}
        <section className="relative py-32 px-6 lg:px-10 paper-grain overflow-hidden">
          <MoonPhases opacity={0.14} duration={70} count={9} size={56} />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <p className="eyebrow">Legacy</p>
              <h2 className="text-display text-5xl md:text-7xl mt-5 max-w-3xl mx-auto leading-[1.05]">
                A living legacy of <em className="gold-text not-italic">royal tradition</em>
              </h2>
              <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
              <p className="mt-8 max-w-2xl mx-auto font-serif text-lg text-muted-foreground">
                Two centuries of unbroken royal lineage. Experience the intimate world of a living palace where history breathes and tradition endures.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              {[
                { n: "200+", label: "Years of unbroken heritage" },
                { n: "04", label: "Exclusive heritage rooms" },
                { n: "01", label: "Royal family, hosting in person" },
              ].map((s) => (
                <div key={s.label} className="border border-[var(--gold)]/40 p-10 text-center bg-card/40 hover:bg-card transition-colors">
                  <div className="text-display text-6xl gold-text">{s.n}</div>
                  <div className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {legacyImages.map((img, i) => (
                <div key={img.src} className={`group relative overflow-hidden ${i === 0 ? "col-span-2 row-span-2 md:col-span-2 md:row-span-2" : ""}`}>
                  <div className={`relative ${i === 0 ? "aspect-square md:aspect-auto md:absolute md:inset-0" : "aspect-[4/5]"} overflow-hidden`}>
                    <img src={img.src} alt={img.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0.06_258/0.85)] via-transparent to-transparent opacity-90" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-parchment">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)]">{img.title}</p>
                      <p className="font-serif text-sm mt-1 opacity-90">{img.caption}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TREASURES */}
        <section className="relative py-20 md:py-24 px-6 lg:px-10 text-parchment paper-grain overflow-hidden" style={{ background: "var(--gradient-royal)" }}>
          <img src="/heritage/heritage/palace.svg" alt="" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-[0.05] select-none" />
          <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-25" style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 60%)" }} />
          <div className="mx-auto max-w-6xl relative">
            <div className="text-center mb-14 md:mb-16 reveal">
              <p className="eyebrow text-[var(--gold)]">Heritage</p>
              <h2 className="text-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.05]">Treasures of <em className="gold-text not-italic">the palace</em></h2>
              <Ornament className="mx-auto mt-6 w-32 text-[var(--gold)]" />
              <p className="mt-5 max-w-xl mx-auto font-serif text-base md:text-lg text-parchment/75 italic leading-relaxed">
                &quot;Stones speak. Centuries whisper their secrets in silent halls where kings once walked.&quot;
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {treasures.map((t, i) => (
                <article key={t.title} className="group reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="relative">
                    <div className="absolute -inset-1.5 border border-[var(--gold)]/50 group-hover:-inset-2.5 transition-all duration-500" />
                    <div className="absolute -inset-3 border border-[var(--gold)]/20 group-hover:-inset-4 transition-all duration-500" />
                    <div className="relative aspect-[3/4] arch-frame overflow-hidden shadow-[var(--shadow-royal)] shine-on-hover">
                      <img src={t.src} alt={t.title} className="w-full h-full object-cover transition-all duration-[1500ms] ease-out group-hover:scale-110" style={{ filter: "saturate(1.25) contrast(1.1) brightness(1.05)" }} loading="lazy" />
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-display text-2xl gold-text leading-none">{String(i + 1).padStart(2, "0")}</span>
                      <span className="h-px flex-1 bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
                    </div>
                    <h3 className="text-display text-xl md:text-2xl mt-3 text-parchment leading-tight">{t.title}</h3>
                    <p className="mt-2 font-serif text-sm md:text-[0.95rem] text-parchment/75 leading-relaxed">{t.text}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-14 text-center reveal"><Ornament className="mx-auto w-32 text-[var(--gold)] opacity-60" /></div>
          </div>
        </section>

        {/* ROOMS */}
        <section className="py-32 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <p className="eyebrow">Rooms</p>
              <h2 className="text-display text-5xl md:text-7xl mt-5 max-w-3xl mx-auto leading-[1.05]">
                Intimate spaces where <em className="gold-text not-italic">history whispers</em>
              </h2>
              <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
              <p className="mt-6 font-serif text-lg text-muted-foreground">Four rooms. One unbroken story of royal living.</p>
            </div>
            <div className="space-y-24">
              {displayRooms.map((r, i) => (
                <div key={r.name} className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <div className="relative group">
                    <div className="absolute -inset-4 border border-[var(--gold)]/40 group-hover:-inset-6 transition-all duration-700" />
                    <div className="relative aspect-[4/5] overflow-hidden bg-transparent flex items-center justify-center">
                      {r.img ? (
                        <img src={r.img} alt={r.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 group-hover:scale-105 transition-transform duration-1000 opacity-70">
                          <div className="w-20 h-20 rounded-full border border-[var(--gold)]/60 flex items-center justify-center">
                            <span className="text-[var(--gold)] text-display text-4xl">क</span>
                          </div>
                          <div className="leading-none text-center">
                            <div className="text-[var(--gold)] text-display text-3xl tracking-wide mb-2">KILA</div>
                            <div className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold)]/70">
                              The Heritage Palace
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-6 -left-6 text-display text-8xl gold-text opacity-90">{r.n}</div>
                  </div>
                  <div>
                    <p className="eyebrow">{r.tag}</p>
                    <h3 className="text-display text-4xl md:text-5xl mt-4 text-[var(--maroon)]">{r.name}</h3>
                    <Ornament className="mt-6 w-32 text-[var(--gold)]" />
                    <p className="mt-6 font-serif text-xl text-foreground/75 leading-relaxed">{r.text}</p>
                    <Link href={`/book/${r.id}`} className="inline-block mt-8 text-xs uppercase tracking-[0.32em] text-[var(--maroon)] border-b border-[var(--gold)] pb-1 hover:text-[var(--gold)]">
                      Reserve this chamber →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ESSENCE */}
        <section className="relative py-32 px-6 lg:px-10 bg-[oklch(0.92_0.025_80)] paper-grain overflow-hidden">
          <MoonPhases opacity={0.12} duration={90} count={10} size={48} direction="rtl" />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <p className="eyebrow">Essence</p>
              <h2 className="text-display text-5xl md:text-6xl mt-5 leading-tight">Royal living <em className="gold-text not-italic">experiences</em></h2>
              <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {essence.map((e) => (
                <div key={e.title} className="group bg-card border border-[var(--gold)]/30 overflow-hidden hover:shadow-[var(--shadow-royal)] transition-all duration-700">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={e.img} alt={e.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  </div>
                  <div className="p-8">
                    <p className="eyebrow">{e.title}</p>
                    <h3 className="text-display text-3xl mt-3 text-[var(--maroon)]">{e.sub}</h3>
                    <p className="mt-4 font-serif text-base text-muted-foreground leading-relaxed">{e.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DISCOVER */}
        <section className="py-32 px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-20">
              <p className="eyebrow">Discover</p>
              <h2 className="text-display text-5xl md:text-6xl mt-5 leading-tight">Explore <em className="gold-text not-italic">sacred landscapes</em></h2>
              <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {discover.map((d) => (
                <div key={d.title} className="group relative aspect-[3/4] overflow-hidden cursor-pointer">
                  <img src={d.img} alt={d.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.06_258/0.95)] via-[oklch(0.14_0.06_258/0.4)] to-transparent" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-parchment">
                    <p className="eyebrow text-[var(--gold)]">{d.sub}</p>
                    <h3 className="text-display text-3xl mt-2">{d.title}</h3>
                    <p className="mt-3 font-serif text-base text-parchment/85 max-h-0 group-hover:max-h-32 overflow-hidden transition-all duration-700">{d.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INCLUSIONS */}
        <section className="relative py-24 md:py-28 px-6 lg:px-10 text-parchment paper-grain overflow-hidden" style={{ background: "var(--gradient-royal)" }}>
          <div className="mx-auto max-w-6xl relative">
            <div className="text-center mb-16 reveal">
              <p className="eyebrow text-[var(--gold)]">Inclusions</p>
              <h2 className="text-display text-4xl md:text-5xl lg:text-6xl mt-4 leading-[1.05]">What awaits <em className="gold-text not-italic">your stay</em></h2>
              <Ornament className="mx-auto mt-6 w-32 text-[var(--gold)]" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: "01", title: "Royal Barbeque", text: "An open-fire feast under the stars — kebabs, marinated meats and garden vegetables grilled in the palace courtyard." },
                { n: "02", title: "Local Folk Songs", text: "Bundeli balladeers gather in the lantern-lit aangan, singing tales of valour and love passed down through generations." },
                { n: "03", title: "The Rai Dance", text: "Witness the swirling, spellbinding folk dance of Bundelkhand — performed by traditional artists in full regalia." },
              ].map((item, i) => (
                <article key={item.title} className="group reveal border border-[var(--gold)]/30 bg-[oklch(0.18_0.06_258/0.4)] backdrop-blur-sm p-8 hover:border-[var(--gold)] transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="text-[var(--gold)] flex items-center justify-between">
                    <span className="text-display text-3xl gold-text opacity-70">{item.n}</span>
                  </div>
                  <div className="mt-6 h-px bg-gradient-to-r from-[var(--gold)]/60 to-transparent" />
                  <h3 className="text-display text-2xl md:text-3xl mt-5 text-parchment">{item.title}</h3>
                  <p className="mt-3 font-serif text-parchment/75 leading-relaxed">{item.text}</p>
                </article>
              ))}
            </div>
            <div className="mt-14 text-center reveal">
              <Link href="/reserve" className="inline-block px-10 py-4 bg-[var(--gold)] text-[var(--maroon-deep)] text-xs uppercase tracking-[0.36em] hover:bg-parchment transition-all duration-500 shadow-[var(--shadow-gold)]">
                Reserve the Experience
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="relative py-32 px-6 lg:px-10 bg-[oklch(0.92_0.025_80)] paper-grain overflow-hidden">
          <MoonPhases opacity={0.12} duration={80} count={9} size={50} />
          <div className="relative mx-auto max-w-5xl text-center">
            <p className="eyebrow">Voices</p>
            <h2 className="text-display text-5xl md:text-6xl mt-5">Voice of our guests</h2>
            <Ornament className="mx-auto mt-8 w-40 text-[var(--gold)]" />
            <div className="mt-16 grid md:grid-cols-3 gap-8">
              {[
                { name: "Arjun", quote: "An unforgettable stay — truly a royal experience." },
                { name: "Priya", quote: "Beautiful rooms and outstanding hospitality." },
                { name: "Rahul", quote: "Felt like living in a palace. Loved every moment." },
              ].map((t) => (
                <figure key={t.name} className="bg-card p-10 border border-[var(--gold)]/30 text-left">
                  <div className="text-[var(--gold)] text-5xl font-display leading-none">&quot;</div>
                  <blockquote className="font-serif italic text-xl text-foreground/80 mt-4 leading-relaxed">{t.quote}</blockquote>
                  <figcaption className="mt-6 eyebrow">— {t.name}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </div>
    </RevealWrapper>
  );
}
