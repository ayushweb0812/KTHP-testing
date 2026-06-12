"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi, User } from '@/lib/api/auth';
import Link from 'next/link';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        if (mounted) {
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            const currentUrl = window.location.pathname + window.location.search;
            router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
          }
        }
      } catch (err: any) {
        if (mounted) {
          const currentUrl = window.location.pathname + window.location.search;
          router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
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
      <div className="min-h-screen paper-grain py-24 px-4 relative overflow-hidden flex justify-center">
        <div className="absolute inset-0 bg-[var(--gradient-vignette)] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-6xl mt-12 flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            {/* Profile Card Summary */}
            <div className="mb-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[var(--maroon)] text-[var(--gold)] flex items-center justify-center text-2xl font-serif mb-3 shadow-[var(--shadow-gold)]">
                {user.first_name ? user.first_name[0].toUpperCase() : 'G'}
              </div>
              <h3 className="text-lg font-serif text-[var(--foreground)]">{user.first_name} {user.last_name}</h3>
            </div>

            {/* Navigation Links */}
            <nav className="bg-[var(--card)] rounded-xl shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] overflow-hidden">
              <ul className="flex flex-col py-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                  return (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className={`flex items-center gap-3 px-6 py-4 text-sm transition-colors duration-300 ${isActive ? 'bg-[var(--gold)]/10 text-[var(--gold)] border-r-4 border-[var(--gold)]' : 'text-[var(--foreground)] hover:bg-[var(--gold)]/5 hover:text-[var(--gold)] border-r-4 border-transparent'}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={link.icon} />
                        </svg>
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center gap-3 px-6 py-4 text-sm text-[var(--muted-foreground)] hover:bg-red-500/5 hover:text-red-500 border-r-4 border-transparent transition-colors duration-300 mt-4 border-t border-[color-mix(in_oklab,var(--gold)_15%,transparent)]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow bg-[var(--card)] rounded-xl shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] min-h-[600px]">
            {children}
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
