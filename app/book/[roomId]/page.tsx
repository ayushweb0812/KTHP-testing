"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { roomsApi, Room } from "@/lib/api/rooms";
import { bookingsApi, CreateBookingPayload, Booking } from "@/lib/api/bookings";
import { paymentApi } from "@/lib/api/payment";
import { couponsApi, Coupon } from "@/lib/api/coupons";
import { getAccessToken } from "@/lib/api/apiClient";
import { settingsApi } from "@/lib/api/settings";
import Script from "next/script";
import { Ornament } from "@/components/site/Ornament";
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useTransition } from "@/components/transitions/TransitionContext";
import { RoomDetailsModal } from "@/components/site/RoomDetailsModal";
import { pushGtmEvent } from "@/lib/analytics/gtm";
import { getRoomPrice, formatPrice } from "@/lib/utils/pricing";

const COUNTRY_CONFIG = {
  "+91": { name: "IN (+91)", length: 10, placeholder: "10-digit number" },
  "+1": { name: "US/CA (+1)", length: 10, placeholder: "10-digit number" },
  "+44": { name: "UK (+44)", length: 10, placeholder: "10-digit number" },
  "+61": { name: "AU (+61)", length: 9, placeholder: "9-digit number" },
  "+971": { name: "UAE (+971)", length: 9, placeholder: "9-digit number" },
};
type CountryCode = keyof typeof COUNTRY_CONFIG;

type Step = 1 | 2 | 3;
type PaymentMode = "full" | "partial";

