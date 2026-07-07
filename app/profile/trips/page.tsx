"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { invoicesApi } from '@/lib/api/invoices';
import { roomsApi, Room } from '@/lib/api/rooms';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

type Tab = 'UPCOMING TRIPS' | 'PAST STAYS' | 'PAYMENTS';

/* ─── Booking Detail Modal ─────────────────────────────────── */
function BookingDetailModal({
  booking,
  roomsMap,
  onClose,
  onDownloadInvoice,
  isDownloading,
  onCancelRequest,
}: {
  booking: Booking;
  roomsMap: Record<number, Room>;
  onClose: () => void;
  onDownloadInvoice: (id: number) => void;
  isDownloading: boolean;
  onCancelRequest: (id: number, reason: string) => Promise<void>;
}) {
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const isPaid = booking.payment_status === 'paid' || booking.status === 'paid';
  const isPartial = booking.payment_status === 'partial';
  const bookingRooms = booking.rooms?.length ? booking.rooms : (booking.room_id !== undefined ? [{ room_id: booking.room_id }] : []);
  const mainRoom = bookingRooms.length > 0 ? roomsMap[bookingRooms[0].room_id || bookingRooms[0].id] : undefined;
  
  const roomName = bookingRooms.length > 1 
    ? `Multiple Rooms (${bookingRooms.length})` 
    : mainRoom?.name || "Heritage Chamber";
  const roomImage = mainRoom?.images?.[0];

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
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)] mb-1">Booking #{booking.id}</p>
            <h2 className="text-display text-3xl text-parchment capitalize leading-tight">{roomName}</h2>
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
          <span className={`text-xs uppercase tracking-[0.28em] px-3 py-1 border ${
            isPaid
              ? "border-green-500/40 bg-green-50 text-green-700"
              : isPartial
              ? "border-blue-400/40 bg-blue-50 text-blue-600"
              : booking.status === "cancelled"
              ? "border-red-400/40 bg-red-50 text-red-600"
              : "border-[var(--gold)]/40 bg-[var(--gold)]/8 text-[var(--maroon)]"
          }`}>
            {isPaid ? "Confirmed" : isPartial ? "Confirmed (Partial)" : booking.status === "cancelled" ? "Cancelled" : "Pending Payment"}
          </span>
          <span className="text-sm text-muted-foreground font-serif">
            Booked {fmt(booking.created_at)}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="p-6 space-y-5">
          {/* Stay dates */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1 p-3 bg-[var(--gold)]/6 border border-[var(--gold)]/20 text-center">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Check-in</p>
              <p className="text-base font-medium text-[var(--maroon)]">{fmt(booking.check_in_date)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{booking.check_in_time?.slice(0,5) || "11:00"}</p>
            </div>
            <div className="col-span-1 p-3 bg-[var(--gold)]/4 border border-[var(--gold)]/15 text-center flex flex-col items-center justify-center">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Duration</p>
              <p className="text-display text-2xl gold-text">{nights}</p>
              <p className="text-xs text-muted-foreground">night{nights !== 1 ? "s" : ""}</p>
            </div>
            <div className="col-span-1 p-3 bg-[var(--gold)]/6 border border-[var(--gold)]/20 text-center">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">Check-out</p>
              <p className="text-base font-medium text-[var(--maroon)]">{fmt(booking.check_out_date)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{booking.check_out_time?.slice(0,5) || "10:00"}</p>
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-3 p-3 bg-[var(--background)] border border-[var(--gold)]/15">
            <svg className="w-5 h-5 text-[var(--gold)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div className="text-base font-serif text-foreground">
              {booking.number_of_adults} Adult{booking.number_of_adults > 1 ? "s" : ""}
              {booking.number_of_children > 0 ? `, ${booking.number_of_children} Child${booking.number_of_children > 1 ? "ren" : ""}` : ""}
              {booking.children && booking.children.length > 0 && (
                 <span className="text-xs text-muted-foreground ml-2">(Ages: {booking.children.map(c => c.age).join(", ")})</span>
              )}
            </div>
          </div>
          
          {/* Rooms */}
          {bookingRooms.length > 1 && (
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)] mb-2">Rooms Booked</p>
              <div className="space-y-2">
                {bookingRooms.map((br: any, i: number) => {
                  const rm = roomsMap[br.room_id || br.id];
                  return (
                    <div key={i} className="flex items-center justify-between text-sm font-serif py-2 border-b border-[var(--gold)]/10 last:border-0">
                      <span className="text-foreground">{rm?.name || "Room"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guests list */}
          {booking.guests && booking.guests.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)] mb-2">Guest Details</p>
              <div className="space-y-2">
                {booking.guests.map((g, i) => (
                  <div key={i} className="flex items-center justify-between text-sm font-serif py-2 border-b border-[var(--gold)]/10 last:border-0">
                    <span className="text-foreground">
                      {g.first_name} {g.last_name}
                      {g.is_primary && <span className="ml-2 text-[10px] uppercase tracking-widest text-[var(--gold)]">Primary</span>}
                    </span>
                    <span className="text-muted-foreground">{g.email || g.phone || ""}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)] mb-2">Price Breakdown</p>
            <div className="space-y-2 text-base font-serif">
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
              <div className="flex justify-between pt-3 border-t border-[var(--gold)]/20 font-medium items-center">
                <span className="text-sm uppercase tracking-widest text-[var(--maroon)]">Total</span>
                <span className="text-display text-3xl gold-text">₹{booking.total_price.toLocaleString()}</span>
              </div>
              {isPartial && (
                <div className="flex justify-between pt-1 font-medium items-center">
                  <span className="text-sm uppercase tracking-widest text-[var(--maroon)]">Paid (Deposit)</span>
                  <span className="text-display text-3xl gold-text">₹{(booking.amount_paid || 0).toLocaleString()}</span>
                </div>
              )}
              {isPartial && (
                <div className="flex justify-between pt-1 font-medium items-center">
                  <span className="text-sm uppercase tracking-widest text-[var(--maroon)]">Balance Due</span>
                  <span className="text-display text-3xl gold-text">₹{(booking.balance_due || 0).toLocaleString()}</span>
                </div>
              )}
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
              {isPartial ? "Pay Balance →" : "Pay Now →"}
            </Link>
          )}
          {isPaid && booking.status !== "cancelled" && (
            <button
              onClick={() => setShowCancelPrompt(true)}
              className="flex-1 py-3 border border-red-800/40 text-red-800 text-xs uppercase tracking-[0.28em] hover:bg-red-50 transition-colors"
            >
              Cancel Request
            </button>
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
      
      {showCancelPrompt && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white p-6 max-w-md w-full shadow-2xl border border-[var(--gold)]">
            <h3 className="text-xl font-serif text-[var(--maroon)] mb-4">Request Cancellation</h3>
            <p className="text-sm text-gray-600 mb-4">Please provide a reason for cancelling your booking.</p>
            <textarea
              className="w-full border border-gray-300 p-3 text-sm font-serif focus:outline-none focus:border-[var(--gold)]"
              rows={4}
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            {cancelError && <p className="text-red-600 text-xs mt-2">{cancelError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setShowCancelPrompt(false)} 
                className="px-4 py-2 text-xs uppercase tracking-widest text-gray-600 hover:text-black"
                disabled={isCancelling}
              >
                Go Back
              </button>
              <button 
                onClick={async () => {
                  setIsCancelling(true);
                  setCancelError("");
                  try {
                    await onCancelRequest(booking.id, cancelReason);
                    setShowCancelPrompt(false);
                    onClose();
                  } catch (err: any) {
                    setCancelError(err.message || "Failed to submit request.");
                  } finally {
                    setIsCancelling(false);
                  }
                }} 
                className="px-6 py-2 bg-[var(--maroon)] text-white text-xs uppercase tracking-widest hover:bg-[var(--maroon-deep)] disabled:opacity-50"
                disabled={!cancelReason.trim() || isCancelling}
              >
                {isCancelling ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}

/* ─── Main Page ────────────────────────────────────────────── */
export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('UPCOMING TRIPS');
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

  const handleCancelRequest = async (bookingId: number, reason: string) => {
    await bookingsApi.cancelBookingRequest(bookingId, reason);
    // Reload bookings after successful cancellation request
    const bRes = await bookingsApi.getMyBookings();
    if (bRes.success) setBookings(bRes.bookings || []);
  };

  const filteredBookings = bookings.filter(b => {
    const isPaid = b.payment_status === 'paid' || b.status === 'paid' || recentlyPaidIds.includes(b.id);
    const isPartial = b.payment_status === 'partial';
    
    // For 'UPCOMING TRIPS': Check-out date is in the future
    const isUpcoming = new Date(b.check_out_date).getTime() >= new Date().getTime();
    
    if (activeTab === 'UPCOMING TRIPS') return isUpcoming && b.status !== 'cancelled';
    if (activeTab === 'PAST STAYS') return !isUpcoming || b.status === 'cancelled';
    if (activeTab === 'PAYMENTS') return true; // Show all for now, could be filtered to paid/partial
    return true;
  });

  return (
    <>
      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          roomsMap={rooms}
          onClose={() => setDetailBooking(null)}
          onDownloadInvoice={handleDownloadInvoice}
          isDownloading={!!isDownloading[detailBooking.id]}
          onCancelRequest={handleCancelRequest}
        />
      )}
      <div className="animate-fade-up w-full max-w-5xl mx-auto pb-16 px-4 md:px-0">
        
        {/* Centered Tabs */}
        <div className="relative mb-10 mt-4 mx-auto">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--gold)]/20"></div>
          <div className="flex justify-center gap-12 relative z-10">
            {(['UPCOMING TRIPS', 'PAST STAYS', 'PAYMENTS'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] tracking-[0.2em] uppercase transition-colors relative font-semibold ${
                  activeTab === tab ? 'text-[var(--gold)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--gold)]" />
                )}
              </button>
            ))}
          </div>
        </div>

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
          <div className="text-center py-12 border border-dashed border-[var(--gold)]/40 rounded-lg bg-white shadow-sm">
            <p className="text-[var(--muted-foreground)] mb-4">You have no {activeTab.toLowerCase()}.</p>
            {activeTab === 'UPCOMING TRIPS' && (
              <Link href="/reserve" className="inline-block px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] transition-all rounded shadow-md">
                Book a Chamber
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === 'PAYMENTS' ? (
              <div className="bg-white border border-[var(--gold)]/20 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[var(--gold)]/20 text-[13px] text-[#888]">
                      <th className="font-normal py-6 px-8 w-[20%]">Date</th>
                      <th className="font-normal py-6 px-8 w-[30%]">Room</th>
                      <th className="font-normal py-6 px-8 w-[25%]">Amount</th>
                      <th className="font-normal py-6 px-8 w-[25%]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      const bookingRooms = booking.rooms?.length ? booking.rooms : (booking.room_id !== undefined ? [{ room_id: booking.room_id }] : []);
                      const mainRoom = bookingRooms.length > 0 ? rooms[bookingRooms[0].room_id || bookingRooms[0].id] : undefined;
                      const roomName = bookingRooms.length > 1 
                        ? `Multiple Rooms (${bookingRooms.length})` 
                        : mainRoom?.name || "Heritage Chamber";
                      const dateObj = new Date(booking.check_in_date);
                      const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
                      
                      let statusText = "ADVANCE";
                      let statusColor = "text-[#cba052]"; // Gold
                      
                      if (booking.status === 'cancelled') {
                        statusText = "CANCELED";
                        statusColor = "text-[#cc4b4b]"; // Red
                      } else if (booking.payment_status === 'paid' || booking.status === 'paid') {
                        statusText = "PAID";
                        statusColor = "text-green-600";
                      }
                      
                      return (
                        <tr key={`payment-${booking.id}`} className="border-b border-[var(--gold)]/20 last:border-0 hover:bg-[#fcfaf5]/50 transition-colors">
                          <td className="py-6 px-8 text-[13px] text-[#888]">{formattedDate}</td>
                          <td className="py-6 px-8 text-[13px] text-[#888]">{mainRoom?.name?.includes('Suite') || roomName.includes('Apartment') ? 'Royal Suite' : 'Heritage Room'}</td>
                          <td className="py-6 px-8 text-[13px] text-[#888]">₹{booking.total_price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className={`py-6 px-8 text-[10px] uppercase tracking-[0.2em] font-semibold ${statusColor}`}>
                            {statusText}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const bookingRooms = booking.rooms?.length ? booking.rooms : (booking.room_id !== undefined ? [{ room_id: booking.room_id }] : []);
                const mainRoom = bookingRooms.length > 0 ? rooms[bookingRooms[0].room_id || bookingRooms[0].id] : undefined;
                
                const roomName = bookingRooms.length > 1 
                  ? `Multiple Rooms (${bookingRooms.length})` 
                  : mainRoom?.name || "Heritage Chamber";
                const roomImage = mainRoom?.images?.[0];
                const nights = Math.max(1, Math.ceil((new Date(booking.check_out_date).getTime() - new Date(booking.check_in_date).getTime()) / 86400000));

                // Format dates to DD MMM YYYY
                const formatShortDate = (dateStr: string) => {
                  if (!dateStr) return '-';
                  const d = new Date(dateStr);
                  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                };

                return (
                  <div
                    key={booking.id}
                    className="bg-white border border-[var(--gold)]/20 shadow-sm flex flex-col md:flex-row overflow-hidden"
                  >
                    {/* Image Section */}
                    <div className="w-full md:w-[320px] h-48 md:h-auto shrink-0 relative">
                      {roomImage ? (
                        <img src={roomImage} alt={roomName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#f4ebd0] flex flex-col items-center justify-center">
                          <span className="text-[var(--gold)] font-display text-2xl mb-2">क</span>
                          <div className="text-[var(--gold)] font-display text-[10px] tracking-[0.2em] uppercase">Kila</div>
                        </div>
                      )}
                    </div>

                    {/* Details Section */}
                    <div className="flex-1 p-8 flex flex-col justify-center">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--gold)] mb-3">
                        CONFIRMATION . KH-{booking.id.toString().padStart(5, '0')}
                      </p>
                      <h3 className="text-[22px] font-serif text-[var(--foreground)] mb-1">
                        {roomName}
                      </h3>
                      <p className="text-[11px] text-[var(--muted-foreground)] mb-8">
                        {mainRoom?.name?.includes('Suite') || roomName.includes('Apartment') ? 'Royal Suite' : 'Heritage Room'}
                      </p>

                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] mb-1.5">Check-in</p>
                          <p className="text-[13px] text-[var(--foreground)] tracking-wide">{formatShortDate(booking.check_in_date)}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] mb-1.5">Check-out</p>
                          <p className="text-[13px] text-[var(--foreground)] tracking-wide">{booking.check_out_date ? formatShortDate(booking.check_out_date) : '-'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] uppercase tracking-[0.25em] text-[var(--muted-foreground)] mb-1.5">Guests</p>
                          <p className="text-[13px] text-[var(--foreground)] tracking-wide">
                            {booking.number_of_adults} Adults
                            {booking.number_of_children > 0 ? ` . ${booking.number_of_children} Child` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action/Price Section */}
                    <div className="w-full md:w-[220px] p-8 border-t md:border-t-0 md:border-l border-[var(--gold)]/20 flex flex-col items-center justify-center shrink-0">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-[var(--gold)] mb-3">
                        {nights} NIGHT{nights > 1 ? 'S' : ''}
                      </p>
                      <p className="text-2xl font-serif text-[var(--gold)] mb-6">
                        ₹{booking.total_price.toLocaleString()}
                      </p>
                      <button
                        onClick={() => setDetailBooking(booking)}
                        className="w-full py-2.5 bg-[#cba052] text-white text-[9px] uppercase tracking-[0.2em] font-medium hover:bg-[#b58b44] transition-colors mb-2.5"
                      >
                        View Details
                      </button>
                      <button
                        className="w-full py-2.5 border border-[#cba052]/40 text-[var(--muted-foreground)] text-[9px] uppercase tracking-[0.2em] font-medium hover:border-[#cba052] hover:text-[#cba052] transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
