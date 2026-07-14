"use client";

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { RoomWatermark } from "@/components/site/RoomWatermark";
import { Ornament } from "@/components/site/Ornament";
import { roomsApi, Room, Combo } from "@/lib/api/rooms";
import { EnquiryModal } from "@/components/site/EnquiryModal";
import { RoomDetailsModal } from "@/components/site/RoomDetailsModal";
import { getComboPrice, getComboDiscountedPrice, getRoomPrice, formatPrice } from "@/lib/utils/pricing";

type Tab = "rooms" | "wedding" | "other";

const OTHER_OPTIONS = [
  { id: "homestay", title: "Homestay Experience", text: "Live as a guest of the royal household — meals with the family, evening tales by the courtyard fire.", img: "/heritage/Essence/c1.webp" },
  { id: "movie", title: "Movie / Film Shoot", text: "Use the palace, gates, courtyards and ramparts as your set. Crew lodging arranged on request.", img: "/heritage/legacy/l3.webp" },
  { id: "event", title: "Private Event / Retreat", text: "Curated palace buyouts for milestone birthdays, anniversaries and corporate retreats.", img: "/heritage/legacy/l2.webp" },
];

export default function ReserveClient() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get("tab") as Tab) || "rooms";
  
  const [tab, setTab] = useState<Tab>(initialTab);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryType, setEnquiryType] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const t = searchParams?.get("tab") as Tab;
    if (t && ["rooms", "wedding", "other"].includes(t)) {
      setTab(t);
      // scroll to tabs if needed, but for now just set it
    }
  }, [searchParams]);

  const openEnquiryModal = (type: string) => {
    setEnquiryType(type);
    setIsEnquiryModalOpen(true);
  };

  return (
    <div className={`pb-24 min-h-screen bg-gradient-to-b from-[oklch(0.96_0.022_85)] via-[oklch(0.93_0.04_70)] to-[oklch(0.95_0.03_80)] paper-grain ${hasSearched ? 'pt-8' : 'pt-28'}`}>
      {!hasSearched && (
        <div className="px-6 lg:px-10 mb-12 transition-all duration-500 opacity-100">
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
      )}

      <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-12">
        {tab === "rooms" && (
          <div role="tabpanel" aria-label="Rooms Tab Content">
            <h2 className="sr-only">Chambers and Suites Availability</h2>
            <RoomsList onSearchStateChange={setHasSearched} />
          </div>
        )}
        {tab === "wedding" && (
          <div role="tabpanel" aria-label="Wedding Shoots Tab Content">
            <h2 className="sr-only">Pre-Wedding & Wedding Shoot Packages</h2>
            <WeddingShoot openEnquiryModal={openEnquiryModal} />
          </div>
        )}
        {tab === "other" && (
          <div role="tabpanel" aria-label="Other Royal Packages Tab Content">
            <h2 className="sr-only">Experiential Royal Packages and Shoot Locations</h2>
            <OtherOptions openEnquiryModal={openEnquiryModal} />
          </div>
        )}
      </div>
      
      <EnquiryModal 
        isOpen={isEnquiryModalOpen} 
        onClose={() => setIsEnquiryModalOpen(false)} 
        enquiryType={enquiryType} 
      />
    </div>
  );
}

