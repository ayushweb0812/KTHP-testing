"use client";

import { TransitionLink as Link } from "@/components/site/TransitionLink";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { getAccessToken } from "@/lib/api";
import { useTransition } from "@/components/transitions/TransitionContext";
import { authApi, User } from "@/lib/api/auth";
import { bookingsApi } from "@/lib/api/bookings";
import { EnquiryModal } from "./EnquiryModal";
import { LoginModal } from "./LoginModal";

const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Heritage" },
  { href: "/reserve", label: "Bookings" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [loginOpen, setLoginOpen] = useState(false);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { startTransition } = useTransition();

  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const hasToken = !!getAccessToken();
      setIsAuthenticated(hasToken);
      if (hasToken) {
        try {
          const res = await authApi.getProfile();
          if (res.success && res.user) {
            setUser(res.user);
            const bookingsRes = await bookingsApi.getMyBookings();
            if (bookingsRes.success) {
              const now = new Date();
              now.setHours(0, 0, 0, 0); // Start of today
              const count = bookingsRes.bookings.filter(b => b.status !== 'cancelled' && new Date(b.check_in_date) >= now).length;
              setUpcomingCount(count);
            }
          }
        } catch (err) {
          // ignore
        }
      } else {
        setUser(null);
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth-change', checkAuth);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b border-[var(--gold)]/20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link href="/" onClick={startTransition} className="flex items-center gap-4 group">
            <img src="/logo (1).svg" alt="Kila The Heritage Palace" className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-700" />
            <div className="flex flex-col justify-center mt-1">
              <div className="text-[var(--foreground)] text-display text-2xl tracking-[0.2em] leading-none mb-1">KILA</div>
              <div className="text-[8px] uppercase tracking-[0.3em] text-[var(--muted-foreground)] leading-none">
                The Heritage Palace
              </div>
            </div>
          </Link>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={startTransition}
                className={`text-[10px] tracking-[0.2em] transition-colors duration-500 uppercase ${
                  pathname === n.href || (pathname?.startsWith('/reserve') && n.href === '/reserve')
                    ? "text-[var(--foreground)] font-medium"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-6">


            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-full border border-[var(--gold)]/40 bg-[#f4ebd0] flex items-center justify-center text-sm font-serif text-[var(--gold)] group-hover:border-[var(--gold)] transition-colors shrink-0">
                    {user ? ([user.first_name, user.last_name].filter(n => n && n !== 'null').map(n => n[0]).join('').toUpperCase() || 'U') : 'U'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--foreground)] tracking-wide">{user ? ([user.first_name, user.last_name].filter(n => n && n !== 'null').join(' ') || 'Guest') : 'User Profile'}</span>
                    <svg className={`w-3 h-3 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-[calc(100%+12px)] w-56 bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(31,38,135,0.07)] border border-[var(--gold)]/20 py-2 animate-fade-up z-50">
                    <Link href="/profile" onClick={() => { setProfileDropdownOpen(false); startTransition(); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--gold)]/10 text-[13px] text-[var(--foreground)] transition-colors mx-2 rounded-lg font-medium group">
                      <svg className="w-[18px] h-[18px] text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My Profile
                    </Link>
                    
                    <Link href="/profile/trips" onClick={() => { setProfileDropdownOpen(false); startTransition(); }} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--gold)]/10 text-[13px] text-[var(--foreground)] transition-colors mx-2 rounded-lg font-medium group">
                      <div className="flex items-center gap-3">
                        <svg className="w-[18px] h-[18px] text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                        My Booking
                      </div>
                      {upcomingCount > 0 && (
                        <span className="text-[9px] font-medium px-2 py-0.5 rounded text-[#2d7a31] bg-[#eef8ef] border border-[#a1d9a5]">
                          {upcomingCount} Upcoming
                        </span>
                      )}
                    </Link>

                    {/* Settings Page - Commented Out 
                    <Link href="/profile/settings" onClick={() => setProfileDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--gold)]/10 text-[13px] text-[var(--foreground)] transition-colors mx-2 rounded-lg font-medium group">
                      <svg className="w-[18px] h-[18px] text-[var(--muted-foreground)] group-hover:text-[var(--gold)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    */}

                    <div className="h-[1px] w-full bg-[var(--gold)]/10 my-2" />

                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }} 
                      className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--gold)]/10 text-[13px] text-[var(--foreground)] transition-colors mx-2 rounded-lg font-medium group"
                    >
                      <svg className="w-[18px] h-[18px] text-[var(--muted-foreground)] group-hover:text-[#4B0000] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setEnquiryOpen(true)}
                  className="px-6 py-2.5 border border-[var(--gold)] text-[var(--gold)] text-[10px] uppercase tracking-widest hover:bg-[var(--gold)] hover:text-[var(--background)] transition-all duration-500"
                >
                  Enquire Now
                </button>
                <button
                  onClick={() => setLoginOpen(true)}
                  className="px-6 py-2.5 bg-[var(--gold)] text-[var(--background)] text-[10px] uppercase tracking-widest hover:bg-[var(--gold)]/80 transition-all duration-500"
                >
                  Login
                </button>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2 transition-colors duration-500 text-[var(--gold)]"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden bg-[var(--background)] border-t border-[var(--gold)]/20">
            <div className="px-6 py-6 flex flex-col gap-5">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => { setOpen(false); startTransition(); }}
                  className="text-[var(--foreground)] text-xs uppercase tracking-widest"
                >
                  {n.label}
                </Link>
              ))}
              <div className="h-[1px] w-full bg-[var(--gold)]/10 my-2" />
              {isAuthenticated ? (
                <Link
                  href="/profile"
                  onClick={() => { setOpen(false); startTransition(); }}
                  className="px-6 py-3 bg-[var(--gold)] text-[var(--background)] text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  My Profile
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => { setOpen(false); setEnquiryOpen(true); }}
                    className="px-6 py-3 border border-[var(--gold)] text-[var(--gold)] text-xs uppercase tracking-widest text-center"
                  >
                    Enquire Now
                  </button>
                  <button
                    onClick={() => { setOpen(false); setLoginOpen(true); }}
                    className="px-6 py-3 bg-[var(--gold)] text-[var(--background)] text-xs uppercase tracking-widest text-center"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      <EnquiryModal isOpen={enquiryOpen} onClose={() => setEnquiryOpen(false)} enquiryType="General Enquiry" />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--card)] p-8 rounded-xl shadow-[var(--shadow-royal)] border border-[color-mix(in_oklab,var(--gold)_30%,transparent)] max-w-sm w-full text-center animate-fade-up">
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
                  setShowLogoutConfirm(false);
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
