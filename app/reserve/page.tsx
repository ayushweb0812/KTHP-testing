"use client";

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useState, useEffect } from "react";
import { RoomWatermark } from "@/components/site/RoomWatermark";
import { Ornament } from "@/components/site/Ornament";
import { roomsApi, Room } from "@/lib/api/rooms";
import { EnquiryModal } from "@/components/site/EnquiryModal";
import { RoomDetailsModal } from "@/components/site/RoomDetailsModal";

type Tab = "rooms" | "wedding" | "other";



const OTHER_OPTIONS = [
  { id: "homestay", title: "Homestay Experience", text: "Live as a guest of the royal household — meals with the family, evening tales by the courtyard fire.", img: "/heritage/Essence/c1.webp" },
  { id: "movie", title: "Movie / Film Shoot", text: "Use the palace, gates, courtyards and ramparts as your set. Crew lodging arranged on request.", img: "/heritage/legacy/l3.webp" },
  { id: "event", title: "Private Event / Retreat", text: "Curated palace buyouts for milestone birthdays, anniversaries and corporate retreats.", img: "/heritage/legacy/l2.webp" },
];

export default function ReservePage() {
  const [tab, setTab] = useState<Tab>("rooms");
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState("");

  const openEnquiryModal = (type: string) => {
    setEnquiryType(type);
    setIsEnquiryModalOpen(true);
  };

  return (
    <div className="pt-28 pb-24 min-h-screen bg-gradient-to-b from-[oklch(0.96_0.022_85)] via-[oklch(0.93_0.04_70)] to-[oklch(0.95_0.03_80)] paper-grain">
      <div className="px-6 lg:px-10">
        <div className="mx-auto max-w-7xl text-center">
          <p className="eyebrow text-[var(--maroon)]">Reservation</p>
          <h1 className="text-display text-5xl md:text-6xl mt-4 leading-[1.05]">
            Begin your <em className="gold-text not-italic">royal sojourn</em>
          </h1>
          <Ornament className="mx-auto mt-6 w-40 text-[var(--gold)]" />
        </div>

        <div className="mx-auto max-w-3xl mt-10">
          <div className="grid grid-cols-3 gap-0 border border-[var(--gold)]/40 bg-card/70 backdrop-blur-sm p-1 rounded-sm shadow-[var(--shadow-royal)]">
            {([
              { id: "rooms", label: "Rooms" },
              { id: "wedding", label: "Wedding Shoot" },
              { id: "other", label: "Other Options" },
            ] as { id: Tab; label: string }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`py-3 text-xs uppercase tracking-[0.28em] transition-all duration-300 ${
                  tab === t.id
                    ? "bg-[var(--maroon)] text-parchment shadow-[var(--shadow-gold)]"
                    : "text-[var(--maroon)]/70 hover:text-[var(--maroon)] hover:bg-[var(--gold)]/10"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-12">
        {tab === "rooms" && <RoomsList />}
        {tab === "wedding" && <WeddingShoot openEnquiryModal={openEnquiryModal} />}
        {tab === "other" && <OtherOptions openEnquiryModal={openEnquiryModal} />}
      </div>
      
      <EnquiryModal 
        isOpen={isEnquiryModalOpen} 
        onClose={() => setIsEnquiryModalOpen(false)} 
        enquiryType={enquiryType} 
      />
    </div>
  );
}

function RoomsList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  useEffect(() => {
    async function loadRooms() {
      try {
        const response = await roomsApi.getRooms();
        if (response.success) {
          setRooms(response.rooms);
        } else {
          setError("Failed to load rooms");
        }
      } catch (err) {
        setError("Error loading rooms");
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  if (loading) {
    return <div className="text-center py-10 gold-text">Loading rooms...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-[var(--maroon)]">{error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {rooms.map((r) => (
        <RoomCard key={r.id} room={r} onOpenDetails={() => setSelectedRoomId(r.id)} />
      ))}
      <RoomDetailsModal 
        isOpen={selectedRoomId !== null} 
        onClose={() => setSelectedRoomId(null)} 
        roomId={selectedRoomId} 
      />
    </div>
  );
}

function RoomCard({ room, onOpenDetails }: { room: Room; onOpenDetails: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);

  const images = room.images && room.images.length > 0 ? room.images : [];

  return (
    <article className="group bg-card border border-[var(--gold)]/30 hover:border-[var(--gold)] hover:shadow-[var(--shadow-royal)] transition-all duration-500 overflow-hidden">
      <div className="grid lg:grid-cols-[420px_1fr_280px] gap-0">
        <div className="relative bg-parchment">
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[imgIdx]} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.06_258/0.5)] via-transparent to-transparent" />
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-[oklch(0.14_0.06_258/0.7)] text-parchment text-[10px] tracking-[0.2em]">{imgIdx + 1} / {images.length}</div>
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx((imgIdx - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Previous image">‹</button>
                    <button onClick={() => setImgIdx((imgIdx + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Next image">›</button>
                  </>
                )}
              </>
            ) : (
              <RoomWatermark />
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--gold)] text-[var(--maroon-deep)] text-[10px] uppercase tracking-[0.25em] font-medium z-10">Premium</div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-1 p-2 bg-[var(--maroon-deep)]">
              {images.map((src, i) => (
                <button key={src + i} onClick={() => setImgIdx(i)} className={`flex-1 aspect-video overflow-hidden border-2 transition-all ${imgIdx === i ? "border-[var(--gold)] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8 border-l-0 lg:border-l border-[var(--gold)]/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-display text-3xl text-[var(--maroon)] leading-tight">{room.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="bg-[oklch(0.45_0.13_150)] text-parchment text-xs px-2 py-0.5 font-medium flex items-center gap-1">★ {room.rating || 5.0}</span>
                <span className="text-xs text-muted-foreground">({room.reviews || 0} reviews)</span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-serif text-foreground/80">
            {room.description && <span className="flex items-center gap-2"><Dot /> {room.description}</span>}
            <span className="flex items-center gap-2"><Dot /> {room.bed_type}</span>
            <span className="flex items-center gap-2"><Dot /> Sleeps {room.capacity}</span>
          </div>
          <div className="mt-5 h-px bg-gradient-to-r from-[var(--gold)]/40 via-[var(--gold)]/20 to-transparent" />
          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--maroon)] mb-3">Amenities</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(room.features || []).map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm font-serif text-foreground/80"><Check /> {a}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Free cancellation", "Pay at hotel", "Breakfast included"].map((b) => (
              <span key={b} className="text-[10px] uppercase tracking-[0.22em] px-3 py-1 bg-[oklch(0.45_0.13_150/0.12)] text-[oklch(0.35_0.13_150)] border border-[oklch(0.45_0.13_150/0.3)]">✓ {b}</span>
            ))}
          </div>
        </div>

        <div className="p-6 lg:p-8 bg-gradient-to-br from-[oklch(0.97_0.03_85)] to-[oklch(0.93_0.05_70)] border-t lg:border-t-0 lg:border-l border-[var(--gold)]/30 flex flex-col justify-center text-center lg:text-right">
          {room.discount > 0 ? (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-through opacity-70">₹{Math.round(room.price * (1 + room.discount/100)).toLocaleString()}</p>
          ) : (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-through opacity-70">₹{Math.round(room.price * 1.25).toLocaleString()}</p>
          )}
          <div className="mt-1 text-display text-5xl gold-text leading-none">₹{room.price.toLocaleString()}</div>
          <p className="text-[11px] text-muted-foreground mt-2">per night · taxes extra</p>
          <div className="mt-6 px-3 py-2 bg-[oklch(0.45_0.13_150/0.12)] text-[oklch(0.32_0.13_150)] text-[10px] uppercase tracking-[0.2em]">✓ {room.available !== false ? "Available" : "Check availability"}</div>
          <Link href={`/book/${room.id}`} className="mt-5 px-6 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors shadow-[var(--shadow-gold)]">
            Reserve →
          </Link>
          <button onClick={onOpenDetails} className="mt-2 text-[11px] uppercase tracking-[0.28em] text-[var(--gold)] hover:text-[var(--maroon)] transition-colors">View details</button>
        </div>
      </div>
    </article>
  );
}