function RoomsList({ onSearchStateChange }: { onSearchStateChange?: (s: boolean) => void }) {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [requiredCapacity, setRequiredCapacity] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const [hasSearched, setHasSearched] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [roomsCount, setRoomsCount] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setMounted(true);
    roomsApi.getRooms().then(res => {
      if (isMounted && res.success) {
        setAllRooms(res.rooms);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setSelectedRooms([]);

    if (new Date(checkOut) <= new Date(checkIn)) {
      setError("Check-out date must be after check-in date");
      setLoading(false);
      return;
    }
    
    try {
      const response = await roomsApi.searchRooms({
        check_in: checkIn,
        check_out: checkOut,
        adults: adults,
        children_ages: childrenCount > 0 ? childAges.slice(0, childrenCount).join(",") : undefined,
        guests: adults + childrenCount,
        rooms: roomsCount,
      });
      if (response.success) {
        const foundRooms = response.rooms || [];
        const foundCombos = response.combos || [];
        
        setAllRooms(prev => prev.map(room => {
          const foundRoom = foundRooms.find(r => r.id === room.id);
          if (foundRoom) {
             return { ...room, ...foundRoom, available: foundRoom.available !== false };
          }
          return { ...room, available: false };
        }));

        setRooms(foundRooms);
        setCombos(foundCombos);
        setRequiredCapacity(response.required_capacity ?? 0);
        setHasSearched(true);
        setVisibleCount(3); // Reset to 3 on new search
        if (onSearchStateChange) onSearchStateChange(true);
      } else {
        setError("Failed to load rooms");
      }
    } catch (err: any) {
      setError(err.message || "Error loading rooms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-10 animate-fade-up">
        <div className="bg-card border border-[var(--gold)]/30 p-6 shadow-[var(--shadow-royal)] max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 md:flex md:flex-row gap-4 md:items-end">
            <div className="w-full md:flex-1 md:min-w-[140px]">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Check In</label>
              <input type="date" required value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full bg-background border border-[var(--gold)]/30 px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-colors" />
            </div>
            <div className="w-full md:flex-1 md:min-w-[140px]">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Check Out</label>
              <input type="date" required value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full bg-background border border-[var(--gold)]/30 px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-colors" />
            </div>
            <div className="w-full md:w-24">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Adults</label>
              <select value={adults} onChange={e => setAdults(parseInt(e.target.value))} className="w-full bg-background border border-[var(--gold)]/30 px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-colors appearance-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-24">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Children</label>
              <select value={childrenCount} onChange={e => {
                const count = parseInt(e.target.value);
                setChildrenCount(count);
                setChildAges(prev => {
                  if (count > prev.length) return [...prev, ...Array(count - prev.length).fill(0)];
                  return prev.slice(0, count);
                });
              }} className="w-full bg-background border border-[var(--gold)]/30 px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-colors appearance-none">
                {[0, 1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex justify-center md:block md:col-span-1 md:w-24">
              <div className="w-[calc(50%-0.5rem)] md:w-full">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Rooms</label>
                <select value={roomsCount} onChange={e => setRoomsCount(parseInt(e.target.value))} className="w-full bg-background border border-[var(--gold)]/30 px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-colors appearance-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {childrenCount > 0 && (
            <div className="w-full grid grid-cols-2 md:flex gap-4">
              {Array.from({ length: childrenCount }).map((_, i) => (
                <div key={i} className="w-full md:w-24">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Age {i + 1}</label>
                  <select 
                    value={childAges[i] || 0} 
                    onChange={e => {
                      const newAges = [...childAges];
                      newAges[i] = parseInt(e.target.value);
                      setChildAges(newAges);
                    }} 
                    className="w-full bg-background border border-[var(--gold)]/30 px-4 py-3 text-sm focus:border-[var(--gold)] outline-none transition-colors appearance-none"
                  >
                    <option value="0">&lt; 1</option>
                    {Array.from({ length: 15 }).map((_, age) => (
                      <option key={age + 1} value={age + 1}>{age + 1}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button type="submit" disabled={loading} className="w-full md:w-auto px-10 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors shadow-[var(--shadow-gold)] disabled:opacity-50">
              {loading ? "Searching..." : "Check Availability"}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="text-center py-10 text-[var(--maroon)]">{error}</div>
      )}

      {loading && !hasSearched && (
        <div className="text-center py-10 gold-text">Searching for available rooms...</div>
      )}



      {hasSearched && !loading && requiredCapacity > 0 && (
        <div className="mb-6 p-4 bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-center text-[var(--maroon)] text-sm font-medium">
          Required Capacity: {requiredCapacity} guests
        </div>
      )}

      {hasSearched && !loading && combos.filter(c => !c.room_ids || c.room_ids.every(id => { const r = allRooms.find(ar => ar.id === id); return r ? r.available !== false : true; })).length > 0 && (
        <div className="mb-10 space-y-6">
          <h3 className="text-display text-2xl text-[var(--maroon)] text-center">Recommended Combos</h3>
          {combos.filter(c => !c.room_ids || c.room_ids.every(id => { const r = allRooms.find(ar => ar.id === id); return r ? r.available !== false : true; })).map((c, i) => (
            <ComboCard key={c.combo_id || c.id || i} combo={c} checkIn={checkIn} checkOut={checkOut} adults={adults} childrenCount={childrenCount} childAges={childAges} />
          ))}
        </div>
      )}

      {allRooms.filter(r => r.available !== false).length > 0 && (
        <div className="space-y-6">
          <h3 className="text-display text-2xl text-[var(--maroon)] text-center mt-8">Individual Rooms</h3>
          {allRooms.filter(r => r.available !== false).slice(0, visibleCount).map((r) => (
            <RoomCard 
              key={r.id} 
              room={r} 
              onOpenDetails={() => setSelectedRoomId(r.id)} 
              checkIn={checkIn} 
              checkOut={checkOut} 
              adults={adults} 
              childrenCount={childrenCount} 
              childAges={childAges}
              roomsCount={roomsCount}
              isSelected={selectedRooms.includes(r.id)}
              onToggleSelect={() => {
                if (r.available === false || r.available === undefined) return;
                setSelectedRooms(prev => 
                  prev.includes(r.id) ? prev.filter(id => id !== r.id) : [...prev, r.id]
                );
              }}
            />
          ))}
          
          {/* Show More Button */}
          {allRooms.filter(r => r.available !== false).length > visibleCount && (
            <div className="flex justify-center mt-10">
              <button 
                onClick={() => setVisibleCount(prev => prev + 3)}
                className="px-8 py-3 border border-[var(--gold)] text-[var(--maroon)] text-xs uppercase tracking-[0.2em] hover:bg-[var(--gold)]/10 transition-colors"
              >
                Show More Rooms
              </button>
            </div>
          )}
          <RoomDetailsModal 
            isOpen={selectedRoomId !== null} 
            onClose={() => setSelectedRoomId(null)} 
            roomId={selectedRoomId} 
          />
        </div>
      )}

      {/* Floating Cart for Multiple Rooms */}
      {selectedRooms.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-[var(--gold)] p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-40 flex items-center justify-between px-6 lg:px-20 animate-fade-up">
          <div>
            <p className="text-[var(--maroon)] font-bold">{selectedRooms.length} Room{selectedRooms.length > 1 ? "s" : ""} Selected</p>
            <p className="text-xs text-muted-foreground">
              Total Capacity: {rooms.filter(r => selectedRooms.includes(r.id)).reduce((sum, r) => sum + r.capacity, 0)} guests
            </p>
          </div>
          <CheckoutButton 
            selectedRooms={selectedRooms} 
            checkIn={checkIn} 
            checkOut={checkOut} 
            adults={adults} 
            childrenCount={childrenCount} 
            childAges={childAges}
            totalCapacity={rooms.filter(r => selectedRooms.includes(r.id)).reduce((sum, r) => sum + r.capacity, 0)}
            requiredCapacity={requiredCapacity}
          />
        </div>
      )}
      </div>

    </>
  );
}

function CheckoutButton({ selectedRooms, checkIn, checkOut, adults, childrenCount, childAges, totalCapacity, requiredCapacity }: {
  selectedRooms: number[];
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  childAges: number[];
  totalCapacity: number;
  requiredCapacity: number;
}) {
  const queryParams = new URLSearchParams();
  if (checkIn) queryParams.append("checkIn", checkIn);
  if (checkOut) queryParams.append("checkOut", checkOut);
  if (adults) queryParams.append("adults", String(adults));
  if (childrenCount) queryParams.append("children", String(childrenCount));
  if (childAges) childAges.forEach((age: number) => queryParams.append("children_ages", String(age)));
  selectedRooms.forEach((id: number) => queryParams.append("rooms", String(id)));
  
  const bookUrl = `/book/checkout?${queryParams.toString()}`;
  const disabled = totalCapacity < requiredCapacity;

  return (
    <Link 
      href={disabled ? "#" : bookUrl} 
      className={`px-8 py-4 text-xs uppercase tracking-[0.3em] transition-colors shadow-[var(--shadow-gold)] ${disabled ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[var(--maroon)] text-parchment hover:bg-[var(--maroon-deep)]'}`}
      onClick={(e) => {
         if (disabled) {
           e.preventDefault();
           alert(`Please select rooms that accommodate at least ${requiredCapacity} guests.`);
         }
      }}
    >
      Proceed to Checkout →
    </Link>
  );
}

function ComboCard({ combo, checkIn, checkOut, adults, childrenCount, childAges }: {
  combo: Combo;
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  childAges: number[];
}) {
  const queryParams = new URLSearchParams();
  if (checkIn) queryParams.append("checkIn", checkIn);
  if (checkOut) queryParams.append("checkOut", checkOut);
  if (adults) queryParams.append("adults", String(adults));
  if (childrenCount) queryParams.append("children", String(childrenCount));
  if (childAges) childAges.forEach((age: number) => queryParams.append("children_ages", String(age)));
  if (combo.room_ids) {
    combo.room_ids.forEach((id: number) => queryParams.append("rooms", String(id)));
  }
  const bookUrl = `/book/checkout?${queryParams.toString()}`;

  const totalPrice = getComboPrice(combo);
  const discountedPrice = getComboDiscountedPrice(combo);

  return (
    <article className="group bg-[oklch(0.97_0.03_85)] border border-[var(--gold)] hover:shadow-[var(--shadow-royal)] transition-all duration-500 overflow-hidden">
      <div className="grid lg:grid-cols-[300px_1fr_250px] gap-0">
        <div className="aspect-[4/3] lg:aspect-auto lg:h-full overflow-hidden bg-parchment flex items-center justify-center">
          <img src={combo.images?.[0] || "/logo (1).svg"} alt={combo.name} className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${!combo.images?.[0] ? "object-contain p-8 opacity-60" : "object-cover"}`} />
        </div>
        <div className="p-6">
          <h3 className="text-display text-2xl text-[var(--maroon)] leading-tight">{combo.name}</h3>
          <p className="mt-3 font-serif text-sm text-foreground/80">{combo.description}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-serif text-muted-foreground">
            <span className="bg-white/50 px-2 py-1 border border-[var(--gold)]/30">{combo.room_ids?.length || 0} Rooms</span>
            <span className="bg-white/50 px-2 py-1 border border-[var(--gold)]/30">Capacity: {combo.total_capacity} Guests</span>
          </div>
        </div>
        <div className="p-6 bg-[oklch(0.95_0.03_80)] flex flex-col justify-center items-center text-center border-t lg:border-t-0 lg:border-l border-[var(--gold)]/30">
          {discountedPrice !== null ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-through opacity-70">{formatPrice(totalPrice)}</p>
              <div className="mt-1 text-display text-4xl gold-text leading-none">{formatPrice(discountedPrice)}</div>
            </>
          ) : (
            <div className="mt-1 text-display text-4xl gold-text leading-none">{formatPrice(totalPrice)}</div>
          )}
          <p className="text-[11px] text-muted-foreground mt-2 mb-4">per night · taxes extra</p>
          <Link href={bookUrl} className="w-full text-center px-6 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors">
            Book Combo
          </Link>
        </div>
      </div>
    </article>
  );
}

function RoomCard({ room, onOpenDetails, checkIn, checkOut, adults, childrenCount, childAges, roomsCount, isSelected, onToggleSelect }: {
  room: Room;
  onOpenDetails: () => void;
  checkIn: string;
  checkOut: string;
  adults: number;
  childrenCount: number;
  childAges: number[];
  roomsCount: number;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);

  const images: string[] = room.images && room.images.length > 0 ? room.images : [];

  const queryParams = new URLSearchParams();
  if (checkIn) queryParams.append("checkIn", checkIn);
  if (checkOut) queryParams.append("checkOut", checkOut);
  if (adults) queryParams.append("adults", String(adults));
  if (roomsCount > 1) queryParams.append("roomsCount", String(roomsCount));
  if (childrenCount) queryParams.append("children", String(childrenCount));
  if (childAges) childAges.forEach((age: number) => queryParams.append("children_ages", String(age)));
  
  // Single room direct checkout url
  const bookUrl = `/book/${room.id}?${queryParams.toString()}`;

  const price = getRoomPrice(room);

  return (
    <article className={`group bg-card border transition-all duration-500 overflow-hidden ${isSelected ? 'border-[var(--maroon)] shadow-[0_0_15px_rgba(95,24,31,0.2)]' : 'border-[var(--gold)]/30 hover:border-[var(--gold)] hover:shadow-[var(--shadow-royal)]'}`}>
      <div className="grid lg:grid-cols-[420px_1fr_280px] gap-0">
        <div className="relative bg-parchment cursor-pointer" onClick={onToggleSelect}>
          <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[imgIdx]} alt={room.name} className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.06_258/0.5)] via-transparent to-transparent" />
                <div className="absolute top-4 right-4 px-2.5 py-1 bg-[oklch(0.14_0.06_258/0.7)] text-parchment text-[10px] tracking-[0.2em]">{imgIdx + 1} / {images.length}</div>
                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx - 1 + images.length) % images.length) }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Previous image">‹</button>
                    <button onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % images.length) }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Next image">›</button>
                  </>
                )}
              </>
            ) : (
              <RoomWatermark />
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--gold)] text-[var(--maroon-deep)] text-[10px] uppercase tracking-[0.25em] font-medium z-10">Premium</div>
            {isSelected && (
              <div className="absolute top-4 left-24 px-3 py-1 bg-[var(--maroon)] text-parchment text-[10px] uppercase tracking-[0.25em] font-medium z-10 flex items-center gap-1">
                <Check /> Selected
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-1 p-2 bg-[var(--maroon-deep)]">
              {images.map((src: string, i: number) => (
                <button key={src + i} onClick={(e) => { e.stopPropagation(); setImgIdx(i) }} className={`flex-1 aspect-video overflow-hidden border-2 transition-all ${imgIdx === i ? "border-[var(--gold)] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8 border-l-0 lg:border-l border-[var(--gold)]/20 cursor-pointer" onClick={onToggleSelect}>
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
              {(room.features || []).map((a: string) => (
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
          {room.discount > 0 && price !== null ? (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-through opacity-70">{formatPrice(Math.round(price * (1 + room.discount/100)))}</p>
          ) : price !== null ? (
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground line-through opacity-70">{formatPrice(Math.round(price * 1.25))}</p>
          ) : null}
          <div className="mt-1 text-display text-5xl gold-text leading-none">{formatPrice(price)}</div>
          <p className="text-[11px] text-muted-foreground mt-2">per night · taxes extra</p>
          {room.available === true && (
            <div className="mt-6 px-3 py-2 bg-[oklch(0.45_0.13_150/0.12)] text-[oklch(0.35_0.13_150)] text-[10px] uppercase tracking-[0.2em] border border-[oklch(0.45_0.13_150/0.3)]">✓ Available</div>
          )}
          {room.available === false && (
            <div className="mt-6 px-3 py-2 bg-red-950/10 text-red-800 text-[10px] uppercase tracking-[0.2em] border border-red-900/20">✕ Sold Out</div>
          )}
          {room.available === undefined && (
            <div className="mt-6 px-3 py-2 bg-[var(--gold)]/10 text-[var(--maroon-deep)] text-[10px] uppercase tracking-[0.2em] border border-[var(--gold)]/30">Select dates to check</div>
          )}
          
          <button 
            disabled={room.available === false || room.available === undefined}
            onClick={onToggleSelect} 
            className={`mt-5 w-full text-center px-6 py-3 text-xs uppercase tracking-[0.3em] transition-colors shadow-[var(--shadow-gold)] ${
              room.available === false 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none border-none' 
                : room.available === undefined
                ? 'bg-[var(--gold)]/20 text-[var(--maroon)] cursor-not-allowed shadow-none'
                : isSelected 
                ? 'bg-white border border-[var(--maroon)] text-[var(--maroon)]' 
                : 'bg-[var(--maroon)] text-parchment hover:bg-[var(--maroon-deep)]'
            }`}
          >
            {room.available === false ? 'Sold Out' : room.available === undefined ? 'Search to Book' : isSelected ? 'Unselect' : 'Select'}
          </button>
          
          {room.available !== false && room.available !== undefined && (
            <Link href={bookUrl} className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[var(--maroon)] hover:text-[var(--gold)] transition-colors underline underline-offset-4">
              Book Only This
            </Link>
          )}
          
          <button onClick={onOpenDetails} className="mt-4 text-[11px] uppercase tracking-[0.28em] text-[var(--gold)] hover:text-[var(--maroon)] transition-colors">View details</button>
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
