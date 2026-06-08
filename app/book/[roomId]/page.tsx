"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { roomsApi, Room } from "@/lib/api/rooms";
import { bookingsApi, CreateBookingPayload } from "@/lib/api/bookings";
import { paymentApi } from "@/lib/api/payment";
import { getAccessToken } from "@/lib/api/apiClient";
import Script from "next/script";
import { Ornament } from "@/components/site/Ornament";
import { TransitionLink as Link } from "@/components/site/TransitionLink";

export default function BookRoomPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState<number | string>(1);
  const [children, setChildren] = useState<number | string>(0);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function fetchRoom() {
      try {
        const res = await roomsApi.getRoomById(Number(roomId));
        if (res.success) {
          setRoom(res.room);
        } else {
          setError("Room not found.");
        }
      } catch (err) {
        setError("Error loading room details.");
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      fetchRoom();
    }
  }, [roomId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    const payload: CreateBookingPayload = {
      room_id: Number(roomId),
      check_in_date: checkIn,
      check_out_date: checkOut,
      number_of_adults: Number(adults) || 1,
      number_of_children: Number(children) || 0,
      guests: [
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          is_primary: true,
        },
      ],
    };

    try {
      const res = await bookingsApi.createBooking(payload);
      if (res.success && res.booking) {
        setCreatedBookingId(res.booking.id);
      } else {
        setSubmitError(res.message || "Failed to create booking.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred during booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!createdBookingId) return;
    
    setIsInitiatingPayment(true);
    setSubmitError("");

    try {
      const paymentRes = await paymentApi.initiatePayment(createdBookingId);
      
      if (paymentRes.success && paymentRes.payment) {
        const { payment } = paymentRes;
        
        const options = {
          key: payment.key_id,
          amount: payment.amount_paise,
          currency: payment.currency,
          order_id: payment.order_id,
          name: "Kila Heritage",
          description: `Reservation #${createdBookingId}`,
          prefill: {
            name: payment.customer.name,
            email: payment.customer.email,
            contact: payment.customer.phone
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await paymentApi.verifyPayment(createdBookingId, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                setShowSuccess(true);
                setTimeout(() => {
                  router.push("/profile");
                }, 3500);
              } else {
                setSubmitError("Payment verification failed. Please check your profile.");
                setTimeout(() => router.push("/profile"), 2000);
              }
            } catch (err) {
               setSubmitError("Error verifying payment.");
               setTimeout(() => router.push("/profile"), 2000);
            }
          },
          theme: {
            color: "#5f181f" // var(--maroon)
          },
          modal: {
            ondismiss: function() {
              router.push("/profile");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        
        rzp.on('payment.failed', function (response: any){
           setSubmitError(response.error.description || "Payment failed.");
        });
        
        rzp.open();

      } else {
        setSubmitError(paymentRes.message || "Failed to initiate payment.");
      }
    } catch (paymentErr: any) {
      console.error("Payment initiation failed:", paymentErr);
      setSubmitError(`Payment Error: ${paymentErr.message || "Failed to start payment."}`);
    } finally {
      setIsInitiatingPayment(false);
    }
  };

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

  return (
    <>
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]/95 backdrop-blur-md transition-opacity duration-700">
          <div className="bg-card border border-[var(--gold)]/30 p-12 shadow-[var(--shadow-royal)] text-center max-w-md w-full mx-4 flex flex-col items-center">
            {/* Animated checkmark circle */}
            <div className="w-24 h-24 rounded-full border-2 border-[var(--gold)] flex items-center justify-center mb-8 animate-fade-up">
              <svg 
                className="w-12 h-12 text-[var(--gold)] animate-[pulse_2s_ease-in-out_infinite]" 
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
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
            <div className="mt-8 animate-fade-up animate-fade-up-delay-3 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-[var(--gold)] border-t-transparent animate-spin"></div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">
                Preparing your itinerary...
              </p>
            </div>
          </div>
        </div>
      )}

    <div className="min-h-screen pt-28 pb-24 bg-gradient-to-b from-[oklch(0.96_0.022_85)] via-[oklch(0.93_0.04_70)] to-[oklch(0.95_0.03_80)] paper-grain">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        
        <div className="mb-10 text-center animate-fade-up">
          <p className="eyebrow text-[var(--maroon)]">Reservation Details</p>
          <h1 className="text-display text-4xl md:text-5xl mt-4 leading-[1.05]">
            Complete your <em className="gold-text not-italic">booking</em>
          </h1>
          <Ornament className="mx-auto mt-6 w-32 text-[var(--gold)]" />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          
          {/* Form Section */}
          <div className="bg-card border border-[var(--gold)]/30 p-8 shadow-[var(--shadow-royal)] animate-fade-up">
            <h2 className="text-display text-3xl text-[var(--maroon)] mb-6">
              {!createdBookingId ? "Guest Information" : "Payment"}
            </h2>
            
            
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 text-sm">
                {submitError}
              </div>
            )}

            {!createdBookingId ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Check-in Date</label>
                    <input required type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Check-out Date</label>
                    <input required type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Adults</label>
                    <input required type="number" min="1" max={room.capacity} value={adults} onChange={(e) => setAdults(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Children</label>
                    <input required type="number" min="0" value={children} onChange={(e) => setChildren(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" />
                  </div>
                </div>

                <div className="mt-8 mb-4 h-px bg-gradient-to-r from-[var(--gold)]/40 to-transparent" />

                <div className="grid grid-cols-2 gap-4">
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
                    <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" placeholder="Email Address" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Phone Number</label>
                    <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-2 focus:outline-none focus:border-[var(--maroon)] text-foreground" placeholder="Phone Number" />
                  </div>
                </div>

                <button disabled={isSubmitting} type="submit" className="w-full mt-8 py-4 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.3em] hover:bg-[var(--maroon-deep)] transition-colors shadow-[var(--shadow-gold)] disabled:opacity-70">
                  {isSubmitting ? "Confirming..." : "Confirm Booking"}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 animate-fade-up">
                <div className="w-16 h-16 rounded-full border border-green-500/30 bg-green-50/50 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif mb-2 text-[var(--foreground)]">Reservation Secured</h3>
                <p className="text-sm text-muted-foreground mb-10 max-w-sm mx-auto">
                  Your booking <strong className="text-[var(--maroon)]">#{createdBookingId}</strong> has been created. Please complete your payment to finalize the reservation.
                </p>
                
                <button 
                  onClick={handlePayNow} 
                  disabled={isInitiatingPayment} 
                  className="w-full py-4 bg-[var(--gold)] text-[var(--maroon-deep)] font-medium text-xs uppercase tracking-[0.3em] hover:bg-[oklch(0.68_0.15_75)] transition-colors shadow-[var(--shadow-gold)] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isInitiatingPayment && <div className="w-4 h-4 border-2 border-[var(--maroon-deep)] border-t-transparent rounded-full animate-spin" />}
                  {isInitiatingPayment ? "Initiating..." : "Pay Now"}
                </button>
              </div>
            )}
          </div>

          {/* Room Summary Section */}
          <div className="bg-gradient-to-br from-[oklch(0.97_0.03_85)] to-[oklch(0.93_0.05_70)] border border-[var(--gold)]/30 p-8 sticky top-32 animate-fade-up animate-fade-up-delay-1">
            <p className="eyebrow text-[var(--gold)]">Your Stay</p>
            <h3 className="text-display text-3xl text-[var(--maroon)] mt-2">{room.name}</h3>
            
            {room.images && room.images.length > 0 && (
              <div className="aspect-[4/3] w-full mt-4 overflow-hidden border border-[var(--gold)]/20 shadow-sm">
                <img src={room.images[0]} alt={room.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm font-serif text-foreground/80">
              <span className="flex items-center gap-2">Max Capacity: {room.capacity}</span>
              <span className="flex items-center gap-2">Bed: {room.bed_type}</span>
            </div>

            <div className="mt-6 h-px bg-[var(--gold)]/30" />
            
            <div className="mt-6 flex justify-between items-center text-lg">
              <span className="font-serif">Base Rate:</span>
              <span className="text-display text-2xl gold-text">₹{room.price.toLocaleString()}</span>
            </div>
            
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-widest text-right">Per night • Taxes extra</p>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