function Dot() { return <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]" />; }
function Check() { return <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[oklch(0.5_0.13_150)] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L20 7" /></svg>; }

function WeddingShoot({ openEnquiryModal }: { openEnquiryModal: (type: string) => void }) {
  const packages = [
    { name: "Half Day", hours: "4 hours", price: "On request", includes: ["1 indoor + 1 outdoor location", "Crew of up to 6", "Use of palace courtyard", "Refreshments"], tag: "Intimate" },
    { name: "Full Day", hours: "10 hours", price: "On request", includes: ["All palace exteriors", "3 styled interiors", "Crew of up to 12", "Lunch + refreshments", "Dedicated host"], tag: "Most popular", featured: true },
    { name: "Two Day Royal", hours: "2 full days", price: "On request", includes: ["Full palace access", "Overnight royal suite", "Vintage props styling", "Crew of up to 20", "All meals + tea service"], tag: "Signature" },
  ];

  return (
    <div className="animate-fade-up">
      <div className="grid md:grid-cols-3 gap-3 mb-12">
        {["/heritage/legacy/l3.webp", "/heritage/legacy/l2.webp", "/heritage/legacy/l5.webp"].map((src, i) => (
          <div key={src} className={`group relative overflow-hidden ${i === 0 ? "md:row-span-2 md:col-span-2" : ""}`}>
            <div className={`relative w-full h-full ${i === 0 ? "aspect-[4/3] md:aspect-auto md:absolute md:inset-0" : "aspect-[3/2]"}`}>
              <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.06_258/0.5)] to-transparent" />
              {i === 0 && (
                <div className="absolute bottom-6 left-6 text-parchment">
                  <p className="eyebrow text-[var(--gold)]">Pre-Wedding · Wedding · Post-Wedding</p>
                  <h2 className="text-display text-4xl md:text-5xl mt-2">Royal backdrops for your story</h2>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {packages.map((p) => (
          <article key={p.name} className={`relative bg-card border p-8 transition-all duration-500 ${p.featured ? "border-[var(--gold)] shadow-[var(--shadow-royal)] md:-translate-y-3 bg-gradient-to-br from-card to-[oklch(0.97_0.05_75)]" : "border-[var(--gold)]/30 hover:border-[var(--gold)]/70"}`}>
            {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--gold)] text-[var(--maroon-deep)] text-[10px] uppercase tracking-[0.28em]">{p.tag}</div>}
            {!p.featured && <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)]">{p.tag}</p>}
            <h3 className="text-display text-3xl text-[var(--maroon)] mt-3">{p.name}</h3>
            <p className="font-serif text-muted-foreground text-sm mt-1">{p.hours}</p>
            <div className="mt-6 text-display text-4xl gold-text">{p.price}</div>
            <Ornament className="mt-6 w-24 text-[var(--gold)]" />
            <ul className="mt-6 space-y-3">
              {p.includes.map((x) => (
                <li key={x} className="flex items-start gap-3 font-serif text-foreground/80"><Check /> {x}</li>
              ))}
            </ul>
            <button onClick={() => openEnquiryModal(p.name)} className={`mt-8 block w-full text-center px-6 py-3 text-xs uppercase tracking-[0.3em] transition-colors ${p.featured ? "bg-[var(--maroon)] text-parchment hover:bg-[var(--maroon-deep)]" : "border border-[var(--maroon)] text-[var(--maroon)] hover:bg-[var(--maroon)] hover:text-parchment"}`}>Enquire</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function OtherOptions({ openEnquiryModal }: { openEnquiryModal: (type: string) => void }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 animate-fade-up">
      {OTHER_OPTIONS.map((o) => (
        <article key={o.id} className="group bg-card border border-[var(--gold)]/30 overflow-hidden hover:shadow-[var(--shadow-royal)] hover:border-[var(--gold)] transition-all duration-500">
          <div className="aspect-[4/3] overflow-hidden">
            <img src={o.img} alt={o.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="p-6">
            <h3 className="text-display text-2xl text-[var(--maroon)]">{o.title}</h3>
            <Ornament className="mt-4 w-20 text-[var(--gold)]" />
            <p className="mt-4 font-serif text-foreground/75 leading-relaxed">{o.text}</p>
            <button onClick={() => openEnquiryModal(o.title)} className="inline-block mt-6 text-xs uppercase tracking-[0.3em] text-[var(--maroon)] border-b border-[var(--gold)] pb-1 hover:text-[var(--gold)]">Send enquiry →</button>
          </div>
        </article>
      ))}
    </div>
  );
}
