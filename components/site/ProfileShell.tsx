"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, User } from '@/lib/api/auth';
import { bookingsApi, Booking, BookingRoom } from '@/lib/api/bookings';
import { roomsApi, Room } from '@/lib/api/rooms';
import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { useTransition } from "@/components/transitions/TransitionContext";

export default function ProfileShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { beginPageTransition } = useTransition();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [recentStays, setRecentStays] = useState<Booking[]>([]);
  const [completedStaysCount, setCompletedStaysCount] = useState(0);
  const [roomsMap, setRoomsMap] = useState<Record<number, Room>>({});

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchProfileData = async () => {
      try {
        const [profileRes, bookingsRes, roomsRes] = await Promise.all([
          authApi.getProfile(),
          bookingsApi.getMyBookings().catch(() => ({ success: false, bookings: [] })),
          roomsApi.getRooms().catch(() => ({ success: false, rooms: [] }))
        ]);

        if (mounted) {
          if (profileRes.success && profileRes.user) {
            setUser(profileRes.user);
          } else {
            const currentUrl = window.location.pathname + window.location.search;
            sessionStorage.setItem('auth_return_url', currentUrl);
            router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
            return;
          }

          if (bookingsRes.success && bookingsRes.bookings) {
            const now = new Date().getTime();
            const past = bookingsRes.bookings.filter((b: Booking) => 
              new Date(b.check_out_date).getTime() < now && b.status !== 'cancelled'
            );
            past.sort((a: Booking, b: Booking) => new Date(b.check_out_date).getTime() - new Date(a.check_out_date).getTime());
            setCompletedStaysCount(past.length);
            setRecentStays(past.slice(0, 2));
          }

          if (roomsRes.success && roomsRes.rooms) {
            const rMap: Record<number, Room> = {};
            roomsRes.rooms.forEach((r: Room) => rMap[r.id] = r);
            setRoomsMap(rMap);
          }
        }
      } catch (err: any) {
        if (mounted) {
          const currentUrl = window.location.pathname + window.location.search;
          sessionStorage.setItem('auth_return_url', currentUrl);
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfileData();
    return () => { mounted = false; };
  }, [router]);

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
    return null;
  }

  const navLinks = [
    { name: 'Personal Details', href: '/profile/personal-details', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { name: 'Payment Account', href: '/profile/payment-account', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Trips', href: '/profile/trips', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Wishlist', href: '/profile/wishlist', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { name: 'Reviews', href: '/profile/reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { name: 'Settings', href: '/profile/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  return (
    <>
      <div className="min-h-screen paper-grain bg-[var(--background)] pt-20">
        {/* Hero Banner */}
        <div className="relative h-[300px] md:h-[400px] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="/Hero screen/image2.png" alt="Palace Exterior" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 animate-fade-up">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--gold)] mb-3 flex items-center justify-center gap-4 before:h-[1px] before:w-8 before:bg-[var(--gold)] after:h-[1px] after:w-8 after:bg-[var(--gold)]">
              Your Account
            </p>
            <h1 className="text-display text-4xl md:text-5xl lg:text-6xl text-parchment capitalize mb-3">
              {pathname === '/profile/trips' ? 'My Bookings' :
                pathname === '/profile/settings' ? 'Settings' :
                  pathname === '/profile/payment-account' ? 'Payment Account' :
                    'Personal Details'}
            </h1>
            {pathname === '/profile/trips' ? (
              <p className="text-sm md:text-base text-parchment/90 font-medium tracking-wide mt-2">
                Every reservation, every receipt — kept with the care of a palace ledger.
              </p>
            ) : pathname === '/profile/settings' ? (
              <p className="text-sm md:text-base text-parchment/90 font-medium tracking-wide mt-2">
                Refine how the palace remembers and reaches you.
              </p>
            ) : (
              <p className="text-sm md:text-base text-gray-300 font-serif max-w-xl mx-auto mt-2">
                Manage your profile and stay preferences
              </p>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Left Sidebar (Profile Summary) */}
            {pathname !== '/profile/trips' && pathname !== '/profile/settings' && (
              <div className="w-full md:w-80 flex-shrink-0">
                <div className="bg-[var(--card)] border border-[var(--gold)]/20 p-8 shadow-sm flex flex-col items-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--gold)]/50" />

                  {/* Avatar */}
                  <div className="relative mb-4 mt-2">
                    <div className="w-24 h-24 rounded-full bg-[#f4ebd0] border border-[var(--gold)]/30 text-[var(--maroon)] flex items-center justify-center text-3xl font-serif shadow-sm">
                      {user ? ([user.first_name, user.last_name].filter(n => n && n !== 'null').map(n => n[0]).join('').toUpperCase() || 'U') : 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border border-[var(--gold)]/30 rounded-full flex items-center justify-center text-[var(--gold)] shadow-sm hover:bg-[var(--gold)]/5 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>

                  <h2 className="text-2xl font-serif text-[var(--foreground)] mb-2 mt-2">
                    {user ? ([user.first_name, user.last_name].filter(n => n && n !== 'null').join(' ') || 'Guest User') : 'Guest User'}
                  </h2>
                  <p className="text-[11px] text-[var(--muted-foreground)] mb-6">
                    Member Since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'May 2025'}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-[var(--foreground)] mb-8">
                    <span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span>
                    {completedStaysCount} Stay{completedStaysCount !== 1 ? 's' : ''} Completed
                  </div>

                  {/* Recent Stay */}
                  {recentStays.length > 0 && (
                    <div className="w-full border border-[var(--gold)]/15 p-5 relative mt-4">
                      <p className="text-[10px] text-[var(--muted-foreground)] tracking-widest absolute -top-[9px] left-4 bg-[var(--card)] px-2">Recent Stay{recentStays.length > 1 ? 's' : ''}</p>

                      {recentStays.map((booking, idx) => {
                        const bookingRooms: BookingRoom[] = booking.rooms?.length ? booking.rooms : (booking.room_id !== undefined ? [{ room_id: booking.room_id }] : []);
                        const mainRoom = bookingRooms.length > 0 ? roomsMap[bookingRooms[0].room_id ?? bookingRooms[0].id ?? 0] : undefined;
                        const roomName = bookingRooms.length > 1 ? `Multiple Rooms (${bookingRooms.length})` : mainRoom?.name || "Heritage Chamber";
                        const roomImage = mainRoom?.images?.[0];
                        
                        const formatShortDate = (dateStr: string) => {
                          if (!dateStr) return '-';
                          const d = new Date(dateStr);
                          return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                        };
                        
                        return (
                          <div key={booking.id} className={`flex gap-4 items-center ${idx === 0 && recentStays.length > 1 ? 'mb-6 pt-2' : ''}`}>
                            <div>
                              <h4 className="font-serif text-sm text-[var(--foreground)]">{roomName}</h4>
                              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">{formatShortDate(booking.check_in_date)} - {formatShortDate(booking.check_out_date)}</p>
                              <Link href="/profile/trips" onClick={beginPageTransition} className="text-[10px] text-[var(--gold)] mt-2 inline-block">View Stay &rarr;</Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-grow w-full min-h-[600px]">
              {children}
            </div>

          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] p-8 rounded-xl shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] max-w-sm w-full text-center">
            <h3 className="text-2xl font-serif text-[var(--gold)] mb-4">Logout</h3>
            <p className="text-[var(--muted-foreground)] mb-8">Are you sure you want to log out of your royal account?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-2 border border-[var(--gold)] text-[var(--gold)] rounded hover:bg-[var(--gold)]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  authApi.logout();
                  window.dispatchEvent(new Event('auth-change'));
                  window.location.href = '/';
                }}
                className="px-6 py-2 bg-[var(--gold)] text-[#4B0000] rounded hover:bg-[#e6c27a] transition-colors font-medium"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
