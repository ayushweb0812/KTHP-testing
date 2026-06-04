"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, User, ProfileUpdatePayload } from '@/lib/api/auth';
import { bookingsApi, Booking } from '@/lib/api/bookings';
import { paymentApi } from '@/lib/api/payment';
import Script from 'next/script';
import { Ornament } from '@/components/site/Ornament';
import { TransitionLink as Link } from "@/components/site/TransitionLink";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileUpdatePayload>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        if (mounted) {
          if (res.success && res.user) {
            setUser(res.user);
            if (typeof window !== 'undefined' && window.location.search.includes('edit=true')) {
              setEditForm({
                first_name: res.user.first_name || '',
                last_name: res.user.last_name || '',
                phone: res.user.phone || '',
                gender: res.user.gender || '',
                birthday: res.user.birthday || '',
                address: res.user.address || '',
                country: res.user.country || '',
                zipcode: res.user.zipcode || '',
              });
              setIsEditing(true);
            }
            
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

  const handleEditClick = () => {
    if (user) {
      setEditForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        address: user.address || '',
        country: user.country || '',
        zipcode: user.zipcode || '',
      });
      setIsEditing(true);
      setError('');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    // Clean payload to prevent empty strings from crashing the backend
    const payload: ProfileUpdatePayload = {};
    for (const [key, value] of Object.entries(editForm)) {
      if (value !== '' && value !== null && value !== undefined) {
        // @ts-ignore
        payload[key] = value;
      }
    }

    try {
      const res = await authApi.updateProfile(payload);
      if (res.success && res.user) {
        setUser(res.user);
        setIsEditing(false);
        router.push('/reserve');
      } else {
        setError(res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePayNow = async (bookingId: number) => {
    setError('');
    try {
      const paymentRes = await paymentApi.initiatePayment(bookingId);
      
      if (paymentRes.success && paymentRes.payment) {
        const { order_id, amount_paise, key_id, customer } = paymentRes.payment;
        
        const options = {
          key: key_id,
          amount: amount_paise,
          currency: "INR",
          name: "Kothi Palace",
          description: `Reservation #${bookingId}`,
          order_id: order_id,
          handler: async function (response: any) {
            try {
              const verifyRes = await paymentApi.verifyPayment(bookingId, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              if (verifyRes.success) {
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
          prefill: {
            name: customer?.name || user?.name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
            email: customer?.email || user?.email,
            contact: customer?.contact || user?.phone,
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

  if (isLoading) {
    return (
      <div className="min-h-screen paper-grain flex items-center justify-center py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[var(--gold)] tracking-[0.28em] uppercase text-sm">Loading Profile...</p>
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
      
      <div className="relative z-10 w-full max-w-7xl mt-12 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
        <div className="bg-[var(--card)] p-8 md:p-10 rounded-xl relative shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] animate-fade-up h-fit">
          
          <div className="flex justify-center mb-6 opacity-80">
            <Ornament className="w-10 h-10 text-[var(--gold)]" />
          </div>

          <p className="eyebrow text-center mb-2">Royal Guest</p>
          <h1 className="text-display text-3xl md:text-4xl mb-8 text-center">
            <span className="gold-text">Your</span> Profile
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center">
            
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full border border-[var(--gold)] overflow-hidden mb-4 relative">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--background)] flex items-center justify-center text-3xl text-[var(--gold)]">
                    {user.first_name ? user.first_name[0] : 'K'}
                  </div>
                )}
              </div>
              <h2 className="text-xl text-[var(--foreground)] font-serif mb-1">{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Guest'}</h2>
              <p className="text-[var(--muted-foreground)] text-sm">{user.email}</p>
            </div>

            {/* Detailed Info */}
            <div className="w-full mt-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">First Name</h3>
                  {isEditing ? (
                    <input type="text" value={editForm.first_name || ''} onChange={(e) => setEditForm({...editForm, first_name: e.target.value})} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" placeholder="First Name" />
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.first_name || '—'}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Last Name</h3>
                  {isEditing ? (
                    <input type="text" value={editForm.last_name || ''} onChange={(e) => setEditForm({...editForm, last_name: e.target.value})} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" placeholder="Last Name" />
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.last_name || '—'}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Phone</h3>
                  {isEditing ? (
                    <input type="tel" value={editForm.phone || ''} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" placeholder="Phone Number" />
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.phone || '—'}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Gender</h3>
                  {isEditing ? (
                    <select value={editForm.gender || ''} onChange={(e) => setEditForm({...editForm, gender: e.target.value})} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm appearance-none">
                      <option value="" className="text-black">Select...</option>
                      <option value="male" className="text-black">Male</option>
                      <option value="female" className="text-black">Female</option>
                      <option value="other" className="text-black">Other</option>
                    </select>
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2 capitalize">{user.gender || '—'}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Birthday</h3>
                  {isEditing ? (
                    <input type="date" value={editForm.birthday || ''} onChange={(e) => setEditForm({...editForm, birthday: e.target.value})} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" />
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.birthday || '—'}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Country</h3>
                  {isEditing ? (
                    <input type="text" value={editForm.country || ''} onChange={(e) => setEditForm({...editForm, country: e.target.value})} className="w-full bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" placeholder="Country" />
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.country || '—'}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <h3 className="text-xs uppercase tracking-widest text-[var(--gold)] mb-1 opacity-80">Address</h3>
                  {isEditing ? (
                    <div className="flex gap-4">
                      <input type="text" value={editForm.address || ''} onChange={(e) => setEditForm({...editForm, address: e.target.value})} className="flex-1 bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" placeholder="Street Address" />
                      <input type="text" value={editForm.zipcode || ''} onChange={(e) => setEditForm({...editForm, zipcode: e.target.value})} className="w-1/3 bg-transparent border-b border-[var(--gold)]/40 py-1 focus:outline-none focus:border-[var(--maroon)] text-foreground text-sm" placeholder="Zipcode" />
                    </div>
                  ) : (
                    <p className="text-[var(--foreground)] border-b border-[color-mix(in_oklab,var(--gold)_20%,transparent)] pb-2">{user.address || '—'} {user.zipcode && `- ${user.zipcode}`}</p>
                  )}
                </div>

              </div>

              <div className="mt-10 flex flex-wrap justify-end gap-4">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-2 border border-muted-foreground text-muted-foreground text-xs uppercase tracking-[0.32em] hover:bg-muted-foreground/10 transition-all duration-500 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] shadow-[var(--shadow-gold)] transition-all duration-500 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleEditClick}
                      className="px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] shadow-[var(--shadow-gold)] transition-all duration-500"
                    >
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => {
                        authApi.logout();
                        window.location.href = '/';
                      }}
                      className="px-6 py-2 border border-[var(--gold)] text-[var(--gold)] text-xs uppercase tracking-[0.32em] hover:bg-[var(--gold)] hover:text-[var(--maroon-deep)] transition-all duration-500"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* Bookings Section */}
        <div className="bg-[var(--card)] p-8 md:p-10 rounded-xl relative shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] animate-fade-up h-fit" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-2xl font-serif text-[var(--foreground)] mb-6">Your Royal Stays</h2>
          
          {loadingBookings ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[var(--gold)]/40 rounded-lg">
              <p className="text-[var(--muted-foreground)] mb-4">You have no upcoming stays booked.</p>
              <Link href="/reserve" className="inline-block px-6 py-2 bg-[var(--maroon)] text-parchment text-xs uppercase tracking-[0.32em] hover:bg-[var(--maroon-deep)] transition-all">
                Book a Chamber
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-[var(--gold)]/30 p-6 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[var(--gold)]/60 transition-colors">
                  <div>
                    <h3 className="text-lg font-serif text-[var(--foreground)] mb-1">Reservation #{booking.id}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {booking.check_in_date} &rarr; {booking.check_out_date}
                    </p>
                    <p className="text-xs text-[var(--gold)] mt-2 uppercase tracking-wider">
                      Status: <span className="text-[var(--foreground)] font-medium">{booking.payment_status || booking.status}</span>
                    </p>
                  </div>
                  <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-[var(--gold)]/20 pt-4 sm:pt-0 mt-2 sm:mt-0 flex flex-col sm:items-end">
                    <p className="text-xl font-serif text-[var(--maroon)]">₹{booking.total_price}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">{booking.number_of_nights} Night{booking.number_of_nights > 1 ? 's' : ''}, {booking.number_of_adults + booking.number_of_children} Guest{booking.number_of_adults + booking.number_of_children > 1 ? 's' : ''}</p>
                    
                    {(booking.payment_status === 'pending' || booking.status === 'pending') && (
                      <button 
                        onClick={() => handlePayNow(booking.id)}
                        className="mt-3 px-4 py-1.5 bg-[var(--maroon)] text-parchment text-[10px] uppercase tracking-widest hover:bg-[var(--maroon-deep)] transition-colors self-start sm:self-end"
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
