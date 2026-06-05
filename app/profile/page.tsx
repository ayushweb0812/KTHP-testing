"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User } from '@/lib/api/auth';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { paymentApi } from '@/lib/api/payment';
import { invoicesApi } from '@/lib/api/invoices';
import Script from 'next/script';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  const [recentlyPaidIds, setRecentlyPaidIds] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let mounted = true;
    
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        if (mounted) {
          if (res.success && res.user) {
            setUser(res.user);
            
            // Fetch bookings in parallel safely
            bookingsApi.getMyBookings()
              .then(bRes => {
                if (mounted && bRes.success) {
                  setBookings(bRes.bookings || []);
                  setLoadingBookings(false);
                }
              })
              .catch(() => {
                if (mounted) setLoadingBookings(false);
              });

          } else {
            router.push('/login');
          }
        }
      } catch (err: any) {
        if (mounted) {
          if (err?.status !== 401) {
            console.warn("Failed to fetch profile", err);
          }
          router.push('/login');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [router]);

  const handlePayNow = async (bookingId: number) => {
    setError('');
    try {
      const paymentRes = await paymentApi.initiatePayment(bookingId);
      
      if (paymentRes.success && paymentRes.payment) {
        const { payment } = paymentRes;
        
        const options = {
          key: payment.key_id,
          amount: payment.amount_paise,
          currency: payment.currency,
          order_id: payment.order_id,
          name: "Kila Heritage",
          description: `Reservation #${bookingId}`,
          prefill: {
            name: payment.customer.name,
            email: payment.customer.email,
            contact: payment.customer.phone
          },
          handler: async function (response: any) {
            try {
              const verifyRes = await paymentApi.verifyPayment(bookingId, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
                // Add to recently paid for animation
                setRecentlyPaidIds(prev => [...prev, bookingId]);
                // Refresh bookings
                const bRes = await bookingsApi.getMyBookings();
                if (bRes.success) setBookings(bRes.bookings || []);
              } else {
                setError("Payment verification failed.");
              }
            } catch (err) {
               setError("Error verifying payment.");
            }
          },
          theme: {
            color: "#5f181f"
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
           setError(response.error.description || "Payment failed.");
        });
        rzp.open();
      } else {
        setError(paymentRes.message || "Failed to initiate payment.");
      }
    } catch (err: any) {
      console.error("Payment Error:", err);
      setError(`Payment Error: ${err.message || JSON.stringify(err)}`);
    }
  };

  const handleDownloadInvoice = async (bookingId: number) => {
    setIsDownloading(prev => ({ ...prev, [bookingId]: true }));
    setError('');
    try {
      let invoiceId: number | undefined;
      let invoiceNumber = `Kila_Invoice_${bookingId}`;

      // 1. Check if invoice already exists for this booking
      try {
        const invoiceData = await invoicesApi.getInvoiceByBooking(bookingId);
        console.log('[Invoice] Lookup response:', { bookingId, invoiceData });

        if (invoiceData.success && invoiceData.invoice) {
          // Backend returns nested: { invoice: { invoice: { id, invoice_number }, booking, ... } }
          invoiceId = invoiceData.invoice.invoice?.id ?? (invoiceData.invoice as any).id;
          invoiceNumber = invoiceData.invoice.invoice?.invoice_number ?? invoiceNumber;
        }
      } catch (lookupErr: any) {
        // 404 means no invoice yet — that's expected, we'll generate one
        if (lookupErr?.status !== 404) {
          console.warn('[Invoice] Lookup failed (non-404):', lookupErr);
        }
      }

      // 2. Generate invoice if it doesn't exist yet
      if (!invoiceId) {
        console.log('[Invoice] No existing invoice, generating for booking:', bookingId);
        const genData = await invoicesApi.generateInvoice(bookingId);
        console.log('[Invoice] Generate response:', genData);

        if (genData.success && genData.invoice_id) {
          invoiceId = genData.invoice_id;
          invoiceNumber = genData.invoice_number || invoiceNumber;
        } else {
          throw new Error(genData.message || 'Could not generate invoice');
        }
      }

      // 3. Download the PDF
      if (!invoiceId) {
        throw new Error('No invoice ID available for download');
      }

      console.log('[Invoice] Downloading PDF for invoiceId:', invoiceId);
      await invoicesApi.downloadInvoice(invoiceId, invoiceNumber);
    } catch (err: any) {
      console.error('[Invoice] Download Error:', err);
      setError(err.message || 'Failed to download invoice.');
    } finally {
      setIsDownloading(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen paper-grain flex items-center justify-center py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--gold)] tracking-[0.28em] uppercase text-sm">Loading Stays...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen paper-grain py-24 px-4 relative overflow-hidden flex justify-center">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-4xl mt-12 flex flex-col gap-8">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center bg-[var(--card)] px-6 py-4 rounded-lg shadow-sm border border-[color-mix(in_oklab,var(--gold)_30%,transparent)]">
          <p className="text-[var(--foreground)] font-serif text-lg">
            Welcome back, <span className="gold-text">{user.first_name || 'Guest'}</span>
          </p>
          <button 
            onClick={() => {
              authApi.logout();
              window.location.href = '/';
            }}
            className="px-4 py-1.5 border border-[var(--gold)] text-[var(--gold)] text-[10px] uppercase tracking-widest hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-all duration-500 rounded"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm text-center">
            {error}
          </div>
        )}

        {/* Bookings Section */}
        <div className="bg-[var(--card)] p-8 md:p-10 rounded-xl relative shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] animate-fade-up">
          <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6 text-center">Your Royal Stays</h2>
          
          {loadingBookings ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[var(--gold)]/40 rounded-lg">
              <p className="text-[var(--muted-foreground)] mb-4">You have no upcoming stays booked.</p>
              <Link href="/reserve" className="inline-block px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] transition-all rounded shadow-md">
                Book a Chamber
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const isRecentlyPaid = recentlyPaidIds.includes(booking.id);
                const isPaid = booking.payment_status === 'paid' || booking.status === 'paid' || isRecentlyPaid;

                return (
                  <div 
                    key={booking.id} 
                    className={`border p-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-700
                      ${isRecentlyPaid ? 'border-green-500/60 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.2)] scale-[1.01]' : 'border-[var(--gold)]/30 hover:border-[var(--gold)]/60'}
                    `}
                  >
                    <div>
                      <h3 className="text-lg font-serif text-[var(--foreground)] mb-1">Reservation #{booking.id}</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {booking.check_in_date} &rarr; {booking.check_out_date}
                      </p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-[var(--gold)] uppercase tracking-wider">Status:</span>
                        {isRecentlyPaid ? (
                          <span className="text-green-600 font-bold text-sm uppercase tracking-widest animate-pulse flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            Paid
                          </span>
                        ) : (
                          <span className={`font-medium text-sm capitalize ${isPaid ? 'text-green-600' : 'text-[var(--foreground)]'}`}>
                            {isPaid ? 'Paid' : (booking.payment_status || booking.status)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-[var(--gold)]/20 pt-4 sm:pt-0 mt-2 sm:mt-0 flex flex-col sm:items-end">
                      <p className="text-xl font-serif text-[var(--maroon)]">₹{booking.total_price}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1 mb-3">
                        {booking.number_of_nights} Night{booking.number_of_nights > 1 ? 's' : ''}, {booking.number_of_adults + booking.number_of_children} Guest{booking.number_of_adults + booking.number_of_children > 1 ? 's' : ''}
                      </p>
                      
                      {!isPaid && (
                        <button 
                          onClick={() => handlePayNow(booking.id)}
                          className="px-6 py-2 bg-[var(--maroon)] text-parchment text-[11px] font-medium uppercase tracking-widest hover:bg-[var(--maroon-deep)] transition-colors rounded shadow-md w-full sm:w-auto"
                        >
                          Pay Now
                        </button>
                      )}

                      {isPaid && (
                        <button 
                          onClick={() => handleDownloadInvoice(booking.id)}
                          disabled={isDownloading[booking.id]}
                          className="px-4 py-2 border border-[var(--gold)] text-[var(--gold)] bg-transparent text-[10px] uppercase tracking-widest hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-colors rounded disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                          {isDownloading[booking.id] ? (
                            <>
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                              Download Invoice
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
