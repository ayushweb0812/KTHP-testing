"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { invoicesApi } from '@/lib/api/invoices';
import { roomsApi, Room } from '@/lib/api/rooms';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

type Tab = 'Active' | 'Confirmed' | 'Cancelled';

/* ─── Booking Detail Modal ─────────────────────────────────── */
function BookingDetailModal({
  booking,
  room,
  onClose,
  onDownloadInvoice,
  isDownloading,
}: {
  booking: Booking;
  room?: Room;
  onClose: () => void;
  onDownloadInvoice: (id: number) => void;
  isDownloading: boolean;
}) {
  const isPaid = booking.payment_status === 'paid' || booking.status === 'paid';
  const roomName = room?.name || "Heritage Chamber";
  const roomImage = room?.images?.[0];

  const nights = (() => {
    const a = new Date(booking.check_in_date);
    const b = new Date(booking.check_out_date);
    return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / 86400000));
  })();

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose} 
      />
      <div className="relative bg-[var(--card)] border border-[var(--gold)]/30 shadow-[var(--shadow-royal)] w-full max-w-4xl max-h-[90vh] rounded-sm flex flex-col animate-fade-up">
        
        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin flex flex-col" data-lenis-prevent="true">
          
          {/* Header */}
          <div className="relative shrink-0">
            {roomImage ? (
              <div className="aspect-[21/9] overflow-hidden">
                <img src={roomImage} alt={roomName} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--maroon-deep)]/85 via-[var(--maroon-deep)]/30 to-transparent" />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-r from-[var(--maroon-deep)] to-[var(--maroon)]" />
            )}
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--gold)] mb-1">Booking #{booking.id}</p>
            <h2 className="text-display text-2xl text-parchment capitalize leading-tight">{roomName}</h2>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status badge */}
        <div className="px-6 py-3 border-b border-[var(--gold)]/15 flex items-center justify-between">
          <span className={`text-[10px] uppercase tracking-[0.28em] px-3 py-1 border ${
            isPaid
              ? "border-green-500/40 bg-green-50 text-green-700"
              : booking.status === "cancelled"
              ? "border-red-400/40 bg-red-50 text-red-600"
              : "border-[var(--gold)]/40 bg-[var(--gold)]/8 text-[var(--maroon)]"
          }`}>
            {isPaid ? "Confirmed" : booking.status === "cancelled" ? "Cancelled" : "Pending Payment"}
          </span>
          <span className="text-xs text-muted-foreground font-serif">
            Booked {fmt(booking.created_at)}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="p-6 space-y-5">
          {/* Stay dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 p-3 bg-[var(--gold)]/6 border border-[var(--gold)]/20 text-center">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Check-in</p>
              <p className="text-sm font-medium text-[var(--maroon)]">{fmt(booking.check_in_date)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{booking.check_in_time?.slice(0,5) || "11:00"}</p>
            </div>
            <div className="col-span-1 p-3 bg-[var(--gold)]/4 border border-[var(--gold)]/15 text-center flex flex-col items-center justify-center">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Duration</p>
              <p className="text-display text-xl gold-text">{nights}</p>
              <p className="text-[10px] text-muted-foreground">night{nights !== 1 ? "s" : ""}</p>
            </div>
            <div className="col-span-1 p-3 bg-[var(--gold)]/6 border border-[var(--gold)]/20 text-center">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">Check-out</p>
              <p className="text-sm font-medium text-[var(--maroon)]">{fmt(booking.check_out_date)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{booking.check_out_time?.slice(0,5) || "10:00"}</p>
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--gold)]/15">
            <svg className="w-4 h-4 text-[var(--gold)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="text-sm font-serif text-foreground">
              {booking.number_of_adults} Adult{booking.number_of_adults > 1 ? "s" : ""}
              {booking.number_of_children > 0 ? `, ${booking.number_of_children} Child${booking.number_of_children > 1 ? "ren" : ""}` : ""}
            </div>
          </div>

          {/* Guests list */}
          {booking.guests && booking.guests.length > 0 && (
            <div>
              <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--gold)] mb-2">Guest Details</p>
              <div className="space-y-2">
                {booking.guests.map((g, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-serif py-2 border-b border-[var(--gold)]/10 last:border-0">
                    <span className="text-foreground">
                      {g.first_name} {g.last_name}
                      {g.is_primary && <span className="ml-2 text-[9px] uppercase tracking-widest text-[var(--gold)]">Primary</span>}
                    </span>
                    <span className="text-muted-foreground">{g.email || g.phone || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div>
            <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--gold)] mb-2">Price Breakdown</p>
            <div className="space-y-1.5 text-sm font-serif">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base price</span>
                <span>₹{booking.base_price?.toLocaleString() ?? "—"}</span>
              </div>
              {booking.service_charges > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service charges</span>
                  <span>₹{booking.service_charges.toLocaleString()}</span>
                </div>
              )}
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-[oklch(0.45_0.13_150)]">
                  <span>Discount{booking.coupon_code ? ` (${booking.coupon_code})` : ""}</span>
                  <span>−₹{booking.discount_amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-[var(--gold)]/20 font-medium">
                <span className="text-xs uppercase tracking-widest text-[var(--maroon)]">Total</span>
                <span className="text-display text-xl gold-text">₹{booking.total_price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer actions — outside scroll */}
        <div className="px-6 pb-6 pt-4 border-t border-[var(--gold)]/15 flex gap-3 bg-[var(--card)] shrink-0">
          {!isPaid && booking.status !== "cancelled" && (
            <Link
              href={`/payment/${booking.id}`}
              className="flex-1 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.28em] text-center hover:bg-[var(--maroon-deep)] transition-colors shadow-[var(--shadow-gold)]"
              onClick={onClose}
            >
              Pay Now →
            </Link>
          )}
          {isPaid && (
            <button
              onClick={() => onDownloadInvoice(booking.id)}
              disabled={isDownloading}
              className="flex-1 py-3 border border-[var(--gold)] text-[var(--maroon)] text-xs uppercase tracking-[0.28em] hover:bg-[var(--gold)]/10 transition-colors disabled:opacity-50"
            >
              {isDownloading ? "Downloading..." : "Download Invoice"}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-3 border border-[var(--gold)]/30 text-muted-foreground text-xs uppercase tracking-[0.28em] hover:border-[var(--gold)]/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');

  const [recentlyPaidIds, setRecentlyPaidIds] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState<Record<number, boolean>>({});
  const [rooms, setRooms] = useState<Record<number, Room>>({});

  // Modal state
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      bookingsApi.getMyBookings(),
      roomsApi.getRooms().catch(() => ({ success: false, rooms: [] as Room[] }))
    ])
      .then(([bRes, rRes]) => {
        if (mounted) {
          if (bRes.success) setBookings(bRes.bookings || []);
          if (rRes.success && rRes.rooms) {
            const roomMap: Record<number, Room> = {};
            rRes.rooms.forEach(r => roomMap[r.id] = r);
            setRooms(roomMap);
          }
          setLoadingBookings(false);
        }
      })
      .catch(() => {
        if (mounted) setLoadingBookings(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleDownloadInvoice = async (bookingId: number) => {
    setIsDownloading(prev => ({ ...prev, [bookingId]: true }));
    setError('');
    try {
      let invoiceId: number | undefined;
      let invoiceNumber = `Kila_Invoice_${bookingId}`;

      try {
        const invoiceData = await invoicesApi.getInvoiceByBooking(bookingId);
        if (invoiceData.success && invoiceData.invoice) {
          invoiceId = invoiceData.invoice.invoice?.id ?? (invoiceData.invoice as any).id;
          invoiceNumber = invoiceData.invoice.invoice?.invoice_number ?? (invoiceData.invoice as any).invoice_number ?? invoiceNumber;
        }
      } catch (lookupErr: any) {
        if (lookupErr?.status !== 404) {
          console.warn('[Invoice] Lookup failed (non-404):', lookupErr);
        }
      }

      if (!invoiceId) {
        const genData = await invoicesApi.generateInvoice(bookingId);
        if (genData.success && genData.invoice_id) {
          invoiceId = genData.invoice_id;
          invoiceNumber = genData.invoice_number || invoiceNumber;
        } else {
          throw new Error(genData.message || 'Could not generate invoice');
        }
      }

      try {
        await invoicesApi.downloadInvoice(invoiceId, invoiceNumber);
      } catch (downloadErr: any) {
        if (downloadErr.message?.toLowerCase().includes('not found')) {
          console.warn('[Invoice] PDF missing on server. Attempting to regenerate...');
          await invoicesApi.generateInvoice(bookingId);
          await invoicesApi.downloadInvoice(invoiceId, invoiceNumber);
        } else {
          throw downloadErr;
        }
      }
    } catch (err: any) {
      console.error('[Invoice] Download Error:', err);
      setError(err.message || 'Failed to download invoice.');
    } finally {
      setIsDownloading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const filteredBookings = bookings.filter(b => {
    const isPaid = b.payment_status === 'paid' || b.status === 'paid' || recentlyPaidIds.includes(b.id);
    if (activeTab === 'Active') return !isPaid && b.status !== 'cancelled';
    if (activeTab === 'Confirmed') return isPaid && b.status !== 'cancelled';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <>
      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          room={rooms[detailBooking.room_id]}
          onClose={() => setDetailBooking(null)}
          onDownloadInvoice={handleDownloadInvoice}
          isDownloading={!!isDownloading[detailBooking.id]}
        />
      )}
      <div className="animate-fade-up">

      <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--gold)]/20 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[var(--foreground)]">Active Reservations</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">View &amp; manage your current bookings here</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 md:px-10 pt-4 mb-4 flex gap-8 border-b border-[color-mix(in_oklab,var(--gold)_15%,transparent)]">
        {(['Active', 'Confirmed', 'Cancelled'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-[var(--maroon)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--maroon)] rounded-t" />
            )}
          </button>
        ))}
      </div>

      <div className="p-8 md:p-10 pt-2">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm text-center">
            {error}
          </div>
        )}

        {loadingBookings ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--gold)]/40 rounded-lg">
            <p className="text-[var(--muted-foreground)] mb-4">You have no {activeTab.toLowerCase()} stays.</p>
            {activeTab === 'Active' && (
              <Link href="/reserve" className="inline-block px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] transition-all rounded shadow-md">
                Book a Chamber
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredBookings.map((booking) => {
              const isPaid = booking.payment_status === 'paid' || booking.status === 'paid' || recentlyPaidIds.includes(booking.id);
              const room = rooms[booking.room_id];
              const roomName = room?.name || "Heritage Chamber";
              const roomImage = room?.images?.[0];

              return (
                <div
                  key={booking.id}
                  className="border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] hover:border-[var(--gold)]/60 hover:shadow-[var(--shadow-soft)] rounded-xl overflow-hidden flex flex-col md:flex-row bg-[var(--background)]/50 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="w-full md:w-48 h-36 md:h-auto shrink-0 bg-[var(--card)] flex flex-col items-center justify-center border-r border-[color-mix(in_oklab,var(--gold)_15%,transparent)] overflow-hidden">
                    {roomImage ? (
                      <img src={roomImage} alt={roomName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center opacity-70">
                        <div className="w-12 h-12 rounded-full border border-[var(--gold)]/60 flex items-center justify-center mb-2">
                          <span className="text-[var(--gold)] font-display text-2xl">क</span>
                        </div>
                        <div className="text-[var(--gold)] font-display text-sm tracking-[0.2em] uppercase">Kila</div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-serif text-[var(--foreground)] capitalize">{roomName}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">Kila the heritage palace</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs border ${isPaid ? 'border-green-500 text-green-600' : booking.status === 'cancelled' ? 'border-red-400 text-red-500' : 'border-[var(--accent)] text-[var(--accent)]'}`}>
                          {isPaid ? 'Confirmed' : booking.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">ID {booking.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-1.5 text-xs text-[var(--foreground)]">
                      <div className="flex gap-1.5">
                        <span className="text-[var(--muted-foreground)]">Check in :</span>
                        <span>{booking.check_in_date}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[var(--muted-foreground)]">Check out :</span>
                        <span>{booking.check_out_date}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[var(--muted-foreground)]">Guests :</span>
                        <span>{booking.number_of_adults} Adult{booking.number_of_adults > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="flex flex-wrap justify-between items-center mt-4 gap-3">
                      <div className="text-sm font-medium">
                        {isPaid ? "Amount paid:" : "Total:"}
                        <span className={`font-serif ml-1 ${isPaid ? "text-foreground" : "text-[var(--maroon)]"}`}>
                          ₹{booking.total_price.toLocaleString()}
                        </span>
                      </div>

                      {/* Action buttons as boxes */}
                      <div className="flex items-center gap-2">
                        {isPaid && (
                          <button
                            onClick={() => handleDownloadInvoice(booking.id)}
                            disabled={isDownloading[booking.id]}
                            className="px-3 py-1.5 border border-[var(--gold)]/50 text-[var(--gold)] text-[10px] uppercase tracking-[0.22em] hover:bg-[var(--gold)]/10 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15V3m0 12-4-4m4 4 4-4M2 17v2a2 2 0 002 2h16a2 2 0 002-2v-2" /></svg>
                            {isDownloading[booking.id] ? "Downloading..." : "Invoice"}
                          </button>
                        )}
                        {!isPaid && booking.status !== 'cancelled' && (
                          <Link
                            href={`/payment/${booking.id}`}
                            className="px-4 py-1.5 bg-[var(--maroon)] text-parchment text-[10px] uppercase tracking-[0.22em] hover:bg-[var(--maroon-deep)] transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                            Pay Now
                          </Link>
                        )}
                        <button
                          onClick={() => setDetailBooking(booking)}
                          className="px-4 py-1.5 border border-[var(--gold)]/40 text-[var(--maroon)] text-[10px] uppercase tracking-[0.22em] hover:bg-[var(--gold)]/10 hover:border-[var(--gold)] transition-all flex items-center gap-1.5"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
