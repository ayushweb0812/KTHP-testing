"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookingsApi, Booking } from "@/lib/api/bookings";
import { paymentApi } from "@/lib/api/payment";
import { couponsApi, Coupon } from "@/lib/api/coupons";
import { getAccessToken } from "@/lib/api/apiClient";
import Script from "next/script";
import { Ornament } from "@/components/site/Ornament";
import { TransitionLink as Link } from "@/components/site/TransitionLink";

type PaymentMode = "full" | "partial";
const DEPOSIT_OPTIONS = [30, 40, 50] as const;
type DepositPct = (typeof DEPOSIT_OPTIONS)[number];

function daysBetween(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const router = useRouter();

  /* ─── data ───────────────────────────────────── */
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ─── coupon ─────────────────────────────────── */
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  /* ─── payment mode ───────────────────────────── */
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("full");
  const [depositPct, setDepositPct] = useState<DepositPct>(30);

  /* ─── payment state ──────────────────────────── */
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  /* ─── derived ────────────────────────────────── */
  const daysUntilCheckIn = booking ? daysBetween(booking.check_in_date) : 0;
  const isPartialEligible = daysUntilCheckIn >= 15;

  const grandTotal = booking?.total_price ?? 0;
  const alreadyPaid = booking?.payment_status === "paid" || booking?.payment_status === "partial";
  const isPending = booking?.payment_status === "pending";

  const couponDiscount = useMemo(() => {
    if (!appliedCoupon || grandTotal < appliedCoupon.min_amount) return 0;
    if (appliedCoupon.discount_type === "percentage") {
      const pct = (grandTotal * appliedCoupon.discount_value) / 100;
      return appliedCoupon.max_discount ? Math.min(pct, appliedCoupon.max_discount) : pct;
    }
    return appliedCoupon.discount_value;
  }, [appliedCoupon, grandTotal]);

  const adjustedTotal = Math.max(0, grandTotal - couponDiscount);
  const depositAmount = Math.round(adjustedTotal * (depositPct / 100));
  const amountToCharge = paymentMode === "partial" && isPartialEligible ? depositAmount : adjustedTotal;

  /* ─── load booking ───────────────────────────── */
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { 
      const currentUrl = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`); 
      return; 
    }

    async function fetchBooking() {
      try {
        const [res, couponsRes] = await Promise.all([
          bookingsApi.getBookingById(Number(bookingId)),
          couponsApi.getCoupons().catch(() => ({ success: false, coupons: [] }))
        ]);

        if (res.success && res.booking) {
          setBooking(res.booking);
          
          if (couponsRes.success && couponsRes.coupons) {
            setAvailableCoupons(couponsRes.coupons);
            
            // Auto apply best coupon
            const total = res.booking.total_price;
            let best: Coupon | null = null;
            let maxDiscount = 0;
            const now = new Date();

            for (const c of couponsRes.coupons) {
              if (new Date(c.valid_until) < now) continue;
              if (total < c.min_amount) continue;

              let discount = 0;
              if (c.discount_type === "percentage") {
                discount = (total * c.discount_value) / 100;
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
        } else {
          setError("Booking not found.");
        }
      } catch {
        setError("Could not load booking details.");
      } finally {
        setLoading(false);
      }
    }
    if (bookingId) fetchBooking();
  }, [bookingId, router]);

  /* ─── coupon ─────────────────────────────────── */
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
        } else if (grandTotal < match.min_amount) {
          setCouponError(`Minimum booking value ₹${match.min_amount.toLocaleString()} required.`);
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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  /* ─── payment ────────────────────────────────── */
  const handlePayNow = async () => {
    if (!booking) return;
    setIsInitiatingPayment(true);
    setPaymentError("");

    try {
      const paymentRes = await paymentApi.initiatePayment(booking.id);

      if (paymentRes.success && paymentRes.payment) {
        const { payment } = paymentRes;

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
              ? `Booking #${booking.id} — ${depositPct}% Deposit`
              : `Booking #${booking.id}`,
          prefill: {
            name: payment.customer.name,
            email: payment.customer.email,
            contact: payment.customer.phone,
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await paymentApi.verifyPayment(booking.id, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                setShowSuccess(true);
                setTimeout(() => router.push("/profile"), 3500);
              } else {
                setPaymentError("Payment verification failed. Please check your profile.");
                setTimeout(() => router.push("/profile"), 2000);
              }
            } catch {
              setPaymentError("Error verifying payment.");
              setTimeout(() => router.push("/profile"), 2000);
            }
          },
          theme: { color: "#5f181f" },
          modal: {
            ondismiss: function () {
              setIsInitiatingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setPaymentError(response.error.description || "Payment failed.");
        });
        rzp.open();
      } else {
        setPaymentError(paymentRes.message || "Failed to initiate payment.");
      }
    } catch (err: any) {
      setPaymentError(`Payment Error: ${err.message || "Failed to start payment."}`);
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  /* ─── loading ────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[var(--background)] paper-grain">
        <p className="text-display text-2xl gold-text">Loading booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-[var(--background)] paper-grain">
        <div className="text-center">
          <p className="text-display text-3xl text-[var(--maroon)]">{error || "Booking not found"}</p>
          <Link href="/profile" className="mt-6 inline-block text-xs uppercase tracking-widest border-b border-[var(--gold)] text-[var(--gold)] pb-1">
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

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
              Payment Successful
            </h2>
            <p className="text-muted-foreground font-serif text-lg animate-fade-up animate-fade-up-delay-2">
              Booking <span className="gold-text">#{booking.id}</span> has been confirmed.
            </p>
            {paymentMode === "partial" && isPartialEligible && (
              <p className="mt-3 text-sm font-serif text-[var(--maroon)] animate-fade-up animate-fade-up-delay-2 bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-4 py-2">
                ₹{depositAmount.toLocaleString()} deposit paid · Balance ₹{(adjustedTotal - depositAmount).toLocaleString()} due at check-in
              </p>
            )}
            <div className="mt-8 animate-fade-up animate-fade-up-delay-3 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[var(--gold)] border-t-transparent animate-spin" />
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">Redirecting to your profile...</p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen pt-28 pb-24 bg-gradient-to-b from-[oklch(0.96_0.022_85)] via-[oklch(0.93_0.04_70)] to-[oklch(0.95_0.03_80)] paper-grain">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="mb-10 text-center animate-fade-up">
            <p className="eyebrow text-[var(--maroon)]">Complete Payment</p>
            <h1 className="text-display text-4xl md:text-5xl mt-4 leading-[1.05]">
              Booking <em className="gold-text not-italic">#{booking.id}</em>
            </h1>
            <Ornament className="mx-auto mt-6 w-32 text-[var(--gold)]" />
          </div>

          {/* Already paid notice */}
          {alreadyPaid && (
            <div className="mb-8 p-5 bg-[oklch(0.45_0.13_150/0.08)] border border-[oklch(0.45_0.13_150/0.3)] flex items-center gap-4 animate-fade-up">
              <svg className="w-6 h-6 text-[oklch(0.45_0.13_150)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
              <div>
                <p className="font-medium text-[oklch(0.32_0.13_150)]">This booking has already been paid</p>
                <p className="text-sm text-muted-foreground font-serif mt-0.5">Payment status: <strong className="capitalize">{booking.payment_status}</strong></p>
              </div>
              <Link href="/profile" className="ml-auto text-xs uppercase tracking-widest text-[var(--gold)] hover:text-[var(--maroon)] transition-colors shrink-0">
                View Profile →
              </Link>
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">

            {/* Left: Coupon + Payment mode */}
            {isPending && (
              <div className="space-y-6 animate-fade-up">

                {paymentError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                    {paymentError}
                  </div>
                )}

                {/* Coupon */}
                <div className="bg-card border border-[var(--gold)]/30 p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-3 mb-4">
                    <svg className="w-5 h-5 text-[var(--gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l1.5-7.5M15 9.75l-1.5 7.5M5.25 9h13.5M5.25 15h13.5" />
                    </svg>
                    <h2 className="text-display text-xl text-[var(--maroon)]">Coupon Code</h2>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-[oklch(0.45_0.13_150/0.08)] border border-[oklch(0.45_0.13_150/0.3)]">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-[oklch(0.45_0.13_150)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
                        <div>
                          <p className="text-sm font-medium text-[oklch(0.32_0.13_150)]">{appliedCoupon.code} applied</p>
                          <p className="text-xs text-muted-foreground">{appliedCoupon.description} · Saving ₹{Math.round(couponDiscount).toLocaleString()}</p>
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
                          const isValid = new Date(c.valid_until) >= now && grandTotal >= c.min_amount;
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
                        {couponLoading && <div className="w-3.5 h-3.5 border border-parchment/30 border-t-parchment rounded-full animate-spin" />}
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

                {/* Payment Mode */}
                <div className="bg-card border border-[var(--gold)]/30 p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-3 mb-2">
                    <svg className="w-5 h-5 text-[var(--gold)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <h2 className="text-display text-xl text-[var(--maroon)]">Payment Option</h2>
                  </div>
                  <p className="text-xs text-muted-foreground mb-5 font-serif">
                    {isPartialEligible
                      ? `Your check-in is ${daysUntilCheckIn} days away — partial deposit available.`
                      : `Check-in is within 15 days — full payment is required.`}
                  </p>

                  <div className="space-y-3">
                    {/* Full */}
                    <label className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-300 ${paymentMode === "full" ? "border-[var(--maroon)] bg-[var(--maroon)]/5" : "border-[var(--gold)]/30 hover:border-[var(--gold)]/60"}`}>
                      <div className="relative mt-0.5 shrink-0">
                        <input type="radio" name="payMode" value="full" checked={paymentMode === "full"} onChange={() => setPaymentMode("full")} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "full" ? "border-[var(--maroon)]" : "border-[var(--gold)]/40"}`}>
                          {paymentMode === "full" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--maroon)]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">Full Payment</p>
                          <p className="text-display text-xl gold-text">₹{adjustedTotal.toLocaleString()}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-serif">Pay the complete amount now. No balance due at check-in.</p>
                      </div>
                    </label>

                    {/* Partial */}
                    <label className={`flex items-start gap-4 p-4 border transition-all duration-300 relative ${!isPartialEligible ? "border-[var(--gold)]/15 opacity-50 cursor-not-allowed" : paymentMode === "partial" ? "border-[var(--gold)] bg-[var(--gold)]/5 cursor-pointer" : "border-[var(--gold)]/30 hover:border-[var(--gold)]/60 cursor-pointer"}`}>
                      <div className="relative mt-0.5 shrink-0">
                        <input type="radio" name="payMode" value="partial" checked={paymentMode === "partial"} onChange={() => isPartialEligible && setPaymentMode("partial")} disabled={!isPartialEligible} className="sr-only" />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "partial" ? "border-[var(--gold)]" : "border-[var(--gold)]/40"}`}>
                          {paymentMode === "partial" && <div className="w-2.5 h-2.5 rounded-full bg-[var(--gold)]" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">Partial Deposit</p>
                            {!isPartialEligible && <span className="text-[9px] uppercase tracking-widest bg-[var(--gold)]/20 text-[var(--maroon)] px-2 py-0.5">Not available</span>}
                          </div>
                          {paymentMode === "partial" && isPartialEligible && (
                            <p className="text-display text-xl gold-text">₹{depositAmount.toLocaleString()}</p>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-serif">
                          {isPartialEligible ? "Pay a deposit now, balance due at check-in." : "Available only for bookings 15+ days before check-in."}
                        </p>

                        {paymentMode === "partial" && isPartialEligible && (
                          <div className="mt-4 space-y-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--maroon)]">Choose deposit amount</p>
                            <div className="flex gap-2">
                              {DEPOSIT_OPTIONS.map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => setDepositPct(pct)}
                                  className={`flex-1 py-2.5 text-xs uppercase tracking-widest border transition-all duration-200 ${depositPct === pct ? "bg-[var(--gold)] border-[var(--gold)] text-[var(--maroon-deep)] font-medium" : "border-[var(--gold)]/40 text-foreground hover:border-[var(--gold)]"}`}
                                >
                                  {pct}%
                                </button>
                              ))}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-serif">
                              <div className="p-2.5 bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-center">
                                <p className="text-muted-foreground mb-0.5">Pay now</p>
                                <p className="text-[var(--maroon)] font-medium">₹{depositAmount.toLocaleString()}</p>
                              </div>
                              <div className="p-2.5 bg-[var(--gold)]/5 border border-[var(--gold)]/15 text-center">
                                <p className="text-muted-foreground mb-0.5">Due at check-in</p>
                                <p className="text-[var(--maroon)] font-medium">₹{(adjustedTotal - depositAmount).toLocaleString()}</p>
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

                {/* Pay CTA */}
                <button
                  onClick={handlePayNow}
                  disabled={isInitiatingPayment}
                  className="w-full py-5 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-all duration-300 shadow-[var(--shadow-gold)] disabled:opacity-70 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {isInitiatingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                      <span>Opening payment gateway...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Pay ₹{amountToCharge.toLocaleString()} Now</span>
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

            {/* If already paid — show profile redirect */}
            {!isPending && (
              <div className="bg-card border border-[var(--gold)]/30 p-8 shadow-[var(--shadow-royal)] text-center animate-fade-up">
                <div className="w-16 h-16 rounded-full border border-[oklch(0.45_0.13_150/0.4)] bg-[oklch(0.45_0.13_150/0.08)] flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-[oklch(0.45_0.13_150)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5 5L20 7" />
                  </svg>
                </div>
                <h2 className="text-display text-3xl text-[var(--maroon)] mb-3">No Action Required</h2>
                <p className="font-serif text-muted-foreground mb-8">
                  Your booking has payment status: <strong className="text-foreground capitalize">{booking.payment_status}</strong>.<br />
                  No further action is needed.
                </p>
                <Link
                  href="/profile"
                  className="inline-block px-8 py-3 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors shadow-[var(--shadow-gold)]"
                >
                  Go to Profile
                </Link>
              </div>
            )}

            {/* Right: Booking summary sidebar */}
            <div className="bg-gradient-to-br from-[oklch(0.97_0.03_85)] to-[oklch(0.93_0.05_70)] border border-[var(--gold)]/30 p-8 sticky top-32 animate-fade-up animate-fade-up-delay-1">
              <p className="eyebrow text-[var(--gold)]">Booking Details</p>
              <h3 className="text-display text-2xl text-[var(--maroon)] mt-2">#{booking.id}</h3>

              <div className="mt-6 h-px bg-[var(--gold)]/30" />

              <div className="mt-5 space-y-3 text-sm font-serif">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span>{new Date(booking.check_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span>{new Date(booking.check_out_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{booking.number_of_nights} night{booking.number_of_nights !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span>{booking.number_of_adults} adult{booking.number_of_adults !== 1 ? "s" : ""}{booking.number_of_children > 0 ? `, ${booking.number_of_children} child` : ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`text-xs uppercase tracking-widest px-2 py-0.5 ${
                    booking.payment_status === "paid"
                      ? "bg-[oklch(0.45_0.13_150/0.12)] text-[oklch(0.32_0.13_150)]"
                      : "bg-[var(--gold)]/15 text-[var(--maroon)]"
                  }`}>{booking.payment_status}</span>
                </div>

                <div className="pt-3 border-t border-[var(--gold)]/30 flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest text-[var(--maroon)]">Total</span>
                  <span className="text-display text-2xl gold-text">₹{grandTotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-xs text-[oklch(0.45_0.13_150)]">
                    <span>Coupon discount</span>
                    <span>−₹{Math.round(couponDiscount).toLocaleString()}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-medium">
                    <span className="text-xs uppercase tracking-widest text-[var(--maroon)]">Adjusted Total</span>
                    <span className="text-display text-2xl gold-text">₹{adjustedTotal.toLocaleString()}</span>
                  </div>
                )}

                {paymentMode === "partial" && isPartialEligible && isPending && (
                  <div className="mt-2 p-3 bg-[var(--gold)]/10 border border-[var(--gold)]/25 text-xs font-serif text-center">
                    <p className="text-[var(--maroon)] font-medium">Paying {depositPct}% deposit: ₹{depositAmount.toLocaleString()}</p>
                    <p className="text-muted-foreground mt-0.5">Balance ₹{(adjustedTotal - depositAmount).toLocaleString()} at check-in</p>
                  </div>
                )}
              </div>

              {/* Trust */}
              <div className="mt-6 pt-6 border-t border-[var(--gold)]/20 space-y-2.5">
                {[
                  { icon: "🔒", text: "Secure payment via Razorpay" },
                  { icon: "✓", text: "Instant confirmation" },
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
    </>
  );
}
