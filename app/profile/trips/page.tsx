"use client";

import React, { useEffect, useState } from 'react';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { paymentApi } from '@/lib/api/payment';
import { invoicesApi } from '@/lib/api/invoices';
import Script from 'next/script';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

type Tab = 'Active' | 'Confirmed' | 'Cancelled';

export default function TripsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Active');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');
  
  const [recentlyPaidIds, setRecentlyPaidIds] = useState<number[]>([]);
  const [isDownloading, setIsDownloading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let mounted = true;
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
    return () => { mounted = false; };
  }, []);

  const handlePayNow = async (bookingId: number) => {
    setError('');
    try {
      const paymentRes = await paymentApi.initiatePayment(bookingId);
      
      if (paymentRes.success && paymentRes.payment) {
        const { payment } = paymentRes;
        
        const options = {
          key: payment.razorpay_key,
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
                setRecentlyPaidIds(prev => [...prev, bookingId]);
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

      try {
        const invoiceData = await invoicesApi.getInvoiceByBooking(bookingId);
        if (invoiceData.success && invoiceData.invoice) {
          invoiceId = invoiceData.invoice.invoice?.id ?? (invoiceData.invoice as any).id;
          invoiceNumber = invoiceData.invoice.invoice?.invoice_number ?? invoiceNumber;
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

      if (!invoiceId) {
        throw new Error('No invoice ID available for download');
      }

      await invoicesApi.downloadInvoice(invoiceId, invoiceNumber);
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
    <div className="animate-fade-up">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--gold)]/20 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-serif text-[var(--foreground)]">Active Reservations</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">View & manage your current bookings here</p>
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
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const isPaid = booking.payment_status === 'paid' || booking.status === 'paid' || recentlyPaidIds.includes(booking.id);
              const roomName = booking.room_id === 1 ? "black room" : booking.room_id === 2 ? "luxury villa" : "Heritage Chamber";
              
              // Fallback image
              const fallbackImg = booking.room_id === 1 ? "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=200&auto=format&fit=crop" : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=200&auto=format&fit=crop";

              return (
                <div key={booking.id} className="border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] rounded-xl overflow-hidden flex flex-col md:flex-row bg-[var(--background)]/50">
                  {/* Image */}
                  <div className="w-full md:w-48 h-32 md:h-auto shrink-0 bg-[var(--card)]">
                    <img src={fallbackImg} alt={roomName} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-serif text-[var(--foreground)] capitalize">{roomName}</h3>
                        <p className="text-xs text-[var(--muted-foreground)]">Kila the heritage palace</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs border ${isPaid ? 'border-green-500 text-green-600' : 'border-[var(--accent)] text-[var(--accent)]'}`}>
                          {isPaid ? 'Confirmed' : 'Pending'}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">ID {booking.id}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-[var(--foreground)] mt-2">
                      <div className="flex gap-2">
                        <span className="text-[var(--muted-foreground)]">Check in :</span>
                        <span>{booking.check_in_date}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[var(--muted-foreground)]">Check out :</span>
                        <span>{booking.check_out_date}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[var(--muted-foreground)]">Guests :</span>
                        <span>{booking.number_of_adults} Adult{booking.number_of_adults > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      {isPaid ? (
                        <div className="text-sm font-medium">
                          Amount paid: <span className="font-serif">₹{booking.total_price}</span>
                        </div>
                      ) : (
                        <div className="text-sm font-medium">
                          Total: <span className="font-serif text-[var(--maroon)]">₹{booking.total_price}</span>
                        </div>
                      )}
                      
                      <div className="flex gap-4 items-center">
                        {isPaid && (
                           <button 
                             onClick={() => handleDownloadInvoice(booking.id)}
                             disabled={isDownloading[booking.id]}
                             className="text-[var(--gold)] text-xs font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
                           >
                             {isDownloading[booking.id] ? "Downloading..." : "Download Invoice"}
                           </button>
                        )}
                        {!isPaid && activeTab === 'Active' && (
                          <button 
                            onClick={() => handlePayNow(booking.id)}
                            className="text-[var(--maroon)] text-xs font-medium hover:underline flex items-center gap-1"
                          >
                            Pay Now
                          </button>
                        )}
                        <button className="text-blue-600 dark:text-blue-400 text-xs hover:underline ml-2">
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
  );
}