function daysBetween(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BookRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { startTransition } = useTransition();

  /* ─── room data ─────────────────────────────── */
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgIdx, setImgIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ─── step ───────────────────────────────────── */
  const [step, setStep] = useState<Step>(1);

  const searchParams = useSearchParams();
  const isMultiRoom = roomId === "checkout";
  const requestedRooms = searchParams.getAll("rooms").map(Number);

  /* ─── step 1: guest info ─────────────────────── */
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") || "");
  const [adults, setAdults] = useState<number | string>(searchParams.get("adults") || 1);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [children, setChildren] = useState<number | string>(searchParams.get("children") || 0);
  const [childrenAges, setChildrenAges] = useState<number[]>(
    searchParams.get("children_ages") ? searchParams.get("children_ages")!.split(',').map(Number) : []
  );
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("+91");
  const [phone, setPhone] = useState("");

  /* ─── step 2: coupon + payment mode ─────────── */
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");
  const [freeCancellation, setFreeCancellation] = useState(false);
  
  const [settingsError, setSettingsError] = useState(false);
  const [settings, setSettings] = useState<{
    partial_payment_enabled: boolean;
    deposit_percent: number;
    service_charge: number;
    cancellation_window_days: number;
  } | null>(null);

  /* ─── booking + payment state ────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ─── derived ────────────────────────────────── */
  const nights = nightsBetween(checkIn, checkOut);
  const daysUntilCheckIn = checkIn ? daysBetween(checkIn) : 0;
  const isPartialEligible = settings?.partial_payment_enabled ? (daysUntilCheckIn >= 15) : false;

  const roomPrice = room ? (getRoomPrice(room) ?? 0) : 0;
  const baseTotal = roomPrice * nights * (isMultiRoom ? 1 : roomsCount);
  // Use dynamic values from API — never hardcode financial amounts
  const serviceCharge = settings?.service_charge ?? 0;
  const taxes = Math.round(baseTotal * 0.12);

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || baseTotal < appliedCoupon.min_amount) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      const pct = (baseTotal * appliedCoupon.discount_value) / 100;
      return appliedCoupon.max_discount ? Math.min(pct, appliedCoupon.max_discount) : pct;
    }
    return appliedCoupon.discount_value;
  }, [appliedCoupon, baseTotal]);

  const grandTotal = Math.max(0, baseTotal + serviceCharge + taxes - couponDiscount);
  const depositPct = settings?.deposit_percent ?? 0;
  const depositAmount = Math.round(grandTotal * (depositPct / 100));
  const amountToCharge = paymentMode === "partial" && isPartialEligible ? depositAmount : grandTotal;

  /* ─── load room ──────────────────────────────── */
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { 
      const currentUrl = window.location.pathname + window.location.search;
      const ctx = {
        checkIn, checkOut, adults, children, childrenAges, firstName, lastName, email, phone, countryCode,
        rooms: requestedRooms, roomsCount
      };
      sessionStorage.setItem('auth_booking_context', JSON.stringify(ctx));
      startTransition(() => {
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`); 
      });
      return; 
    }

    async function fetchData() {
      try {
        let aggregatedRoom: Room | null = null;
        let roomDataPromise;
        if (isMultiRoom && requestedRooms.length > 0) {
          roomDataPromise = Promise.all(requestedRooms.map(id => roomsApi.getRoomById(id))).then(results => {
            const fetchedRooms = results.filter(r => r.success).map(r => r.room);
            if (fetchedRooms.length > 0) {
              aggregatedRoom = {
                ...fetchedRooms[0],
                id: -1,
                name: fetchedRooms.map(r => r.name).join(' + '),
                capacity: fetchedRooms.reduce((sum, r) => sum + r.capacity, 0),
                price: fetchedRooms.reduce((sum, r) => sum + (getRoomPrice(r) ?? 0), 0),
              };
            }
            return { success: true, room: aggregatedRoom };
          });
        } else {
          roomDataPromise = roomsApi.getRoomById(Number(roomId)).then(r => {
             if (r.success) aggregatedRoom = r.room;
             return r;
          });
        }

        const [roomRes, profileRes, couponsRes, settingsRes] = await Promise.all([
          roomDataPromise,
          authApi.getProfile().catch(() => ({ success: false, user: null })),
          couponsApi.getCoupons().catch(() => ({ success: false, coupons: [] })),
          settingsApi.getPaymentSettings().catch(() => ({ success: false, settings: null }))
        ]);

        if (aggregatedRoom) setRoom(aggregatedRoom as Room);
        else setError("Room not found.");

        if (settingsRes.success && settingsRes.settings) {
          setSettings(settingsRes.settings);
        } else {
          // Block checkout if settings cannot be loaded — never guess financial values
          setSettingsError(true);
          setError("Unable to load payment settings. Please refresh and try again.");
        }

        if (profileRes.success && profileRes.user) {
          const u = profileRes.user;
          // Restore from context if available, otherwise profile
          const storedCtxStr = sessionStorage.getItem('auth_booking_context');
          let parsedCtx: any = null;
          try {
            if (storedCtxStr) {
               parsedCtx = JSON.parse(storedCtxStr);
               if (parsedCtx.roomsCount) setRoomsCount(parsedCtx.roomsCount);
               sessionStorage.removeItem('auth_booking_context');
            }
          } catch(e) {}
          
          if (parsedCtx?.firstName) setFirstName(parsedCtx.firstName);
          else if (u.first_name) setFirstName(u.first_name);
          
          if (parsedCtx?.lastName) setLastName(parsedCtx.lastName);
          else if (u.last_name) setLastName(u.last_name);
          
          if (parsedCtx?.email) setEmail(parsedCtx.email);
          else if (u.email) setEmail(u.email);
          
          if (parsedCtx?.phone) {
             setPhone(parsedCtx.phone);
             if (parsedCtx.countryCode) setCountryCode(parsedCtx.countryCode);
          } else if (u.phone) {
            const phoneVal = u.phone.replace(/^\+\d+\s/, '');
            setPhone(phoneVal);
          }
        }

        if (couponsRes.success && couponsRes.coupons) {
          setAvailableCoupons(couponsRes.coupons);
        }
      } catch {
        setError("Error loading details.");
      } finally {
        setLoading(false);
      }
    }
    if (roomId) fetchData();
  }, [roomId, router]);

  /* ─── coupon apply ───────────────────────────── */
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setAppliedCoupon(null);

    try {
      const res = await couponsApi.getCoupons();
      if (res.success) {
        const match = res.coupons.find(
          (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase()
        );
        if (!match) {
          setCouponError("Invalid coupon code.");
        } else if (new Date(match.valid_until) < new Date()) {
          setCouponError("This coupon has expired.");
        } else if (baseTotal < match.min_amount) {
          setCouponError(`Minimum booking value ${formatPrice(match.min_amount)} required.`);
        } else {
          setAppliedCoupon(match);
        }
      } else {
        setCouponError("Could not fetch coupons. Try again.");
      }
    } catch {
      setCouponError("Error applying coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  /* ─── remove coupon ──────────────────────────── */
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  /* ─── step 1 → 2 ─────────────────────────────── */
  const handleGuestInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (availableCoupons.length > 0 && !appliedCoupon) {
      let best: Coupon | null = null;
      let maxDiscount = 0;
      const now = new Date();

      for (const c of availableCoupons) {
        if (new Date(c.valid_until) < now) continue;
        if (baseTotal < c.min_amount) continue;

        let discount = 0;
        if (c.discount_type === "percentage") {
          discount = (baseTotal * c.discount_value) / 100;
          if (c.max_discount) discount = Math.min(discount, c.max_discount);
        } else {
          discount = c.discount_value;
        }

        if (discount > maxDiscount) {
          maxDiscount = discount;
          best = c;
        }
      }

      if (best) {
        setAppliedCoupon(best);
        setCouponInput(best.code);
      }
    }
  };

  /* ─── step 2: confirm & create booking ──────── */
  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    const payload: CreateBookingPayload = {
      room_id: isMultiRoom ? requestedRooms[0] : Number(roomId),
      ...(isMultiRoom ? { rooms: requestedRooms } : (roomsCount > 1 ? { rooms: Array(roomsCount).fill(Number(roomId)) } : {})),
      check_in_date: checkIn,
      check_out_date: checkOut,
      number_of_adults: Number(adults) || 1,
      // children_ages is the authoritative field; number_of_children is derived from it
      ...(childrenAges.length > 0 ? { children_ages: childrenAges } : {}),
      guests: [
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone: `${countryCode}${phone}`,
          is_primary: true,
        },
      ],
      ...(appliedCoupon ? { coupon_code: appliedCoupon.code } : {}),
      free_cancellation: freeCancellation,
    };

    try {
      const res = await bookingsApi.createBooking(payload);
      if (res.success && res.booking) {
        setCreatedBooking(res.booking);
        // Immediately initiate payment
        await handlePayNow(res.booking.id);
      } else {
        setSubmitError(res.message || "Failed to create booking.");
      }
    } catch (err: any) {
      // Handle specific error codes gracefully
      if (err?.status === 409) {
        setSubmitError("This room is no longer available for the selected dates. Please go back and select different dates or a different room.");
      } else if (err?.status === 422) {
        setSubmitError(err.message || "Booking details are invalid. Please check your inputs.");
      } else if (err?.status === 400) {
        setSubmitError(err.message || "Invalid booking request. Please review your details.");
      } else {
        setSubmitError(err.message || "An error occurred during booking. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Razorpay payment ───────────────────────── */
  const handlePayNow = async (bookingId: number) => {
    setIsInitiatingPayment(true);
    setSubmitError("");

    try {
      const paymentRes = await paymentApi.initiatePayment(bookingId, { payment_mode: paymentMode });

      if (paymentRes.success && paymentRes.payment) {
        const { payment } = paymentRes;

        // For partial payment (frontend-only): override amount_paise
        const chargeAmountPaise =
          paymentMode === "partial" && isPartialEligible
            ? depositAmount * 100
            : payment.amount_paise;

        const options = {
          key: payment.razorpay_key,
          amount: chargeAmountPaise,
          currency: payment.currency,
          order_id: payment.order_id,
          name: "Kila Heritage",
          description:
            paymentMode === "partial" && isPartialEligible
              ? `Reservation #${bookingId} — ${depositPct}% Deposit`
              : `Reservation #${bookingId}`,
          prefill: {
            name: payment.customer.name,
            email: payment.customer.email,
            contact: payment.customer.phone,
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await paymentApi.verifyPayment(bookingId, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                pushGtmEvent("booking_complete", { booking_id: bookingId });
                setShowSuccess(true);
                setTimeout(() => { startTransition(); router.push("/profile"); }, 3500);
              } else {
                setSubmitError("Payment verification failed. Check your profile.");
                setTimeout(() => { startTransition(); router.push("/profile"); }, 2000);
              }
            } catch {
              setSubmitError("Error verifying payment.");
              setTimeout(() => { startTransition(); router.push("/profile"); }, 2000);
            }
          },
          theme: { color: "#5f181f" },
          modal: {
            ondismiss: function () {
              // Stay on page so user can retry
              setIsInitiatingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setSubmitError(response.error.description || "Payment failed.");
        });
        rzp.open();
      } else {
        setSubmitError(paymentRes.message || "Failed to initiate payment.");
      }
    } catch (paymentErr: any) {
      setSubmitError(`Payment Error: ${paymentErr.message || "Failed to start payment."}`);
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  /* ─── render guards ──────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[var(--background)] paper-grain">
        <p className="text-display text-2xl gold-text">Loading...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[var(--background)] paper-grain">
        <div className="text-center">
          <p className="text-display text-3xl text-[var(--maroon)]">{error || "Room not found"}</p>
          <Link href="/reserve" className="mt-6 inline-block text-xs uppercase tracking-widest border-b border-[var(--gold)] text-[var(--gold)] pb-1">
            Back to Rooms
          </Link>
        </div>
      </div>
    );
  }

  /* ─── today for min date ─────────────────────── */
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Success Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]/95 backdrop-blur-md">
          <div className="bg-card border border-[var(--gold)]/30 p-12 shadow-[var(--shadow-royal)] text-center max-w-md w-full mx-4 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-2 border-[var(--gold)] flex items-center justify-center mb-8 animate-fade-up">
              <svg className="w-12 h-12 text-[var(--gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" strokeDasharray="24" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.8s" fill="freeze" />
                </path>
              </svg>
            </div>
            <h2 className="text-display text-4xl text-[var(--maroon)] mb-4 animate-fade-up animate-fade-up-delay-1">
              Booking Confirmed
            </h2>
            <p className="text-muted-foreground font-serif text-lg animate-fade-up animate-fade-up-delay-2">
              Thank you, <span className="gold-text">{firstName}</span>. Your stay at KILA has been secured.
            </p>
            {paymentMode === "partial" && isPartialEligible && (
              <p className="mt-3 text-sm font-serif text-[var(--maroon)] animate-fade-up animate-fade-up-delay-2 bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-4 py-2">
                {formatPrice(depositAmount)} deposit paid · Balance {formatPrice(grandTotal - depositAmount)} due at check-in
              </p>
            )}
            <div className="mt-8 animate-fade-up animate-fade-up-delay-3 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[var(--gold)] border-t-transparent animate-spin" />
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">Preparing your itinerary...</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen pt-28 pb-24 bg-gradient-to-b from-[oklch(0.96_0.022_85)] via-[oklch(0.93_0.04_70)] to-[oklch(0.95_0.03_80)] paper-grain">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="mb-10 text-center animate-fade-up">
            <p className="eyebrow text-[var(--maroon)]">Reservation Details</p>
            <h1 className="text-display text-4xl md:text-5xl mt-4 leading-[1.05]">
              Complete your <em className="gold-text not-italic">booking</em>
            </h1>
            <Ornament className="mx-auto mt-6 w-32 text-[var(--gold)]" />
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-12 animate-fade-up">
            {[
              { n: 1, label: "Guest Info" },
              { n: 2, label: "Review & Coupon" },
              { n: 3, label: "Payment" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500 ${
                      step > s.n
                        ? "bg-[var(--gold)] border-[var(--gold)] text-[var(--maroon-deep)]"
                        : step === s.n
                        ? "bg-[var(--maroon)] border-[var(--maroon)] text-parchment"
                        : "bg-transparent border-[var(--gold)]/30 text-muted-foreground"
                    }`}
                  >
                    {step > s.n ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    ) : (
                      s.n
                    )}
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.2em] ${step === s.n ? "text-[var(--maroon)]" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-20 h-px mx-2 mb-4 transition-all duration-500 ${step > s.n ? "bg-[var(--gold)]" : "bg-[var(--gold)]/20"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">

            {/* ═══════════════════════════════════
                STEP 1 — GUEST INFO
            ═══════════════════════════════════ */}
            {step === 1 && (
              <div className="bg-card border border-[var(--gold)]/30 p-8 shadow-[var(--shadow-royal)] animate-fade-up">
                <h2 className="text-display text-3xl text-[var(--maroon)] mb-2">Guest Information</h2>
                <p className="text-sm text-muted-foreground font-serif mb-8">Please fill in your details to proceed to the booking summary.</p>

                <form onSubmit={handleGuestInfoSubmit} className="space-y-7">
                  {/* Dates */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] mb-4">Stay Dates</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Check-in Date</label>
                        <input
                          required
                          type="date"
                          min={todayStr}
                          value={checkIn}
                          onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }}
                          className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Check-out Date</label>
                        <input
                          required
                          type="date"
                          min={checkIn || todayStr}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground"
                        />
                      </div>
                    </div>
                    {nights > 0 && (
                      <p className="mt-2 text-xs text-[var(--gold)] text-right">{nights} night{nights !== 1 ? "s" : ""}</p>
                    )}
                  </div>

                  {/* Guests count */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] mb-4">{isMultiRoom ? "Guest Count" : "Room & Guest Count"}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {!isMultiRoom && (
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Rooms</label>
                          <select required value={roomsCount} onChange={(e) => setRoomsCount(parseInt(e.target.value))} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2.5 focus:outline-none focus:border-[var(--maroon)] text-foreground appearance-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                              <option key={n} value={n} className="bg-[var(--background)] text-foreground">{n}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Adults</label>
                        <input required type="number" min="1" max={room.capacity * (isMultiRoom ? 1 : roomsCount)} value={adults} onChange={(e) => setAdults(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Children</label>
                        <input required type="number" min="0" value={children} onChange={(e) => setChildren(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" />
                      </div>
                    </div>
                  </div>

                  {/* Primary guest */}
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--gold)] mb-4">Primary Guest</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">First Name</label>
                        <input required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" placeholder="First Name" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Last Name</label>
                        <input required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" placeholder="Last Name" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Email</label>
                        <input
                          required
                          type="email"
                          pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                          title="Please enter a valid email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground"
                          placeholder="Email Address"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Phone Number</label>
                        <div className="flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => { setCountryCode(e.target.value as CountryCode); setPhone(""); }}
                            className="bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground w-[110px] text-sm"
                          >
                            {Object.entries(COUNTRY_CONFIG).map(([code, config]) => (
                              <option key={code} value={code} className="bg-card text-foreground">{config.name}</option>
                            ))}
                          </select>
                          <input
                            required
                            type="tel"
                            pattern={`[0-9]{${COUNTRY_CONFIG[countryCode].length}}`}
                            minLength={COUNTRY_CONFIG[countryCode].length}
                            maxLength={COUNTRY_CONFIG[countryCode].length}
                            title={`Please enter a valid ${COUNTRY_CONFIG[countryCode].length}-digit phone number`}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                            className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground"
                            placeholder={COUNTRY_CONFIG[countryCode].placeholder}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={nights === 0}
                    className="w-full mt-4 py-4 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-all duration-300 shadow-[var(--shadow-gold)] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <span className="relative z-10">Continue to Review</span>
                    <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  </button>
                </form>
              </div>
            )}

            {/* ═══════════════════════════════════
                STEP 2 — REVIEW, COUPON & PAYMENT MODE
            ═══════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-up">

                {/* Error */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                    {submitError}
                  </div>
                )}

                {/* Booking Summary card */}
                <div className="bg-card border border-[var(--gold)]/30 p-8 shadow-[var(--shadow-royal)]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-display text-3xl text-[var(--maroon)]">Booking Summary</h2>
                    <button
                      onClick={() => { setStep(1); setSubmitError(""); }}
                      className="text-xs uppercase tracking-widest text-[var(--gold)] hover:text-[var(--maroon)] transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                      Edit
                    </button>
                  </div>

                  {/* Guest summary */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-[var(--gold)]/5 border border-[var(--gold)]/20 mb-6 text-sm font-serif">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Guest</p>
                      <p className="text-foreground">{firstName} {lastName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Email</p>
                      <p className="text-foreground truncate">{email}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Check-in</p>
                      <p className="text-foreground">{new Date(checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Check-out</p>
                      <p className="text-foreground">{new Date(checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Guests</p>
                      <p className="text-foreground">{adults} Adult{Number(adults) !== 1 ? "s" : ""}{Number(children) > 0 ? `, ${children} Child${Number(children) !== 1 ? "ren" : ""}` : ""}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Duration</p>
                      <p className="text-foreground">{nights} Night{nights !== 1 ? "s" : ""}</p>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-3 text-sm font-serif">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{formatPrice(roomPrice)} × {nights} night{nights !== 1 ? "s" : ""}</span>
                      <span>{formatPrice(baseTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service charges (5%)</span>
                      <span>{formatPrice(serviceCharge)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GST (12%)</span>
                      <span>{formatPrice(taxes)}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-[oklch(0.45_0.13_150)]">
                        <span>Coupon discount ({appliedCoupon?.code})</span>
                        <span>−{formatPrice(Math.round(couponDiscount))}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-[var(--gold)]/30 flex justify-between items-center">
                      <span className="text-xs uppercase tracking-widest text-[var(--maroon)]">Total</span>
                      <span className="text-display text-3xl gold-text">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="bg-card border border-[var(--gold)]/30 p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-5 h-5 text-[var(--gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l1.5-7.5M15 9.75l-1.5 7.5M5.25 9h13.5M5.25 15h13.5" />
                    </svg>
                    <h3 className="text-display text-xl text-[var(--maroon)]">Coupon Code</h3>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-[oklch(0.45_0.13_150/0.08)] border border-[oklch(0.45_0.13_150/0.3)]">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[oklch(0.45_0.13_150)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
                        <div>
                          <p className="text-sm font-medium text-[oklch(0.32_0.13_150)]">{appliedCoupon.code} applied</p>
                          <p className="text-xs text-muted-foreground">{appliedCoupon.description} · Saving {formatPrice(Math.round(couponDiscount))}</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-xs uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <select
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                        className="flex-1 bg-card border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm tracking-widest"
                      >
                        <option value="">Select a coupon</option>
                        {availableCoupons.map((c) => {
                          const now = new Date();
                          const isValid = new Date(c.valid_until) >= now && baseTotal >= c.min_amount;
                          return (
                            <option key={c.id} value={c.code} disabled={!isValid}>
                              {c.code} - {c.description} {isValid ? "" : "(Not eligible)"}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponInput.trim()}
                        className="px-5 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-widest hover:bg-[var(--maroon-deep)] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {couponLoading ? <div className="w-3.5 h-3.5 border border-parchment/30 border-t-parchment rounded-full animate-spin" /> : null}
                        Apply
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {couponError}
                    </p>
                  )}
                </div>

                {/* Free Cancellation Section */}
                {(settings?.cancellation_window_days ?? 0) > 0 && (
                  <div className="bg-card border border-[var(--gold)]/30 p-6 shadow-[var(--shadow-soft)]">
                    <label className="flex items-start gap-4 cursor-pointer group">
                      <div className="relative mt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={freeCancellation}
                          onChange={(e) => setFreeCancellation(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${freeCancellation ? 'bg-[var(--maroon)] border-[var(--maroon)]' : 'border-[var(--gold)]/40 group-hover:border-[var(--gold)]/80'}`}>
                          {freeCancellation && (
                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                          )}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-display text-xl text-[var(--maroon)]">Free Cancellation</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-serif">
                          Opt-in for free cancellation. You can cancel your booking up to {settings?.cancellation_window_days} days before check-in for a full refund.
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Payment Mode Section */}
                <div className="bg-card border border-[var(--gold)]/30 p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-[var(--gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <h3 className="text-display text-xl text-[var(--maroon)]">Payment Option</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 font-serif">
                    {isPartialEligible
                      ? `Your check-in is ${daysUntilCheckIn} days away — partial deposit available.`
                      : `Check-in is within 15 days — full payment required.`}
                  </p>

                  <div className="space-y-3">
                    {/* Full Payment */}
                    <label
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-300 ${
                        paymentMode === "full"
                          ? "border-[var(--maroon)] bg-[var(--maroon)]/5"
                          : "border-[var(--gold)]/30 hover:border-[var(--gold)]/60"
                      }`}
                    >
                      <div className="relative mt-0.5 shrink-0">
                        <input
                          type="radio"
                          name="paymentMode"
                          value="full"
                          checked={paymentMode === "full"}
                          onChange={() => setPaymentMode("full")}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMode === "full" ? "border-[var(--maroon)]" : "border-[var(--gold)]/40"}`}>
                          {paymentMode === "full" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--maroon)]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">Full Payment</p>
                          <p className="text-display text-xl gold-text">₹{grandTotal.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-serif">Pay the complete amount now. No balance due at check-in.</p>
                      </div>
                    </label>

                    {/* Partial Payment */}
                    <label
                      className={`flex items-start gap-4 p-4 border transition-all duration-300 relative ${
                        !isPartialEligible
                          ? "border-[var(--gold)]/15 opacity-50 cursor-not-allowed"
                          : paymentMode === "partial"
                          ? "border-[var(--gold)] bg-[var(--gold)]/5 cursor-pointer"
                          : "border-[var(--gold)]/30 hover:border-[var(--gold)]/60 cursor-pointer"
                      }`}
                    >
                      <div className="relative mt-0.5 shrink-0">
                        <input
                          type="radio"
                          name="paymentMode"
                          value="partial"
                          checked={paymentMode === "partial"}
                          onChange={() => isPartialEligible && setPaymentMode("partial")}
                          disabled={!isPartialEligible}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMode === "partial" ? "border-[var(--gold)]" : "border-[var(--gold)]/40"}`}>
                          {paymentMode === "partial" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">Partial Deposit</p>
                            {!isPartialEligible && (
                              <span className="text-[9px] uppercase tracking-widest bg-[var(--gold)]/20 text-[var(--maroon)] px-2 py-0.5">Not available</span>
                            )}
                          </div>
                          {paymentMode === "partial" && isPartialEligible && (
                            <p className="text-display text-xl gold-text">₹{depositAmount.toLocaleString()}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-serif">
                          {isPartialEligible
                            ? "Pay a deposit now, balance due at check-in."
                            : "Available only for bookings 15+ days before check-in."}
                        </p>

                        {/* Deposit % summary */}
                        {paymentMode === "partial" && isPartialEligible && (
                          <div className="mt-4 space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--maroon)]">Deposit Breakdown ({depositPct}%)</p>
                            <div className="grid grid-cols-2 gap-2 text-xs font-serif">
                              <div className="p-2.5 bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-center">
                                <p className="text-muted-foreground mb-0.5">Pay now</p>
                                <p className="text-[var(--maroon)] font-medium">₹{depositAmount.toLocaleString()}</p>
                              </div>
                              <div className="p-2.5 bg-[var(--gold)]/5 border border-[var(--gold)]/15 text-center">
                                <p className="text-muted-foreground mb-0.5">Due at check-in</p>
                                <p className="text-[var(--maroon)] font-medium">₹{(grandTotal - depositAmount).toLocaleString()}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-serif">
                              ⚠ Partial payment is indicative only. Balance must be settled at the property before check-in.
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Confirm CTA */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting || isInitiatingPayment || !settings}
                  className="w-full py-5 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-all duration-300 shadow-[var(--shadow-gold)] disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {(isSubmitting || isInitiatingPayment) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                      <span>{isSubmitting ? "Creating booking..." : "Opening payment..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">
                        Confirm & Pay ₹{amountToCharge.toLocaleString()}
                      </span>
                      <svg className="w-4 h-4 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                  Secured by Razorpay · 256-bit SSL encryption
                </p>
              </div>
            )}

            {/* ═══════════════════════════════════
                ROOM SUMMARY SIDEBAR (always visible)
            ═══════════════════════════════════ */}
            <div className="bg-gradient-to-br from-[oklch(0.97_0.03_85)] to-[oklch(0.93_0.05_70)] border border-[var(--gold)]/30 p-8 sticky top-32 animate-fade-up animate-fade-up-delay-1">
              <p className="eyebrow text-[var(--gold)]">Your Stay</p>
              <h3 className="text-display text-3xl text-[var(--maroon)] mt-2">{room.name}</h3>

              {room.images && room.images.length > 0 && (
                <div className="aspect-[4/3] w-full mt-4 overflow-hidden border border-[var(--gold)]/20 shadow-sm relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                  <img src={room.images[imgIdx]} alt={room.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {room.images.length > 1 && (
                    <>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx - 1 + room.images!.length) % room.images!.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Previous image">‹</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % room.images!.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-parchment/90 hover:bg-[var(--gold)] text-[var(--maroon-deep)] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" aria-label="Next image">›</button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {room.images.map((_, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === imgIdx ? "bg-[var(--gold)]" : "bg-white/50"}`} />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-black/60 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 backdrop-blur-sm rounded-sm">View Gallery</span>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <button type="button" onClick={() => setIsModalOpen(true)} className="text-[10px] uppercase tracking-[0.2em] text-[var(--gold)] hover:text-[var(--maroon)] transition-colors border-b border-transparent hover:border-[var(--maroon)]">View full room details</button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-serif text-foreground/80">
                <span>Max Capacity: {room.capacity}</span>
                <span>Bed: {room.bed_type}</span>
              </div>

              <div className="mt-6 h-px bg-[var(--gold)]/30" />

              <div className="mt-6 space-y-2 text-sm font-serif">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate per night</span>
                  <span className="gold-text text-display text-xl">₹{room.price.toLocaleString()}</span>
                </div>
                {nights > 0 && (
                  <>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{nights} night{nights !== 1 ? "s" : ""}</span>
                      <span>₹{baseTotal.toLocaleString()}</span>
                    </div>
                    {step === 2 && (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Taxes & charges</span>
                          <span>₹{(serviceCharge + taxes).toLocaleString()}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-xs text-[oklch(0.45_0.13_150)]">
                            <span>Coupon</span>
                            <span>−₹{Math.round(couponDiscount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-[var(--gold)]/30 flex justify-between">
                          <span className="text-xs uppercase tracking-widest text-[var(--maroon)]">Total</span>
                          <span className="text-display text-2xl gold-text">₹{grandTotal.toLocaleString()}</span>
                        </div>
                        {paymentMode === "partial" && isPartialEligible && (
                          <div className="mt-2 p-2.5 bg-[var(--gold)]/10 border border-[var(--gold)]/25 text-xs font-serif text-center">
                            <p className="text-[var(--maroon)] font-medium">Paying {depositPct}% deposit: ₹{depositAmount.toLocaleString()}</p>
                            <p className="text-muted-foreground mt-0.5">Balance ₹{(grandTotal - depositAmount).toLocaleString()} at check-in</p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {nights === 0 && (
                <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest text-right">Per night · Taxes extra</p>
              )}

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-[var(--gold)]/20 space-y-2.5">
                {[
                  { icon: "🔒", text: "Secure payment via Razorpay" },
                  { icon: "✓", text: "Instant booking confirmation" },
                  { icon: "✉", text: "Invoice sent to your email" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2 text-xs text-muted-foreground font-serif">
                    <span className="text-[var(--gold)]">{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <RoomDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomId={Number(roomId)}
      />
    </>
  );
}
